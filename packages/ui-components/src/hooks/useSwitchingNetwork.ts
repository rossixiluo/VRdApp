import { useWeb3React } from '@web3-react/core'

import { FALLBACK_URLS } from '../constants/networks'
import switchEthereumChain from '../metamask/switchEthereumChain'
import { useAsyncFn } from 'react-use'

import { SupportedChainId } from '../constants/chains'
import { getChainInfo } from '../constants/chainInfo'

export default function useSwitchingNetwork() {
  const { library } = useWeb3React()

  const [state, doSwitch] = useAsyncFn(
    async (fromChainID: SupportedChainId) => {
      if (library == undefined || library == null || fromChainID == null) {
        return
      }
      const unsupported = false

      const network = getChainInfo(fromChainID)

      if (network) {
        await switchEthereumChain(fromChainID, network.label, FALLBACK_URLS[fromChainID], library, unsupported)
      } else {
        console.error('not find network')
      }
    },
    [library]
  )

  return {
    state,
    doSwitch
  }
}
