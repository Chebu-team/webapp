import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { DataContextType, DataProvider, useData } from "@/context/DataContext";

import "./globals.css";

import { headers } from "next/headers";

import { cookieToInitialState } from "wagmi";

import { config } from "../config";
import Web3ModalProvider from "@/context/WalletContext";

// solana wallet provider
import SolanaWalletProvider from "@/walletprovider/SolanaWalletProvider";
import Socialbar from "@/components/Socialbar";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chebu",
  description: "Chebu - legendary coin return",
  twitter: { card: "summary_large_image", site: "@site", creator: "@creator", "images": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEXbgyPF1s2pI9CiWKZTzdk5Mvne2pYut-GQ&s" },
  openGraph: {
    title: 'Next.js',
    description: 'The React Framework for the Web',
    url: 'https://nextjs.org',
    siteName: 'Next.js',
    images: [
      {
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEXbgyPF1s2pI9CiWKZTzdk5Mvne2pYut-GQ&s', // Must be an absolute URL
        width: 800,
        height: 600,
      },
      {
        url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSEXbgyPF1s2pI9CiWKZTzdk5Mvne2pYut-GQ&s', // Must be an absolute URL
        width: 1800,
        height: 1600,
        alt: 'My custom alt',
      },
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
        </SolanaWalletProvider></div>
        </body>
      </html>
    </DataProvider>
  );
}
