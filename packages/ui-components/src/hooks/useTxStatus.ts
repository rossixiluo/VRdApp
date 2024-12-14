import useSWR from 'swr'

import { BaseUrl } from '../constants/relayer'

import api from '../api/fetch'
import { SearchTxhash } from '../types/searchTxhash'
import { useStaticJsonRpc } from './useStaticJsonRpc'
import { useCallback } from 'react'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { useAppStore } from '../state'
interface TxHashData {
  id: number
  input_hash: string
  output_hash: string
  timestamp: number
  source_chain: string
  destination_chain: string
  amount: string
  sender_address: string
  recipient: string
  target_token: string
  min_received_amount: string
}
interface SearchTxhashNoble {
  success: boolean
  data: TxHashData
}

async function fetcher(txhash: string | undefined | null): Promise<SearchTxhash | undefined> {
  if (txhash == null || txhash == undefined) {
    return
  }

  const res = await api.get<SearchTxhash>(BaseUrl + '/search/?txhash=' + txhash)
  if (res && res.code == 0 && res.data) {
    return res
  } else {
    throw new Error('get Accounts info error ')
  }
}

export default function useTxStatus(txhash: string | undefined | null, isLocalSwap: boolean, isFromChainId: SupportedChainId | null, toChainID: SupportedChainId | null, fetchStart: boolean) {
  const isOtherCosmos = isCosmosChain(isFromChainId) && isFromChainId !== SupportedChainId.NOBLE
  const StaticJsonRpcProvider = useStaticJsonRpc(isFromChainId)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(isFromChainId as string))
  const historyList = useAppStore(state => state.getHistory(cosmosAddress))

  const { data, error, isLoading } = useSWR(
    txhash && isLocalSwap == false && fetchStart && !isOtherCosmos ? ['/smw/txhash', txhash] : null,
    () => fetcher(txhash),
    {
      refreshInterval: 1000 * 15
    }
  )

  const getTxStatus = useCallback(async () => {
    if (isLocalSwap == false || txhash == undefined || txhash == null || StaticJsonRpcProvider == undefined) return

    const result = await StaticJsonRpcProvider.getTransactionReceipt(txhash)

    return result?.status
  }, [StaticJsonRpcProvider, txhash, isLocalSwap])

  const {
    data: dataLocal,
    error: errorLocaL,
    isLoading: isLoadingLocaL
  } = useSWR(txhash && isLocalSwap == true ? ['/smw/txhash_local', txhash] : null, getTxStatus, {
    refreshInterval: 1000 * 15
  })

  const getCosmosTxStatus = useCallback(async () => {
    const middleHash = historyList.find(item => item.txhash == txhash)?.txMiddleHash
    const res = await fetcher(middleHash)
    // console.info(txhash, middleHash, res)
    return {
      data: res?.data,
      isLoading: false,
      error: null
    }
  }, [txhash, historyList])

  const { data: dataOtherCosmos, error: errorOtherCosmos, isLoading: isLoadingOtherCosmos } = useSWR(txhash && (isOtherCosmos && toChainID !== SupportedChainId.NOBLE) ? ['/smw/txhash_other_cosmos', txhash] : null, getCosmosTxStatus, {
    refreshInterval: 1000 * 15
  })
  if (isOtherCosmos) {
    return {
      data: dataOtherCosmos,
      error: errorOtherCosmos,
      isLoading: isLoadingOtherCosmos,
      isLocalSwap: false,
      isLoadingLocaL: false,
      errorLocaL: null
    }
  }

  return {
    data: data,
    error,
    isLoading,
    dataLocal,
    errorLocaL,
    isLoadingLocaL,
    isLocalSwap
  }
}

export async function toFetcher(txhash: string | undefined | null): Promise<SearchTxhash | undefined> {
  if (txhash == null || txhash == undefined) {
    return
  }

  const res = await api.get<SearchTxhash>(BaseUrl + '/searchByHash/?txhash=' + txhash)
  if (res && res.code == 0 && res.data) {
    return res
  } else {
    throw new Error('get Accounts info error ')
  }
}

export function useToHashStatus(txhash: string | undefined | null, fetchStart?: boolean) {
  const { data, error, isLoading } = useSWR(txhash && fetchStart ? ['/smw/txToHash', txhash] : null, () => toFetcher(txhash), {
    refreshInterval: 1000 * 15
  })

  return {
    data: data,
    error,
    isLoading
  }
}

export async function toFetcherNoble(txhash: string | undefined | null): Promise<SearchTxhashNoble | undefined> {
  if (txhash == null || txhash == undefined) {
    return
  }

  const res = await api.get<SearchTxhashNoble>(BaseUrl + '/searchNobleByHash/?tx_hash=' + txhash)
  if (res && res.data) {
    return res
  } else {
    throw new Error('get Accounts info error ')
  }
}

export async function pollToFetcher(txhash: string | undefined | null, maxAttempts = 20, interval = 3000): Promise<SearchTxhashNoble | undefined> {
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      const result = await toFetcherNoble(txhash)
      if (result?.data?.output_hash) {
        return result
      }

      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    } catch (error) {
      if (attempts === maxAttempts - 1) {
        throw error
      }
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }
  }

  throw new Error('Polling timeout: Failed to get valid response')
}
