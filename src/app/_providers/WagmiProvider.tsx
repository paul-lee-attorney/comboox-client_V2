import { createConfig, configureChains, WagmiConfig } from 'wagmi';

import { mainnet, hardhat, sepolia, arbitrum } from 'wagmi/chains';

import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectLegacyConnector } from 'wagmi/connectors/walletConnectLegacy';

import { alchemyProvider } from '@wagmi/core/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import { waitForTransaction } from '@wagmi/core';
import { HexType } from '../app/common';
import { arbitrumSepolia } from 'viem/chains';


type WagmiProviderType = {
  children: React.ReactNode
}

export const { chains, publicClient, webSocketPublicClient } = configureChains(
  [ arbitrumSepolia, arbitrum, hardhat ],
  // [ hardhat ],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '',
      // stallTimeout: 2_000,
    }),
    publicProvider(),
  ],
);

export const config = createConfig({
  autoConnect: false,
  connectors: [
    new MetaMaskConnector({ chains }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'comboox',
      },
    }),
    new WalletConnectLegacyConnector({
      chains,
      options: {
        qrcode: true,
      },
    }),
    new InjectedConnector({
      chains,
      options: {
        name: 'Injected',
        shimDisconnect: true,
      },
    }),
  ],
  publicClient,
  webSocketPublicClient,
});

export async function refreshAfterTx(hash: HexType, refresh:()=>void ) {
  let res = await waitForTransaction({hash});
  console.log("Receipt: ", res);
  refresh();
} 

const WagmiProvider = ({ children }: WagmiProviderType) => {
  return (
    <>
      <WagmiConfig config={config}>{children}</WagmiConfig>
    </>
  );
};

export default WagmiProvider;

