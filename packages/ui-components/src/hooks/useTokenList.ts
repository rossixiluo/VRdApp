// import useSWR from 'swr'
import useSWRImmutable from 'swr/immutable'
import { useWeb3React } from '@web3-react/core'
import { uniswapTokenList } from '../constants/relayer'
import api from '../api/fetch'

import { RootTokenList } from '../types/token'

import { useEffect, useMemo } from 'react'

import { useAppStore } from '../state/index'

import { SupportedChainId } from '../constants/chains'

import { getInteractedTokenAddresses } from './useStaticJsonRpc'

const firstSplTokenList = [
  'Pnut',
  'ACT',
  'BILLY',
  'USDT',
  'USDC',
  'wSOL',
  'RENDER',
  '$WIF',
  'GRT',
  'Bonk',
  'IOT',
  'JUP',
  'PYTH',
  'POPCAT',
  'RAY',
  'JTO',
  'PYUSD'
]
export default function useTokenList(dataType: boolean) {
  const { account } = useWeb3React()

  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const chainid = dataType ? fromChainID : toChainID

  const solanaMyTokenList = useAppStore(state => state.solanaMyTokenList)
  const evmMyTokenList = useAppStore(state => state.evmMyTokenList)
  const setEvmMyTokenList = useAppStore(state => state.setEvmMyTokenList)

  const { data, error, isLoading } = useSWRImmutable('tokenList', async () => {
    // const tokenUrl = TokenList_Chainid[chainid]
    const tokenUrl = uniswapTokenList
    const res = await api.get<RootTokenList>(tokenUrl)
    return res
  })
  const tokenList = useMemo(() => {
    if ((dataType && fromChainID === SupportedChainId.SOLANA) || (!dataType && toChainID === SupportedChainId.SOLANA)) {
      const list = data?.splTokens
        .map(item => ({
          ...item,
          chainId: 'solana'
        }))
        .filter(item => firstSplTokenList.indexOf(item.symbol) !== -1) // 第一版支持4个token+gas

        .filter(item => (item.symbol !== 'wSOL' && !dataType) || dataType) // 目标链不能显示wsol
      if (!list) return []
      // Sort the token list to show the tokens in the same order as the My Tokens list
      const sortedTokenList =
        solanaMyTokenList.length > 0
          ? [
              ...list.filter(token => (solanaMyTokenList as string[]).includes(token.address)),
              ...list.filter(token => !(solanaMyTokenList as string[]).includes(token.address))
            ]
          : list
      return sortedTokenList
    }

    const evmMyTokenList_ = evmMyTokenList as string[]
    if (evmMyTokenList_.length > 0) {
      const list = data?.tokens.filter(item => item.chainId === chainid)
      if (list) {
        const sortedTokenList =
          evmMyTokenList_.length > 0
            ? [
                ...list.filter(token => (evmMyTokenList_ as string[]).includes(token.address)),
                ...list.filter(token => !(evmMyTokenList_ as string[]).includes(token.address))
              ]
            : list

        return sortedTokenList
      }
    }

    return data?.tokens.filter(item => item.chainId === chainid)
  }, [chainid, data, fromChainID, toChainID, dataType, solanaMyTokenList, evmMyTokenList])

  useEffect(() => {
    const getAddressBalance = async (address: string) => {
      const tokenAddresses = fromChainID && (await getInteractedTokenAddresses(address, fromChainID))
      setEvmMyTokenList(tokenAddresses || [])
    }

    if (account) {
      getAddressBalance(account)
    }
  }, [account, fromChainID, setEvmMyTokenList])

  return {
    data: tokenList,
    error,
    isLoading
  }
}
