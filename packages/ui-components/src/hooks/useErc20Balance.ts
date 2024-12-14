import { useWeb3React } from '@web3-react/core'
import { useCallback, useMemo } from 'react'
import { BigNumber, Contract } from 'ethers'

import erc20ABI from './../constants/ABI/ERC20.json'

import useSWR from 'swr'
import { useStaticJsonRpc } from './useStaticJsonRpc'
import { SupportedChainId } from '../constants/chains'

const contractCache: { [key: string]: Contract } = {}

export default function useErc20Balance(address: string | undefined, chainID: SupportedChainId | null, refreshInterval?: number) {
  const { account } = useWeb3React()
  const fromChainID = chainID

  //   const mpcinfo = useAppStore(state => state.getWalletAccount(account, mpcAddress))

  const contractAddress = address

  const selectcontract = useMemo(() => {
    return contractAddress
  }, [contractAddress])
  const StaticJsonRpcProvider = useStaticJsonRpc(fromChainID)
  const fetchData = useCallback(async () => {
    if (account && contractAddress && StaticJsonRpcProvider !== null && contractAddress !== '' && chainID) {
      if (!contractCache[chainID + contractAddress]) {
        contractCache[chainID + contractAddress] = new Contract(contractAddress, erc20ABI, StaticJsonRpcProvider)
      }
      const contract = contractCache[chainID + contractAddress]

      const result: BigNumber = await contract.balanceOf(account)
      return result.toString()
    } else {
      return '0'
    }
  }, [StaticJsonRpcProvider, account, contractAddress, chainID])

  const { data, error, isLoading } = useSWR(
    ['erc20balanceOf', account, selectcontract, fromChainID],
    fetchData,
    refreshInterval && refreshInterval >= 1000 ? { refreshInterval } : undefined
  )

  return {
    balance: data,
    isloading: isLoading,
    error
  }
}
