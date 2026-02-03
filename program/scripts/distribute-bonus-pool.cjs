const anchor = require('@coral-xyz/anchor');
const { PublicKey, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function main() {
    // 1. Setup Provider
    process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899';
    const walletPath = process.env.ANCHOR_WALLET || path.join(require('os').homedir(), '.config/solana/id.json');
    process.env.ANCHOR_WALLET = walletPath;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    console.log("Connected wallet:", provider.wallet.publicKey.toString());

    // 2. Load IDL and Program
    const idlPath = path.resolve(__dirname, '../target/idl/staking_express.json');
    if (!fs.existsSync(idlPath)) {
        throw new Error("IDL not found at " + idlPath);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    const programId = new PublicKey(idl.address || 'E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy');
    const program = new anchor.Program(idl, provider);

    console.log(`Calling distributeBonusPool on program ${programId.toString()}...`);

    // 3. Derive PDAs
    const [globalConfig] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_config")],
        programId
    );
    const [stakingPool] = PublicKey.findProgramAddressSync(
        [Buffer.from("staking_pool")],
        programId
    );
    const [bonusPool] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonus_pool")],
        programId
    );

    console.log("Global Config PDA:", globalConfig.toString());
    console.log("Staking Pool PDA:", stakingPool.toString());
    console.log("Bonus Pool PDA:", bonusPool.toString());

    // 4. Call distributeBonusPool
    try {
        const tx = await program.methods
            .distributeBonusPool()
            .accounts({
                caller: provider.wallet.publicKey,
                globalConfig: globalConfig,
                stakingPool: stakingPool,
                bonusPool: bonusPool,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        console.log("✅ Bonus pool distribution triggered!");
        console.log("Tx Signature:", tx);
    } catch (e) {
        console.error("❌ Distribution failed:", e.toString());
        throw e;
    }
}

async function printBonusPoolExpiryTimestamp() {
    process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899';
    const walletPath = process.env.ANCHOR_WALLET || path.join(require('os').homedir(), '.config/solana/id.json');
    process.env.ANCHOR_WALLET = walletPath;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const idlPath = path.resolve(__dirname, '../target/idl/staking_express.json');
    if (!fs.existsSync(idlPath)) {
        throw new Error("IDL not found at " + idlPath);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    const programId = new PublicKey(idl.address || 'E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy');
    const program = new anchor.Program(idl, provider);

    const [bonusPool] = PublicKey.findProgramAddressSync([
        Buffer.from('bonus_pool')
    ], programId);

    console.log('Bonus Pool PDA:', bonusPool.toString());

    try {
        const bonus = await program.account.bonusPool.fetch(bonusPool);

        // expiryTimestamp is an i64 in Rust => BN in JS
        console.log('expiryTimestamp (BN):', bonus.expiryTimestamp.toString());
        // numeric (seconds since epoch)
        const expiryNum = bonus.expiryTimestamp.toNumber();
        console.log('expiryTimestamp (number):', expiryNum);
        console.log('expiryTimestamp (ISO):', new Date(expiryNum * 1000).toISOString());
    } catch (err) {
        console.error('Failed to fetch bonus pool account:', err?.toString ? err.toString() : err);
        process.exit(1);
    }
}

async function printCurrentTimestamp() {
    process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899';
    const walletPath = process.env.ANCHOR_WALLET || path.join(require('os').homedir(), '.config/solana/id.json');
    process.env.ANCHOR_WALLET = walletPath;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const conn = provider.connection;

    // Method 1: Use current slot -> block time
    const slot = await conn.getSlot();
    const blockTime = await conn.getBlockTime(slot);

    console.log('Current slot:', slot);
    console.log('Block time (unix seconds):', blockTime);
    console.log('Block time (ISO):', blockTime ? new Date(blockTime * 1000).toISOString() : 'null');

    // Method 2: (Optional) Try to read Clock sysvar account's data raw
    try {
        const SYSVAR_CLOCK = new PublicKey('SysvarC1ock11111111111111111111111111111111');
        const acct = await conn.getAccountInfo(SYSVAR_CLOCK);
        if (acct && acct.data) {
            console.log('Fetched Clock sysvar raw data length:', acct.data.length);
            // Do not attempt to decode binary layout here; prefer blockTime above.
        } else {
            console.log('Clock sysvar not available');
        }
    } catch (e) {
        console.warn('Failed to fetch Clock sysvar account:', e?.toString ? e.toString() : e);
    }
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

/*printBonusPoolExpiryTimestamp().catch(err => {
    console.error(err);
    process.exit(1);
});

printCurrentTimestamp().catch(err => {
    console.error(err);
    process.exit(1);
});*/
