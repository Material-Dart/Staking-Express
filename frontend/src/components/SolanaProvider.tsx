"use client";

import React, { useMemo } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
    WalletModalProvider,
} from "@solana/wallet-adapter-react-ui";
import { RPC_ENDPOINT } from "@/lib/constants";

// Default styles that can be overridden by your app
import "@solana/wallet-adapter-react-ui/styles.css";

export const SolanaProvider = ({ children }: { children: React.ReactNode }) => {
    // Use localnet for development
    const endpoint = useMemo(() => RPC_ENDPOINT, []);

    // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
    // Only the wallets you configure here will be compiled into your application, and only the dependencies
    // of wallets that your users connect to will be loaded.
    const wallets = useMemo(
        () => [
            /**
             * Wallets that implement either of these standards will be available automatically.
             *
             * - Solana Mobile Stack Mobile Wallet Adapter Protocol
             * - Solana Wallet Standard
             *
             * If you wish to support a wallet that supports neither of these standards,
             * instantiate its legacy adapter here. Common legacy adapters can be found
             * in the npm package `@solana/wallet-adapter-wallets`.
             */
            new PhantomWalletAdapter(),
        ],
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
};
