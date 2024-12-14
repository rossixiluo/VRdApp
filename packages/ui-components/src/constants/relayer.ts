import { SupportedChainId } from './chains'

export const Relayer_IDS_TO_ADDR = {
  [SupportedChainId.GOERLI]: '',
  [SupportedChainId.AVALANCHE_FUJITEST]: '',
  [SupportedChainId.AVALANCHE_C_HAIN]: '0x43Dc3A0abc0148b2Cc9E76699Aa9e8f5edf69B36', // 0x13b02271dfC70bC779242dED539c5D05dE402eBA
  [SupportedChainId.MAINNET]: '0x66F011F9F4ab937b47f51a8da5542c897D12E3Cb',
  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: '0x7C5d3CF79f213F691637AB28b414eBCB41F4FfbB',
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.ARBITRUM_ONE]: '0xE438AADd3C34e444FF775F7d376ffE54d197673A',
  [SupportedChainId.ARBITRUM_Goerli]: '',
  [SupportedChainId.OPTIMISM]: '0xc17cffDaA599A759d06EE2Eae88866055622d937',
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.Sepolia]: '0xe806b622053b43dB21793c368F59945294BeF2B0',
  [SupportedChainId.NOBLE]: '',
  [SupportedChainId.NOBLE_Test]: '',
  [SupportedChainId.BASE]: '0x7C5d3CF79f213F691637AB28b414eBCB41F4FfbB',
  [SupportedChainId.SOLANA]: '1juq2mikvVRXvocBLFBbfi5354hydha1NXgjLa4QGNY',
  [SupportedChainId.OSMOSIS]: '',
  [SupportedChainId.EVMOS]: '',
  [SupportedChainId.SEI]: '',
  [SupportedChainId.COREUM]: '',
  [SupportedChainId.DYDX]: ''
}
export const Solana_Config = {
  VR_caller: '0xbc30db1770ae6f9957e4d41baec0a767b98869e74f2d9dd82dde5b71c4a45dda',
  VR_program_usdc_account: '0x29aade440d65cd315ab6b5cccdd5545e1a720db6e7b7d94dc56ded8d5c1ee9f3',
  VR_message_receiver: '0x4352e98d0dfef2a95d0a81a56c960dec102111ac0ba732ab8858a5891dfb5df0',
  GAS_ETH: '0x000000000000000000000000EeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  SOL_IN_NOBLE_HEX: '0x069b8857feab8184fb687f634618c035dac439dc1aeb3b5598a0f00000000001'
}

export const MULTICALL_ADDR = {
  [SupportedChainId.GOERLI]: '',
  [SupportedChainId.AVALANCHE_FUJITEST]: '',
  [SupportedChainId.AVALANCHE_C_HAIN]: '0x7B02F5224C90e76b135612e07b2954D152B03532',
  [SupportedChainId.MAINNET]: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: '0x83db0961dc5D1C6162e343827A7c031A7518dBf0',
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.ARBITRUM_ONE]: '0x83db0961dc5D1C6162e343827A7c031A7518dBf0',
  [SupportedChainId.ARBITRUM_Goerli]: '',
  [SupportedChainId.OPTIMISM]: '0x83db0961dc5D1C6162e343827A7c031A7518dBf0',
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.Sepolia]: '',
  [SupportedChainId.NOBLE]: '',
  [SupportedChainId.NOBLE_Test]: '',
  [SupportedChainId.BASE]: '0x83db0961dc5D1C6162e343827A7c031A7518dBf0',
  [SupportedChainId.SOLANA]: '',
  [SupportedChainId.OSMOSIS]: '',
  [SupportedChainId.EVMOS]: '',
  [SupportedChainId.SEI]: '',
  [SupportedChainId.COREUM]: '',
  [SupportedChainId.DYDX]: ''
}

export const Circle_Chainid = {
  [SupportedChainId.GOERLI]: 0,
  [SupportedChainId.AVALANCHE_FUJITEST]: 1,
  [SupportedChainId.AVALANCHE_C_HAIN]: 1,
  [SupportedChainId.MAINNET]: 0,
  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: 7,
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.ARBITRUM_ONE]: 3,
  [SupportedChainId.ARBITRUM_Goerli]: 3,
  [SupportedChainId.OPTIMISM]: '2',
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.NOBLE]: 4,
  [SupportedChainId.NOBLE_Test]: 4,
  [SupportedChainId.Sepolia]: 0,
  [SupportedChainId.BASE]: 6,
  [SupportedChainId.SOLANA]: 5,
  [SupportedChainId.OSMOSIS]: 4,
  [SupportedChainId.EVMOS]: 4,
  [SupportedChainId.SEI]: 4,
  [SupportedChainId.COREUM]: 4,
  [SupportedChainId.DYDX]: 4
}
//Time needed to leave
export const LeaveTime_Chainid = {
  [SupportedChainId.GOERLI]: '1 minutes',
  [SupportedChainId.MAINNET]: '13 minutes',

  [SupportedChainId.AVALANCHE_FUJITEST]: '1 minutes',
  [SupportedChainId.AVALANCHE_C_HAIN]: '20 seconds',

  [SupportedChainId.ARBITRUM_Goerli]: '1 minutes',
  [SupportedChainId.ARBITRUM_ONE]: '13 minutes',

  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: '8 minutes',
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.OPTIMISM]: '13 minutes',
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.NOBLE]: '20 seconds',
  [SupportedChainId.NOBLE_Test]: '3 minutes',
  [SupportedChainId.Sepolia]: '1 minutes',
  [SupportedChainId.BASE]: '13 minutes',
  [SupportedChainId.SOLANA]: '2 minutes',
  [SupportedChainId.OSMOSIS]: '1 minutes',
  [SupportedChainId.EVMOS]: '1 minutes',
  [SupportedChainId.SEI]: '1 minutes',
  [SupportedChainId.COREUM]: '1 minutes',
  [SupportedChainId.DYDX]: '1 minutes'
}
const getNumberOfBlocksTranslate = (num: string | number) => `(Number of Block Confirmations: ${num})`

export const NumberOfBlocks_Chainid = {
  [SupportedChainId.GOERLI]: '',
  [SupportedChainId.MAINNET]: getNumberOfBlocksTranslate(65),

  [SupportedChainId.AVALANCHE_FUJITEST]: '',
  [SupportedChainId.AVALANCHE_C_HAIN]: getNumberOfBlocksTranslate(1),

  [SupportedChainId.ARBITRUM_Goerli]: '',
  [SupportedChainId.ARBITRUM_ONE]: getNumberOfBlocksTranslate(65),

  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: getNumberOfBlocksTranslate(200),
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.OPTIMISM]: getNumberOfBlocksTranslate(65),
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.NOBLE]: getNumberOfBlocksTranslate(1),
  [SupportedChainId.NOBLE_Test]: '',
  [SupportedChainId.Sepolia]: '',
  [SupportedChainId.BASE]: getNumberOfBlocksTranslate(65),
  [SupportedChainId.SOLANA]: '',
  [SupportedChainId.OSMOSIS]: '',
  [SupportedChainId.EVMOS]: '',
  [SupportedChainId.SEI]: '',
  [SupportedChainId.COREUM]: '',
  [SupportedChainId.DYDX]: ''
}

//TokenList
export const TokenList_Chainid = {
  [SupportedChainId.GOERLI]: '',
  [SupportedChainId.MAINNET]: 'https://tokens.coingecko.com/ethereum/all.json',

  [SupportedChainId.AVALANCHE_FUJITEST]: '',
  [SupportedChainId.AVALANCHE_C_HAIN]: 'https://tokens.coingecko.com/avalanche/all.json',

  [SupportedChainId.ARBITRUM_Goerli]: '',
  [SupportedChainId.ARBITRUM_ONE]: 'https://tokens.coingecko.com/arbitrum-one/all.json',

  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: '',
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.OPTIMISM]: '',
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.SOLANA]: '',
  [SupportedChainId.OSMOSIS]: '',
  [SupportedChainId.EVMOS]: '',
  [SupportedChainId.SEI]: '',
  [SupportedChainId.COREUM]: '',
  [SupportedChainId.DYDX]: ''
}

//TokenList
export const TokenList_Balance = {
  [SupportedChainId.GOERLI]: '',
  [SupportedChainId.MAINNET]: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',

  [SupportedChainId.AVALANCHE_FUJITEST]: '',
  [SupportedChainId.AVALANCHE_C_HAIN]: '0xD023D153a0DFa485130ECFdE2FAA7e612EF94818',

  [SupportedChainId.ARBITRUM_Goerli]: '',
  [SupportedChainId.ARBITRUM_ONE]: '0x151E24A486D7258dd7C33Fb67E4bB01919B7B32c',

  [SupportedChainId.ROPSTEN]: '',
  [SupportedChainId.RINKEBY]: '',
  [SupportedChainId.KOVAN]: '',
  [SupportedChainId.POLYGON]: '',
  [SupportedChainId.POLYGON_MUMBAI]: '',
  [SupportedChainId.CELO]: '',
  [SupportedChainId.CELO_ALFAJORES]: '',
  [SupportedChainId.OPTIMISM]: '',
  [SupportedChainId.OPTIMISM_GOERLI]: '',
  [SupportedChainId.SOLANA]: '',
  [SupportedChainId.OSMOSIS]: '',
  [SupportedChainId.EVMOS]: '',
  [SupportedChainId.SEI]: '',
  [SupportedChainId.COREUM]: '',
  [SupportedChainId.DYDX]: ''
}

export const BaseUrl = 'https://apiproxy.valuerouter.com/api' // 'https://apiproxy.valuerouter.com/api'

export const BaseQuote = 'https://apiproxy.valuerouter.com/api/quote'

export const uniswapTokenList = '/tokens.json'

export const splToken = '/splToken.json'

// noble 到各个链的手续费，单位是USDC, [bridge, swap]
export const nobleFee = {
  [SupportedChainId.MAINNET]: [10000000, 15000000],
  [SupportedChainId.AVALANCHE_C_HAIN]: [500000, 750000],
  [SupportedChainId.OPTIMISM]: [500000, 750000],
  [SupportedChainId.ARBITRUM_ONE]: [500000, 750000],
  [SupportedChainId.BASE]: [500000, 750000],
  [SupportedChainId.POLYGON]: [500000, 750000],
  [SupportedChainId.SOLANA]: [500000, 750000],
  [SupportedChainId.OSMOSIS]: [500000, 750000],
  [SupportedChainId.EVMOS]: [0, 0],
  [SupportedChainId.SEI]: [0, 0],
  [SupportedChainId.COREUM]: [0, 0],
  [SupportedChainId.DYDX]: [0, 0],
  [SupportedChainId.NOBLE]: [0, 0],

  [SupportedChainId.GOERLI]: [],
  [SupportedChainId.AVALANCHE_FUJITEST]: [],
  [SupportedChainId.ARBITRUM_Goerli]: [],
  [SupportedChainId.ROPSTEN]: [],
  [SupportedChainId.RINKEBY]: [],
  [SupportedChainId.KOVAN]: [],
  [SupportedChainId.POLYGON_MUMBAI]: [],
  [SupportedChainId.CELO]: [],
  [SupportedChainId.CELO_ALFAJORES]: [],
  [SupportedChainId.OPTIMISM_GOERLI]: [],
  // [SupportedChainId.NOBLE]: [],
  [SupportedChainId.NOBLE_Test]: [],
  [SupportedChainId.Sepolia]: [1, 1]
}

export const solanaFee = {
  [SupportedChainId.MAINNET]: [32051282, 64102564],
  [SupportedChainId.AVALANCHE_C_HAIN]: [1923077, 2564103],
  [SupportedChainId.OPTIMISM]: [1923077, 2564103],
  [SupportedChainId.ARBITRUM_ONE]: [1923077, 2564103],
  [SupportedChainId.BASE]: [1923077, 2564103],
  [SupportedChainId.POLYGON]: [1923077, 2564103],
  [SupportedChainId.NOBLE]: [1923077, 2564103],
  [SupportedChainId.OSMOSIS]: [1923077, 2564103],
  [SupportedChainId.EVMOS]: [1923077, 2564103],
  [SupportedChainId.SEI]: [1923077, 2564103],
  [SupportedChainId.COREUM]: [1923077, 2564103],
  [SupportedChainId.DYDX]: [1923077, 2564103],
  [SupportedChainId.GOERLI]: [],
  [SupportedChainId.AVALANCHE_FUJITEST]: [],
  [SupportedChainId.ARBITRUM_Goerli]: [],
  [SupportedChainId.ROPSTEN]: [],
  [SupportedChainId.RINKEBY]: [],
  [SupportedChainId.KOVAN]: [],
  [SupportedChainId.POLYGON_MUMBAI]: [],
  [SupportedChainId.CELO]: [],
  [SupportedChainId.CELO_ALFAJORES]: [],
  [SupportedChainId.OPTIMISM_GOERLI]: [],
  [SupportedChainId.NOBLE_Test]: [],
  [SupportedChainId.Sepolia]: [1, 1]
}

// cosmos 到各个链的手续费，单位是USDC
export const cosmosFee = 500000;

export const amountThreshold = '1000'
