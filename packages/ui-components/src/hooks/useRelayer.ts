import { Relayer_IDS_TO_ADDR } from '../constants/relayer'
import { SupportedChainId } from '../constants/chains'
import { useAppStore } from '../state'

export default function useRelayerAddress(chainId_?: SupportedChainId | null): string | undefined {
  const chainId = useAppStore(state => state.fromChainID)
  const id = chainId_ || chainId
  if (id == undefined) {
    return
  }
  return Relayer_IDS_TO_ADDR[id as SupportedChainId]
}
