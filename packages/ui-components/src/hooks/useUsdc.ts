import { useWeb3React } from '@web3-react/core'
import { USDC_IDS_TO_ADDR } from '../constants/usdc'
import { SupportedChainId } from '../constants/chains'

export default function useUSDCAddress(chainId_?: SupportedChainId | null): string | undefined {
  const { chainId } = useWeb3React()
  const id = chainId_ || chainId
  if (id == undefined) {
    return
  }
  return USDC_IDS_TO_ADDR[id as SupportedChainId]
}
