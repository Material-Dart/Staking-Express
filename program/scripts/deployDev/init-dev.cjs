const anchor = require("@coral-xyz/anchor");
const { Keypair, PublicKey } = require("@solana/web3.js");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

async function deployDev() {
    // 1. Setup Provider
    process.env.ANCHOR_PROVIDER_URL = "https://api.devnet.solana.com";
    process.env.ANCHOR_WALLET = process.env.ANCHOR_WALLET || path.join(require("os").homedir(), ".config/solana/id.json");

    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    // 2. Deploy the program
    console.log("Deploying program to DevNet...");
    try {
        execSync("anchor deploy --provider.cluster devnet", {
            stdio: "inherit",
            cwd: path.resolve(__dirname, "../.."),
            env: { ...process.env, ANCHOR_PROVIDER_URL: "https://api.devnet.solana.com", ANCHOR_WALLET: process.env.ANCHOR_WALLET }
        });
        console.log("✅ Program deployed successfully!");
    } catch (e) {
        console.error("❌ Deployment failed:", e.message);
        throw e;
    }

    // 3. Load IDL and Program
    const idlPath = path.resolve(__dirname, "../../target/idl/staking_express.json");
    if (!fs.existsSync(idlPath))
        throw new Error("IDL not found at: " + idlPath);

    const idl = JSON.parse(fs.readFileSync(idlPath, "utf8"));

    // Use the address from the deployed artifact or IDL if present, otherwise hardcoded from logs
    console.log(`Initializing program ${(new PublicKey(idl.address || "E22THkjryJG3wskBBFQLqKpB4nPkAVUdLZHY1WMLn8gy")).toString()}...`);

    // 4. Prepare Accounts
    const treasurySecretKeyPath = path.resolve(__dirname, "./treasury.json");
    if (!fs.existsSync(treasurySecretKeyPath))
        throw new Error("treasury.json not found at: " + treasurySecretKeyPath);
    const treasury = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(treasurySecretKeyPath, "utf8"))));

    const materialDartWalletSecretKeyPath = path.resolve(__dirname, "./materialDartWallet.json");
    if (!fs.existsSync(materialDartWalletSecretKeyPath))
        throw new Error("materialDartWallet.json not found at: " + materialDartWalletSecretKeyPath);
    const materialDartWallet = Keypair.fromSecretKey(new Uint8Array(JSON.parse(fs.readFileSync(materialDartWalletSecretKeyPath, "utf8"))));

    console.log("Treasury Public Key:", treasury.publicKey.toString());
    console.log("Material Dart Wallet Public Key:", materialDartWallet.publicKey.toString());

    // 4. Send Initialize Transaction
    try {
        console.log("Tx Signature:", await (
            new anchor.Program(idl, provider))
            .methods
            .initialize().accounts({ authority: provider.wallet.publicKey, treasury: treasury.publicKey, materialDartWallet: materialDartWallet.publicKey }).rpc());
        console.log("✅ Initialization successful!");
    } catch (e) {
        if (e.toString().includes("already in use"))
            console.log("⚠️  Program already initialized (Account already in use).");
        else {
            console.error("❌ Initialization failed:", e);
            throw e;
        }
    }
}

deployDev().catch(err => {
    console.error(err);
    process.exit(1);
});