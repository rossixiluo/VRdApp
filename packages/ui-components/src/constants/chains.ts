/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  ARBITRUM_ONE = 42161,
  ARBITRUM_Goerli = 421613,

  OPTIMISM = 10,
  OPTIMISM_GOERLI = 420,

  POLYGON = 137,
  POLYGON_MUMBAI = 80001,

  CELO = 42220,
  CELO_ALFAJORES = 44787,
  AVALANCHE_FUJITEST = 43113,
  AVALANCHE_C_HAIN = 43114,
  NOBLE = 'noble-1',
  NOBLE_Test = 'grand-1',
  Sepolia = 11155111,
  BASE = 8453,
  SOLANA = 'solana',
  OSMOSIS = 'osmosis-1',
  EVMOS = 'evmos_9001-2',
  SEI = 'pacific-1',
  COREUM = 'coreum-mainnet-1',
  DYDX = 'dydx-mainnet-1'
}

export const CHAIN_IDS_TO_NAMES = {
  [SupportedChainId.MAINNET]: 'mainnet',
  [SupportedChainId.ROPSTEN]: 'ropsten',
  [SupportedChainId.RINKEBY]: 'rinkeby',
  [SupportedChainId.GOERLI]: 'goerli',
  [SupportedChainId.KOVAN]: 'kovan',
  [SupportedChainId.POLYGON]: 'polygon',
  [SupportedChainId.POLYGON_MUMBAI]: 'polygon_mumbai',
  [SupportedChainId.CELO]: 'celo',
  [SupportedChainId.CELO_ALFAJORES]: 'celo_alfajores',
  [SupportedChainId.ARBITRUM_ONE]: 'arbitrum one',
  [SupportedChainId.ARBITRUM_Goerli]: 'arbitrum_goerli',
  [SupportedChainId.OPTIMISM]: 'optimism',
  [SupportedChainId.OPTIMISM_GOERLI]: 'optimism_goerli',
  [SupportedChainId.AVALANCHE_FUJITEST]: 'avalanche_fujitest',
  [SupportedChainId.AVALANCHE_C_HAIN]: 'avalanche',
  [SupportedChainId.NOBLE]: 'noble',
  [SupportedChainId.Sepolia]: 'sepolia',
  [SupportedChainId.BASE]: 'base',
  [SupportedChainId.SOLANA]: 'solana',
  [SupportedChainId.OSMOSIS]: 'osmosis',
  [SupportedChainId.EVMOS]: 'evmos',
  [SupportedChainId.SEI]: 'sei',
  [SupportedChainId.COREUM]: 'coreum',
  [SupportedChainId.DYDX]: 'dydx'
}

export const isCosmosChain = (chainId: SupportedChainId | null | undefined) => {
  return (
    chainId &&
    [SupportedChainId.NOBLE, SupportedChainId.OSMOSIS, SupportedChainId.EVMOS, SupportedChainId.SEI, SupportedChainId.COREUM, SupportedChainId.DYDX].includes(
      chainId
    )
  )
}

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  id => typeof id === 'number' && [1, 5].indexOf(id) > -1
) as SupportedChainId[]

// export function isSupportedChain(chainId: number | null | undefined): chainId is SupportedChainId {
//   return !!chainId && !!SupportedChainId[chainId]
// }

export const SUPPORTED_GAS_ESTIMATE_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.CELO,
  SupportedChainId.OPTIMISM,
  SupportedChainId.ARBITRUM_ONE
]

/**
 * Unsupported networks for V2 pool behavior.
 */
export const UNSUPPORTED_V2POOL_CHAIN_IDS = [SupportedChainId.POLYGON, SupportedChainId.OPTIMISM, SupportedChainId.ARBITRUM_ONE]

export const TESTNET_CHAIN_IDS = [
  // SupportedChainId.ROPSTEN,
  // SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  // SupportedChainId.KOVAN,
  // SupportedChainId.POLYGON_MUMBAI,
  SupportedChainId.ARBITRUM_Goerli,
  // SupportedChainId.OPTIMISM_GOERLI,
  SupportedChainId.AVALANCHE_FUJITEST,
  SupportedChainId.Sepolia,
  SupportedChainId.NOBLE_Test
]

export const MAINNET_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.AVALANCHE_C_HAIN,
  SupportedChainId.OPTIMISM,
  SupportedChainId.POLYGON,
  SupportedChainId.NOBLE,
  SupportedChainId.BASE,
  SupportedChainId.SOLANA,
  SupportedChainId.OSMOSIS,
  SupportedChainId.EVMOS,
  SupportedChainId.SEI,
  // SupportedChainId.COREUM,
  SupportedChainId.DYDX
]
export const DISABLE_CHAIN_IDS = [SupportedChainId.RINKEBY]

// export const USECHAIN_IDS=import.meta.env.DEV?TESTNET_CHAIN_IDS:MAINNET_CHAIN_IDS
export const USECHAIN_IDS = MAINNET_CHAIN_IDS

export type SupportedTestnetChainId = (typeof TESTNET_CHAIN_IDS)[number]

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
  SupportedChainId.CELO,
  SupportedChainId.CELO_ALFAJORES
] as const

export type SupportedL1ChainId = (typeof L1_CHAIN_IDS)[number]

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_Goerli,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISM_GOERLI
] as const

export type SupportedL2ChainId = (typeof L2_CHAIN_IDS)[number]

export const OTHER_CHAIN_IDS = [SupportedChainId.SOLANA] as const

export type SupportedOtherChainId = (typeof OTHER_CHAIN_IDS)[number]

export const GAS_IS_ETH = [SupportedChainId.MAINNET, SupportedChainId.ARBITRUM_ONE, SupportedChainId.OPTIMISM]
