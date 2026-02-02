import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { StakingExpress } from "../target/types/staking_express";
import { expect } from "chai";

describe("staking-express", () => {
    // Configure the client to use the local cluster
    const provider = anchor.AnchorProvider.env();
    anchor.setProvider(provider);

    const program = anchor.workspace.StakingExpress as Program<StakingExpress>;

    // PDAs
    let globalConfig: anchor.web3.PublicKey;
    let stakingPool: anchor.web3.PublicKey;
    let bonusPool: anchor.web3.PublicKey;
    let referralPool: anchor.web3.PublicKey;
    let treasury: anchor.web3.Keypair;
    let materialDartWallet: anchor.web3.Keypair;

    // Constants

    before(async () => {
        // Generate keypairs
        treasury = anchor.web3.Keypair.generate();
        materialDartWallet = anchor.web3.Keypair.generate();

        // Derive PDAs with CORRECT SEEDS (underscores)
        [globalConfig] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("global_config")],
            program.programId
        );
        [stakingPool] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("staking_pool")],
            program.programId
        );
        [bonusPool] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("bonus_pool")],
            program.programId
        );
        [referralPool] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("referral_pool")],
            program.programId
        );
    });

    it("Is initialized!", async () => {
        try {
            const tx = await program.methods
                .initialize()
                .accounts({
                    authority: provider.wallet.publicKey,
                    treasury: treasury.publicKey,
                    materialDartWallet: materialDartWallet.publicKey,
                })
                .rpc();

            console.log("Your transaction signature", tx);

            // Verify state
            const configAccount = await program.account.globalConfig.fetch(globalConfig);
            expect(configAccount.authority.toString()).to.equal(provider.wallet.publicKey.toString());
            expect(configAccount.treasury.toString()).to.equal(treasury.publicKey.toString());
            expect(configAccount.materialDartWallet.toString()).to.equal(materialDartWallet.publicKey.toString());

            const poolAccount = await program.account.stakingPool.fetch(stakingPool);
            expect(poolAccount.totalStaked.toNumber()).to.equal(0);

            const bonusAccount = await program.account.bonusPool.fetch(bonusPool);
            expect(bonusAccount.expiryTimestamp.toNumber()).to.be.gt(0);

        } catch (e) {
            if (!e.toString().includes("already in use")) {
                console.error(e);
                throw e;
            }
        }
    });

    it("Stakes SOL", async () => {
        // Create a test user
        const user = anchor.web3.Keypair.generate();

        // Airdrop SOL
        const signature = await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(signature);

        // User stake PDA (Correct seed: user_stake)
        const [userStake] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_stake"), user.publicKey.toBuffer(), stakingPool.toBuffer()],
            program.programId
        );

        const stakeAmount = new anchor.BN(1 * anchor.web3.LAMPORTS_PER_SOL); // 1 SOL

        // Stake 1 SOL
        await program.methods
            .stake(stakeAmount)
            .accounts({
                user: user.publicKey,
                treasury: treasury.publicKey,
                materialDartWallet: materialDartWallet.publicKey,
                referrer: null,
            })
            .signers([user])
            .rpc();

        // Verify balances

        // 1. Treasury should have 100 BPS (1%) -> 0.01 SOL
        const treasuryBalance = await provider.connection.getBalance(treasury.publicKey);
        expect(treasuryBalance).to.equal(10_000_000);

        // 2. Material Dart should have 50 BPS (0.5%) -> 0.005 SOL
        const materialDartBalance = await provider.connection.getBalance(materialDartWallet.publicKey);
        expect(materialDartBalance).to.equal(5_000_000);

        // 3. Bonus Pool should have 100 BPS (1%) -> 0.01 SOL
        const bonusAccount = await program.account.bonusPool.fetch(bonusPool);
        expect(bonusAccount.balance.toNumber()).to.equal(10_000_000);

        // 4. Referral Pool should have 50 BPS (0.5%) (since no referrer) -> 0.005 SOL
        const referralAccount = await program.account.referralPool.fetch(referralPool);
        expect(referralAccount.balance.toNumber()).to.equal(5_000_000);

        // 5. Staking Pool (Vault) should have 97% of 1 SOL (90% net + 7% stakers fee) -> 0.97 SOL
        const poolAccount = await program.account.stakingPool.fetch(stakingPool);
        expect(poolAccount.totalStaked.toString()).to.equal("900000000"); // 0.9 SOL (Net Amount Logged)

        // Verify the VAULT BALANCE holds the funds (0.97 SOL)
        const poolBalance = await provider.connection.getBalance(stakingPool);
        console.log("Pool Balance (lamports):", poolBalance);
        expect(poolBalance).to.be.gt(970_000_000);

        console.log("Staking test passed!");
    });

    it("Unstakes SOL", async () => {
        // Create new user for unstake test
        const user = anchor.web3.Keypair.generate();
        const signature = await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(signature);

        // User stake PDA (Correct seed: user_stake)
        const [userStake] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_stake"), user.publicKey.toBuffer(), stakingPool.toBuffer()],
            program.programId
        );

        // 1. Stake 1 SOL
        await program.methods.stake(new anchor.BN(1_000_000_000)).accounts({
            user: user.publicKey,
            treasury: treasury.publicKey,
            materialDartWallet: materialDartWallet.publicKey,
            referrer: null,
        }).signers([user]).rpc();

        // 2. Unstake 0.9 SOL (the entire staked balance)
        const balanceBefore = await provider.connection.getBalance(user.publicKey);

        await program.methods.unstake(new anchor.BN(900_000_000)).accounts({
            user: user.publicKey,
            treasury: treasury.publicKey,
            materialDartWallet: materialDartWallet.publicKey,
            referrer: null,
        }).signers([user]).rpc();

        // Verify user stake is 0
        let userStakeAccount = await program.account.userStakeState.fetch(userStake);
        expect(userStakeAccount.stakedAmount.toString()).to.equal("0");

        // Verify balance return
        // Unstaked 0.9 SOL. 
        // Fee = 10% of 0.9 = 0.09 SOL.
        // Net Returned = 0.81 SOL = 810_000_000 lamports.
        // User pays tx fees, so slightly less.
        const balanceAfter = await provider.connection.getBalance(user.publicKey);
        const diff = balanceAfter - balanceBefore;
        console.log("Unstake return:", diff);

        // Allow small margin for gas
        expect(diff).to.be.gt(809_000_000);
        expect(diff).to.be.lt(810_000_005);
    });

    it("Rewards Claiming with Multiple Users (Dynamic)", async () => {
        // Fetch baseline
        let poolAccount = await program.account.stakingPool.fetch(stakingPool);
        let initialTotalStaked = poolAccount.totalStaked.toNumber(); // e.g. 1.8 SOL

        console.log("Initial Total Staked:", initialTotalStaked);

        // User A
        const userA = anchor.web3.Keypair.generate();
        const sigA = await provider.connection.requestAirdrop(userA.publicKey, 11 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(sigA);
        const [userStakeA] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_stake"), userA.publicKey.toBuffer(), stakingPool.toBuffer()],
            program.programId
        );

        // User B
        const userB = anchor.web3.Keypair.generate();
        const sigB = await provider.connection.requestAirdrop(userB.publicKey, 11 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(sigB);
        const [userStakeB] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_stake"), userB.publicKey.toBuffer(), stakingPool.toBuffer()],
            program.programId
        );

        // 1. User A stakes 10 SOL
        const stakeAmount = new anchor.BN(10_000_000_000); // 10 SOL
        const netStakeA = 9_000_000_000; // 90%

        await program.methods.stake(stakeAmount).accounts({
            user: userA.publicKey,
            treasury: treasury.publicKey,
            materialDartWallet: materialDartWallet.publicKey,
            referrer: null,
        }).signers([userA]).rpc();

        // 2. User B stakes 10 SOL
        // Fee from B = 0.7 SOL (700 BPS of 10 SOL) -> 700_000_000 lamports
        // Distributed to: initialTotalStaked + netStakeA
        const rewardFee = 700_000_000;
        const rewardPoolSize = initialTotalStaked + netStakeA;

        // Check zero div
        expect(rewardPoolSize).to.be.gt(0);

        // Expected Reward Per Share Delta (Precision 1e12)
        // We can just calculate User A's share ratio: netStakeA / rewardPoolSize
        const expectedRewardA = Math.floor((netStakeA / rewardPoolSize) * rewardFee);

        console.log(`Expected Ratio: ${netStakeA}/${rewardPoolSize} = ${netStakeA / rewardPoolSize}`);
        console.log("Expected Reward for A:", expectedRewardA);

        await program.methods.stake(stakeAmount).accounts({
            user: userB.publicKey,
            treasury: treasury.publicKey,
            materialDartWallet: materialDartWallet.publicKey,
            referrer: null,
        }).signers([userB]).rpc();

        // 3. Claim
        const balanceBefore = await provider.connection.getBalance(userA.publicKey);

        await program.methods.claimRewards().accounts({
            user: userA.publicKey,
        }).signers([userA]).rpc();

        const balanceAfter = await provider.connection.getBalance(userA.publicKey);
        const claimAmount = balanceAfter - balanceBefore;
        console.log("User A Claimed:", claimAmount);

        // Allow tiny rounding/tx fee margin (though claimRewards is tx fee paid by user, 
        // the balance delta includes tx fee payment, so claimAmount = rewards - tx_fee)
        // So claimAmount should be slightly LESS than expectedRewardA.
        // But in localnet, tx fee is fixed (5000 lamports).

        expect(claimAmount).to.be.closeTo(expectedRewardA - 5000, 100000); // 100,000 lamport tolerance
    });

    it("Referral Logic", async () => {
        // User with Referrer
        const referrer = anchor.web3.Keypair.generate();
        const user = anchor.web3.Keypair.generate();

        // Airdrop
        const sigR = await provider.connection.requestAirdrop(referrer.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        const sigU = await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(sigR);
        await provider.connection.confirmTransaction(sigU);

        // Referrer needs a System Account (just keypair is enough for SOL transfer) 
        // BUT program checks `referrer_account.key() == referrer_pubkey`.
        // AND user_stake.referrer must be set.
        // Wait, `user_stake.referrer` is set ON INITIALIZE/UPDATE?
        // No, `stake` instruction allows passing logic...
        // Ah, `stake` handler creates/updates `user_stake` account.
        // If it's a new stake, it sets the referrer if provided?
        // Let's check `stake.rs`:
        // if user_stake.staked_amount == 0 && user_stake.referrer.is_none() { user_stake.referrer = referrer.key(); }

        const [userStake] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_stake"), user.publicKey.toBuffer(), stakingPool.toBuffer()],
            program.programId
        );

        const stakeAmount = new anchor.BN(1_000_000_000); // 1 SOL
        const referrerBalanceBefore = await provider.connection.getBalance(referrer.publicKey);

        await program.methods.stake(stakeAmount).accounts({
            user: user.publicKey,
            treasury: treasury.publicKey,
            materialDartWallet: materialDartWallet.publicKey,
            referrer: referrer.publicKey, // Passed here
        }).signers([user]).rpc();

        // Verify Referrer got 50 BPS (0.5%) = 0.005 SOL = 5,000,000 lamports
        const referrerBalanceAfter = await provider.connection.getBalance(referrer.publicKey);
        const diff = referrerBalanceAfter - referrerBalanceBefore;

        expect(diff).to.equal(5_000_000);
        console.log("Referral payout verified:", diff);
    });

    it("Bonus Pool Extension", async () => {
        // Fetch Bonus Pool
        let bonusAccount = await program.account.bonusPool.fetch(bonusPool);
        const initialExpiry = bonusAccount.expiryTimestamp.toNumber();

        // Stake 1 SOL (Should extend by 15 mins = 900 seconds)
        // Note: Max cap 48h check might apply.

        const user = anchor.web3.Keypair.generate();
        const sig = await provider.connection.requestAirdrop(user.publicKey, 2 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(sig);

        const [userStake] = anchor.web3.PublicKey.findProgramAddressSync(
            [Buffer.from("user_stake"), user.publicKey.toBuffer(), stakingPool.toBuffer()],
            program.programId
        );

        await program.methods.stake(new anchor.BN(1_000_000_000)).accounts({
            user: user.publicKey,
            treasury: treasury.publicKey,
            materialDartWallet: materialDartWallet.publicKey,
            referrer: null,
        }).signers([user]).rpc();

        bonusAccount = await program.account.bonusPool.fetch(bonusPool);
        const newExpiry = bonusAccount.expiryTimestamp.toNumber();

        // Since transaction takes time, current_timestamp updates.
        // New Expiry = current_time + remaining_time + extension.
        // Hard to check exact timestamp delta.
        // But newExpiry should be > initialExpiry + small delta.
        // Actually, if it was just initialized/reset to 12h.
        // Stake adds 15m.

        expect(newExpiry).to.be.gt(initialExpiry);
        console.log("Bonus expiry extended by:", newExpiry - initialExpiry);
    });

    it("Distributes Referral Pool (Forced)", async () => {
        // Ensure some balance in referral pool
        // We know from previous tests it has 50 BPS (0.005 SOL) from "Stakes SOL" test 
        // + 0 from "Referral Logic" test (that one paid referrer directly).
        // Let's add more balance to be sure.
        // We can just transfer SOL to the PDA directly? 
        // No, PDAs only accept SOL if the program allows or if it's from system program via raw transfer?
        // System program transfer works TO a PDA.

        // We must check the LOGICAL balance stored in the account, not physical lamports (which includes rent).
        let referralAccount = await program.account.referralPool.fetch(referralPool);
        const initialBalance = referralAccount.balance.toNumber();
        console.log("Initial Referral Pool Balance (Logical):", initialBalance);

        // Distribute forced
        await program.methods.distributeReferralPool(true).accounts({
            authority: provider.wallet.publicKey,
        }).rpc();

        // Verify split
        // 50% carried forward.
        referralAccount = await program.account.referralPool.fetch(referralPool);
        console.log("New Referral Pool Balance (Carry Forward):", referralAccount.balance.toNumber());

        // Split should be exactly half (or off by 1 due to rounding)
        expect(referralAccount.balance.toNumber()).to.be.closeTo(initialBalance / 2, 1);
    });

    it("Distributes Bonus Pool (Expect Error)", async () => {
        // Should fail because not expired
        try {
            await program.methods.distributeBonusPool().accounts({
                caller: provider.wallet.publicKey,
                globalConfig: globalConfig,
                stakingPool: stakingPool,
                bonusPool: bonusPool,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).rpc();
            expect.fail("Should have failed with BonusNotExpired");
        } catch (e) {
            expect(e.error.errorCode.code).to.equal("BonusNotExpired");
        }
    });

    it("Distributes Bonus Pool (Non-admin Unauthorized)", async () => {
        // Create random user who is NOT the admin
        const nonAdmin = anchor.web3.Keypair.generate();
        const sig = await provider.connection.requestAirdrop(nonAdmin.publicKey, 1 * anchor.web3.LAMPORTS_PER_SOL);
        await provider.connection.confirmTransaction(sig);

        try {
            await program.methods.distributeBonusPool().accounts({
                caller: nonAdmin.publicKey,
                globalConfig: globalConfig,
                stakingPool: stakingPool,
                bonusPool: bonusPool,
                systemProgram: anchor.web3.SystemProgram.programId,
            }).signers([nonAdmin]).rpc();
            expect.fail("Should have failed with Unauthorized");
        } catch (e) {
            expect(e.error.errorCode.code).to.equal("Unauthorized");
        }
    });
});
