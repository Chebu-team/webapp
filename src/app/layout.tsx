import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataContextType, DataProvider, useData } from "@/context/DataContext";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "../config";
import Web3ModalProvider from "@/context/WalletContext";

// solana wallet provider
import SolanaWalletProvider from "@/walletprovider/SolanaWalletProvider";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chebu",
  description: "Chebu - legendary coin return",
  twitter: { card: "summary_large_image", site: "@site", creator: "@creator", images: "https://res.cloudinary.com/dnb0lohxk/image/upload/fl_preserve_transparency/v1719205050/cheba_1_ebztht.jpg?_s=public-apps" },
  openGraph: {
    title: 'Chebu',
    description: 'Chebu - legendary coin return',
    url: 'https://chebu.vercel.app/',
    siteName: 'Chebu',
    images: [
      {
        url: 'https://res.cloudinary.com/dnb0lohxk/image/upload/fl_preserve_transparency/v1719205050/cheba_1_ebztht.jpg?_s=public-apps', // Must be an absolute URL
        width: 800,
        height: 600,
        alt: 'My custom alt',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialState = cookieToInitialState(config, headers().get("cookie"));
  return (
    <DataProvider>
      <html lang="en">
        <body>
        <div className='h-[100vh]'>
          <SolanaWalletProvider>
            <Web3ModalProvider initialState={initialState}>
              {children}
            </Web3ModalProvider>
          </SolanaWalletProvider>
        </div>
        </body>
      </html>
    </DataProvider>
  );
}
