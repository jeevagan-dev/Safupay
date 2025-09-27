import { useState } from 'react'
import '@rainbow-me/rainbowkit/styles.css';
import {
  getDefaultConfig,
  RainbowKitProvider,
  ConnectButton,
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { BrowserRouter , Routes ,Route } from 'react-router-dom';
import NavBar from './components/Navbar';
import DepositForm from './pages/Deposite';
import ActiveDepositsList from './pages/Details';
import CrossChain from './pages/CrossSwap'

const kadenaTestnet20 = {
  id: 5920,
  name: 'Kadena Chainweb EVM Testnet 20',
  nativeCurrency: {
    decimals: 18,
    name: 'Kadena',
    symbol: 'KDA',
  },
  rpcUrls: {
    default: { http: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc'] },
    public: { http: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/20/evm/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'http://chain-20.evm-testnet-blockscout.chainweb.com',
    },
  },
  testnet: true,
  iconUrl: 'https://avatars.githubusercontent.com/u/19830776?s=200&v=4', 
};

const kadenaTestnet21 = {
  id: 5921,
  name: 'Kadena Chainweb EVM Testnet 21',
  nativeCurrency: {
    decimals: 18,
    name: 'Kadena',
    symbol: 'KDA',
  },
  rpcUrls: {
    default: { http: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc'] },
    public: { http: ['https://evm-testnet.chainweb.com/chainweb/0.0/evm-testnet/chain/21/evm/rpc'] },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'http://chain-21.evm-testnet-blockscout.chainweb.com', 
    },
  },
  testnet: true,
  iconUrl: 'https://avatars.githubusercontent.com/u/19830776?s=200&v=4', 
};


const config = getDefaultConfig({
  appName: 'My RainbowKit App',
  projectId: 'fa868975a64170a887ead01f017e04c8', 
  chains: [kadenaTestnet21, kadenaTestnet20],
  ssr: true,
});

  const queryClient = new QueryClient();

const App = () => {
  return (
    <BrowserRouter>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider  showRecentTransactions={true} >
          <NavBar />
          <Routes>
            <Route path="/" element={<ActiveDepositsList />} />
            <Route path="/deposit" element={<DepositForm />} />
            <Route path="/crosschain" element={<CrossChain />} />
          </Routes>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
    </BrowserRouter>
  );
}

export default App;
