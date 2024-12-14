import { useCallback } from 'react'
import { useAppStore } from '../state'
import { LcdClient } from '@cosmjs/launchpad'
import useSWR from 'swr'
import { COSMOS_CHAIN_CONFIG, Cosmos_Network } from '../constants/networks'

export interface Balance {
  denom: string
  amount: string
}

export interface Pagination {
  next_key?: any
  total: string
}

export interface RootObject {
  balances: Balance[]
  pagination: Pagination
}

export function useCosmosBalance(chainType: Cosmos_Network = 'noble-1') {
  const cosmosAddress = useAppStore(state => state.cosmosAddresses.find(address => address.chainId === chainType)?.address)

  const fetchData = useCallback(async () => {
    if (!cosmosAddress) return
    const endpoint = COSMOS_CHAIN_CONFIG[chainType].balanceRpc
    const client = new LcdClient(endpoint)
    const res: RootObject = await client.get(`cosmos/bank/v1beta1/balances/${cosmosAddress}`)
    return res.balances
  }, [cosmosAddress, chainType])

  const { data, error, isLoading } = useSWR(['cosmosBalance', cosmosAddress, chainType], fetchData, { refreshInterval: 10 * 1000 })

  return {
    balance: data,
    isLoading,
    error
  }
}

export default useCosmosBalance
