const anchor = require('@coral-xyz/anchor');
const { Keypair, PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function main() {
    // 1. Setup Provider
    process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899';
    const walletPath = process.env.ANCHOR_WALLET || path.join(require('os').homedir(), '.config/solana/id.json');
    process.env.ANCHOR_WALLET = walletPath;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // 2. Load IDL and Program
    const idlPath = path.resolve(__dirname, '../target/idl/staking_express.json');
    if (!fs.existsSync(idlPath)) {
        throw new Error("IDL not found at " + idlPath);
    }
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));

    // Use the address from the deployed artifact or IDL if present, otherwise hardcoded from logs
    const programId = new PublicKey(idl.address || 'E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy');
    const program = new anchor.Program(idl, provider);

    console.log(`Initializing program ${programId.toString()}...`);

    // 3. Prepare Accounts
    const treasury = Keypair.generate();
    const materialDartWallet = Keypair.generate();

    console.log("Treasury:", treasury.publicKey.toString());
    console.log("Material Dart Wallet:", materialDartWallet.publicKey.toString());

    // 4. Fund these accounts to satisfy rent-exemption for fees
    console.log("Funding wallets...");
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(treasury.publicKey, 0.1 * anchor.web3.LAMPORTS_PER_SOL),
        "confirmed"
    );
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(materialDartWallet.publicKey, 0.1 * anchor.web3.LAMPORTS_PER_SOL),
        "confirmed"
    );

    // 4. Send Initialize Transaction
    try {
        const tx = await program.methods
            .initialize()
            .accounts({
                authority: provider.wallet.publicKey,
                treasury: treasury.publicKey,
                materialDartWallet: materialDartWallet.publicKey,
            })
            .rpc();

        console.log("✅ Initialization successful!");
        console.log("Tx Signature:", tx);
    } catch (e) {
        if (e.toString().includes("already in use")) {
            console.log("⚠️  Program already initialized (Account already in use).");
        } else {
            console.error("❌ Initialization failed:", e);
            throw e;
        }
    }
}

async function showMyWallet() {
    process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899';
    const walletPath = process.env.ANCHOR_WALLET || path.join(require('os').homedir(), '.config/solana/id.json');
    process.env.ANCHOR_WALLET = walletPath;
    console.log("Using wallet at:", walletPath);

    const provider = anchor.AnchorProvider.env();

    console.log("My Wallet Public Key:", provider.wallet.publicKey);
}

/*main().catch(err => {
    console.error(err);
    process.exit(1);
});*/

showMyWallet().catch(err => {
    console.error(err);
    process.exit(1);
});
