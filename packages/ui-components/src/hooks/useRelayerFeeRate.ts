import { useAppStore } from '../state'
import useSWR from 'swr/immutable'
import useRelayerAddress from './useRelayer'
import { useStaticJsonRpc } from './useStaticJsonRpc'
import UsdcRelayerABI from '../constants/ABI/UsdcRelayer.json'
import { useCallback } from 'react'
import { BigNumber, Contract } from 'ethers'

export default function useRelayerFeeRate() {
  const toChainID = useAppStore(state => state.toChainID)
  const contractAddress = useRelayerAddress(toChainID)
  const StaticJsonRpcProvider = useStaticJsonRpc(toChainID)

  const fetchData = useCallback(async () => {
    if (contractAddress == undefined || StaticJsonRpcProvider == undefined) {
      return
    }

    const contract = new Contract(contractAddress, UsdcRelayerABI, StaticJsonRpcProvider)
    const result: BigNumber = await contract.feeRate()
    return result
  }, [StaticJsonRpcProvider, contractAddress])

  const { data, error, isLoading } = useSWR([toChainID, contractAddress, 'feeRate'], fetchData)

  return {
    data,
    error,
    isLoading
  }
}
