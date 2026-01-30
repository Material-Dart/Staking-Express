const anchor = require('@coral-xyz/anchor');
const { PublicKey } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');

async function main() {
    process.env.ANCHOR_PROVIDER_URL = 'http://127.0.0.1:8899';
    const walletPath = path.join(require('os').homedir(), '.config/solana/id.json');
    process.env.ANCHOR_WALLET = walletPath;

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const idlPath = path.resolve(__dirname, '../target/idl/staking_express.json');
    const idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
    const program = new anchor.Program(idl, provider);

    const [globalConfigPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("global_config")],
        program.programId
    );

    console.log("Fetching global config from:", globalConfigPDA.toString());
    const config = await program.account.globalConfig.fetch(globalConfigPDA);

    console.log("Treasury:", config.treasury.toString());
    console.log("Material Dart Wallet:", config.materialDartWallet.toString());

    console.log("Funding wallets...");

    const amount = 1 * anchor.web3.LAMPORTS_PER_SOL; // 1 SOL

    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(config.treasury, amount),
        "confirmed"
    );
    await provider.connection.confirmTransaction(
        await provider.connection.requestAirdrop(config.materialDartWallet, amount),
        "confirmed"
    );

    console.log("✅ Wallets funded successfully!");
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
