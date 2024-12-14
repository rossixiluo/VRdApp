import { useCallback } from 'react'

import { useAppStore } from '../../state'
import swichImg from '../../assets/switch.svg'

const TokenSwichPanel = () => {
  const setFromOrTOChain = useAppStore(state => state.setFromOrTOChain)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const fromChainInfo = useAppStore(state => state.fromChain)
  const toChainInfo = useAppStore(state => state.toChain)

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const setToken = useAppStore(state => state.setToken)

  const swichFN = useCallback(() => {
    if (fromChainInfo && toChainInfo && fromChainID !== null && toChainID !== null) {
      setFromOrTOChain(fromChainInfo, false, fromChainID) //false to
      setFromOrTOChain(toChainInfo, true, toChainID) //true from
      setToken(false, fromToken)
      setToken(true, toToken)
    }
  }, [fromChainID, toChainID, fromChainInfo, toChainInfo, setFromOrTOChain, fromToken, toToken, setToken])

  return (
    <button
      onClick={swichFN}
      className="relative mx-auto -mt-2.5 flex h-[42px] w-[42px] items-center justify-center rounded-full border-4 border-valuerouter-switch bg-valuerouter-switch disabled:opacity-60  "
    >
      <img src={swichImg} className="h-5 w-5" />
    </button>
  )
}

export default TokenSwichPanel
