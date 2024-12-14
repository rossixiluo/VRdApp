import { InjectedConnector } from '@web3-react/injected-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
// import { WalletLinkConnector } from "@web3-react/walletlink-connector";
// import { ALL_SUPPORTED_CHAIN_IDS } from '../constants/chains'

const RPC_URLS = {
  1: `https://mainnet.infura.io/v3/f784c0c448844cce856d62a06f66a52d`,
  4: `https://rinkeby.infura.io/v3/f784c0c448844cce856d62a06f66a52d`
}

// MetaMask
export const Injected = new InjectedConnector({
  // supportedChainIds: [],
})

// export const activateInjectedProvider = (providerName: "MetaMask" | "CoinBase"|"WalletConnect") => {
//   if (typeof window !== "undefined") {
//     const { ethereum } = window as any;

//     if (!ethereum?.providers) {
//       return undefined;
//     }

//     let provider;
//     switch (providerName) {
//       case "CoinBase":
//         provider = ethereum.providers.find(
//           ({ isCoinbaseWallet }: any) => isCoinbaseWallet
//         );
//         break;
//       case "MetaMask":
//         provider = ethereum.providers.find(({ isMetaMask }: any) => isMetaMask);
//         break;
//     }

//     if (provider) {
//       ethereum.setSelectedProvider(provider);
//     }
//   } else return;
// };

// activateInjectedProvider("MetaMask");

// wallet connect
const WalletConnect = new WalletConnectConnector({
  rpc: RPC_URLS,
  bridge: 'https://bridge.walletconnect.org',
  qrcode: true
})

// Coinbase
// const CoinbaseWallet = new WalletLinkConnector({
//   url: `https://rinkeby.infura.io/v3/f784c0c448844cce856d62a06f66a52d`,
//   appName: "My dApp 😎",
//   supportedChainIds: [1, 3, 4, 5, 42],
// });

const connectors = {
  metamask: Injected,
  walletConnect: WalletConnect
  // coinbaseWallet: CoinbaseWallet,
}

export default connectors
