import { SupportedChainId } from './chains'

const INFURA_KEY = import.meta.env.VITE_REACT_APP_INFURA_KEY

if (typeof INFURA_KEY === 'undefined') {
  throw new Error(`REACT_APP_INFURA_KEY must be a defined environment variable`)
}

/**
 * Fallback JSON-RPC endpoints.
 * These are used if the integrator does not provide an endpoint, or if the endpoint does not work.
 *
 * MetaMask allows switching to any URL, but displays a warning if it is not on the "Safe" list:
 * https://github.com/MetaMask/metamask-mobile/blob/bdb7f37c90e4fc923881a07fca38d4e77c73a579/app/core/RPCMethods/wallet_addEthereumChain.js#L228-L235
 * https://chainid.network/chains.json
 *
 * These "Safe" URLs are listed first, followed by other fallback URLs, which are taken from chainlist.org.
 */
export const FALLBACK_URLS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.MAINNET]: [
    // "Safe" URLs
    'https://api.mycryptoapi.com/eth',
    'https://cloudflare-eth.com',
    // "Fallback" URLs
    'https://rpc.ankr.com/eth',
    'https://eth-mainnet.public.blastapi.io'
  ],
  [SupportedChainId.ROPSTEN]: [
    // "Fallback" URLs
    'https://rpc.ankr.com/eth_ropsten'
  ],
  [SupportedChainId.RINKEBY]: [
    // "Fallback" URLs
    'https://rinkeby-light.eth.linkpool.io/'
  ],
  [SupportedChainId.GOERLI]: [
    // "Safe" URLs
    'https://rpc.goerli.mudit.blog/',
    // "Fallback" URLs
    'https://rpc.ankr.com/eth_goerli'
  ],
  [SupportedChainId.KOVAN]: [
    // "Safe" URLs
    'https://kovan.poa.network',
    // "Fallback" URLs
    'https://eth-kovan.public.blastapi.io'
  ],
  [SupportedChainId.POLYGON]: [
    // "Safe" URLs
    'https://polygon-rpc.com/',
    'https://rpc-mainnet.matic.network',
    'https://matic-mainnet.chainstacklabs.com',
    'https://rpc-mainnet.maticvigil.com',
    'https://rpc-mainnet.matic.quiknode.pro',
    'https://matic-mainnet-full-rpc.bwarelabs.com'
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    // "Safe" URLs
    'https://matic-mumbai.chainstacklabs.com',
    'https://rpc-mumbai.maticvigil.com',
    'https://matic-testnet-archive-rpc.bwarelabs.com'
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    // "Safe" URLs
    'https://arb1.arbitrum.io/rpc',
    // "Fallback" URLs
    'https://arbitrum.public-rpc.com'
  ],
  [SupportedChainId.ARBITRUM_Goerli]: [
    // "Safe" URLs
    'https://goerli-rollup.arbitrum.io/rpc'
  ],
  [SupportedChainId.OPTIMISM]: [
    // "Safe" URLs
    'https://mainnet.optimism.io/',
    // "Fallback" URLs
    'https://rpc.ankr.com/optimism'
  ],
  [SupportedChainId.OPTIMISM_GOERLI]: [
    // "Safe" URLs
    'https://goerli.optimism.io'
  ],
  [SupportedChainId.CELO]: [
    // "Safe" URLs
    `https://forno.celo.org`
  ],
  [SupportedChainId.CELO_ALFAJORES]: [
    // "Safe" URLs
    `https://alfajores-forno.celo-testnet.org`
  ],
  [SupportedChainId.AVALANCHE_FUJITEST]: [`https://ava-testnet.public.blastapi.io/ext/bc/C/rpc`, `https://api.avax-test.network/ext/bc/C/rpc`],
  [SupportedChainId.AVALANCHE_C_HAIN]: [`https://avalanche-c-chain.publicnode.com`, `https://avax.meowrpc.com`],
  [SupportedChainId.NOBLE]: [],
  [SupportedChainId.NOBLE_Test]: [],
  [SupportedChainId.Sepolia]: [],
  [SupportedChainId.BASE]: ['https://base-rpc.publicnode.com', 'https://base.blockpi.network/v1/rpc/public', 'https://base-pokt.nodies.app'],
  [SupportedChainId.SOLANA]: [
    import.meta.env.DEV
      ? `https://lively-quick-tree.solana-mainnet.quiknode.pro/8a5f20ace0533b51b034bf43be0085c73af201a9`
      : `https://blue-omniscient-friday.solana-mainnet.quiknode.pro/59ccc9be093f05d398a9256ef883d0b9ad4857e2`
  ],
  [SupportedChainId.OSMOSIS]: ['https://osmosis-rpc.publicnode.com:443', 'https://osmosis-rpc.polkachu.com'],
  [SupportedChainId.EVMOS]: ['https://evmos-rpc.publicnode.com:443', 'https://evmos-rpc.polkachu.com'],
  [SupportedChainId.SEI]: ['https://sei-rpc.publicnode.com:443', 'https://sei-rpc.polkachu.com'],
  [SupportedChainId.COREUM]: ['https://coreum-rpc.publicnode.com:443', 'https://coreum-rpc.polkachu.com'],
  [SupportedChainId.DYDX]: ['https://dydx-rpc.publicnode.com:443', 'https://dydx-rpc.polkachu.com']
}
// Solana 没有限制的RPC（Relayer和脚本用这个）:
// https://lively-quick-tree.solana-mainnet.quiknode.pro/8a5f20ace0533b51b034bf43be0085c73af201a9
// wss://lively-quick-tree.solana-mainnet.quiknode.pro/8a5f20ace0533b51b034bf43be0085c73af201a9

// Solana 有测试网域名访问限制的RPC(前端用这个):
// https://blue-omniscient-friday.solana-mainnet.quiknode.pro/59ccc9be093f05d398a9256ef883d0b9ad4857e2
// wss://blue-omniscient-friday.solana-mainnet.quiknode.pro/59ccc9be093f05d398a9256ef883d0b9ad4857e2

/**
 * Known JSON-RPC endpoints.
 * These are the URLs used by the interface when there is not another available source of chain data.
 */
export const RPC_URLS: { [key in SupportedChainId]: string[] } = {
  [SupportedChainId.MAINNET]: [`https://mainnet.infura.io/v3/${INFURA_KEY}`, ...FALLBACK_URLS[SupportedChainId.MAINNET]],
  [SupportedChainId.RINKEBY]: [
    // `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.RINKEBY]
  ],
  [SupportedChainId.ROPSTEN]: [
    // `https://ropsten.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.ROPSTEN]
  ],
  [SupportedChainId.GOERLI]: [`https://goerli.infura.io/v3/${INFURA_KEY}`, ...FALLBACK_URLS[SupportedChainId.GOERLI]],
  [SupportedChainId.KOVAN]: [
    // `https://kovan.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.KOVAN]
  ],
  [SupportedChainId.OPTIMISM]: [
    // `https://optimism-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.OPTIMISM]
  ],
  [SupportedChainId.OPTIMISM_GOERLI]: [
    // `https://optimism-goerli.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.OPTIMISM_GOERLI]
  ],
  [SupportedChainId.ARBITRUM_ONE]: [
    // `https://arbitrum-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.ARBITRUM_ONE]
  ],
  [SupportedChainId.ARBITRUM_Goerli]: [
    // `https://arbitrum-goerli.public.blastapi.io`,
    ...FALLBACK_URLS[SupportedChainId.ARBITRUM_Goerli]
  ],
  [SupportedChainId.POLYGON]: [
    // `https://polygon-mainnet.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.POLYGON]
  ],
  [SupportedChainId.POLYGON_MUMBAI]: [
    // `https://polygon-mumbai.infura.io/v3/${INFURA_KEY}`,
    ...FALLBACK_URLS[SupportedChainId.POLYGON_MUMBAI]
  ],
  [SupportedChainId.CELO]: FALLBACK_URLS[SupportedChainId.CELO],
  [SupportedChainId.CELO_ALFAJORES]: FALLBACK_URLS[SupportedChainId.CELO_ALFAJORES],
  [SupportedChainId.AVALANCHE_FUJITEST]: [`https://avalanche-fuji.infura.io/v3/${INFURA_KEY}`, ...FALLBACK_URLS[SupportedChainId.AVALANCHE_FUJITEST]],
  [SupportedChainId.AVALANCHE_C_HAIN]: [`https://avalanche-mainnet.infura.io/v3/${INFURA_KEY}`, ...FALLBACK_URLS[SupportedChainId.AVALANCHE_C_HAIN]],
  [SupportedChainId.Sepolia]: ['https://rpc-sepolia.rockx.com', 'https://api.zan.top/node/v1/eth/sepolia/public'],
  [SupportedChainId.NOBLE]: [],
  [SupportedChainId.NOBLE_Test]: [],
  [SupportedChainId.BASE]: [...FALLBACK_URLS[SupportedChainId.BASE]],
  [SupportedChainId.SOLANA]: FALLBACK_URLS[SupportedChainId.SOLANA],
  [SupportedChainId.OSMOSIS]: FALLBACK_URLS[SupportedChainId.OSMOSIS],
  [SupportedChainId.EVMOS]: FALLBACK_URLS[SupportedChainId.EVMOS],
  [SupportedChainId.SEI]: FALLBACK_URLS[SupportedChainId.SEI],
  [SupportedChainId.COREUM]: FALLBACK_URLS[SupportedChainId.COREUM],
  [SupportedChainId.DYDX]: FALLBACK_URLS[SupportedChainId.DYDX]
}

export const COSMOS_CHAIN_CONFIG = {
  'noble-1': {
    chainId: 'noble-1',
    rpc: 'https://noble-rpc.polkachu.com',
    balanceRpc: 'https://noble-api.polkachu.com',
    destChainName: 'NOBLE',
    channel: ''
  },
  'osmosis-1': {
    chainId: 'osmosis-1',
    rpc: 'https://osmosis-rpc.publicnode.com:443',
    balanceRpc: 'https://osmosis-api.polkachu.com',
    destChainName: 'OSMOSIS',
    channel: 'channel-1'
  },
  'evmos_9001-2': {
    chainId: 'evmos_9001-2',
    rpc: 'https://evmos-rpc.publicnode.com:443',
    balanceRpc: 'https://evmos-api.polkachu.com',
    destChainName: 'EVMOS',
    channel: 'channel-7'
  },
  'pacific-1': {
    chainId: 'pacific-1',
    rpc: 'https://sei-rpc.publicnode.com:443',
    balanceRpc: 'https://sei-api.polkachu.com',
    destChainName: 'SEI',
    channel: 'channel-39'
  },
  'coreum-mainnet-1': {
    chainId: 'coreum-mainnet-1',
    rpc: 'https://coreum-rpc.publicnode.com:443',
    balanceRpc: 'https://coreum-api.polkachu.com',
    destChainName: 'COREUM',
    channel: 'channel-49'
  },
  'dydx-mainnet-1': {
    chainId: 'dydx-mainnet-1',
    rpc: 'https://dydx-rpc.publicnode.com:443',
    balanceRpc: 'https://dydx-api.polkachu.com',
    destChainName: 'DYDX',
    channel: 'channel-33'
  }
}

export type Cosmos_Network = 'noble-1' | 'osmosis-1' | 'evmos_9001-2' | 'pacific-1' | 'coreum-mainnet-1' | 'dydx-mainnet-1'
