import { Token } from '../types/token'
import { getChainInfo } from '../constants/chainInfo'
import { SupportedChainId, GAS_IS_ETH } from '../constants/chains'
import ethlogo from '../assets/icon/ethereum-logo.png'

const usdcLogo = 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'

export default function useDefaultToken(ChainID: SupportedChainId | null) {
  if (ChainID == null) {
    return
  }
  const chainInfo = getChainInfo(ChainID)

  if (ChainID == SupportedChainId.NOBLE || ChainID == SupportedChainId.NOBLE_Test) {
    return {
      chainId: ChainID,
      address: 'uUSDC',
      name: 'USDC Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: usdcLogo
    }
  }
  if (ChainID == SupportedChainId.OSMOSIS) {
    return {
      chainId: ChainID,
      address: 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4',
      name: 'USDC Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: usdcLogo
    }
  }
  if (ChainID == SupportedChainId.EVMOS) {
    return {
      chainId: ChainID,
      address: 'ibc/35357FE55D81D88054E135529BB2AEB1BB20D207292775A19BD82D83F27BE9B4',
      name: 'USDC Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: usdcLogo
    }
  }
  if (ChainID == SupportedChainId.SEI) {
    return {
      chainId: ChainID,
      address: 'ibc/CA6FBFAF399474A06263E10D0CE5AEBBE15189D6D4B2DD9ADE61007E68EB9DB0',
      name: 'USDC Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: usdcLogo
    }
  }
  if (ChainID == SupportedChainId.COREUM) {
    return {
      chainId: ChainID,
      address: 'ibc/E1E3674A0E4E1EF9C69646F9AF8D9497173821826074622D831BAB73CCB99A2D',
      name: 'USDC Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: usdcLogo
    }
  }
  if (ChainID == SupportedChainId.DYDX) {
    return {
      chainId: ChainID,
      address: 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5',
      name: 'USDC Coin',
      symbol: 'USDC',
      decimals: 6,
      logoURI: usdcLogo
    }
  }

  const item: Token = {
    chainId: ChainID,
    address: '',
    name: chainInfo.nativeCurrency.name,
    symbol: chainInfo.nativeCurrency.symbol,
    decimals: chainInfo.nativeCurrency.decimals,
    logoURI: GAS_IS_ETH.includes(ChainID) ? ethlogo : chainInfo.logoUrl
  }
  return item
}
