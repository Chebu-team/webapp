import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'

import { cookieStorage, createStorage } from 'wagmi'
import {bsc, mainnet, sepolia} from 'wagmi/chains'

// Your WalletConnect Cloud project ID
export const projectId = 'e9598a92a5c36fe45e0237961acc2c09'

// Create a metadata object
const metadata = {
  name: 'Chebu_test',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Create wagmiConfig
const chains = [mainnet, sepolia, bsc] as const
export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  ssr: true,
  storage: createStorage({
    storage: cookieStorage
  }),
  // ...wagmiOptions // Optional - Override createConfig parameters
})