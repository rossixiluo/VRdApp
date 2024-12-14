import { SupportedChainId } from '../constants/chains'

export interface Token {
  chainId: SupportedChainId
  address: string
  name: string
  symbol: string
  decimals: number
  logoURI: string
  balance?: string
  tags?: string[]
}

export interface Version {
  major: number
  minor: number
  patch: number
}

export interface RootTokenList {
  name: string
  logoURI: string
  keywords: string[]
  timestamp: string
  tokens: Token[]
  splTokens: Token[]
  version: Version
}
