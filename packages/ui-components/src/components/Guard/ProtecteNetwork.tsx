import React, { useCallback, useRef } from 'react'
import useSwitchingNetwork from '../../hooks/useSwitchingNetwork'
import { useAppStore } from '../../state'
import { useWeb3React } from '@web3-react/core'
import { SupportedChainId, isCosmosChain } from '../../constants/chains'

const ProtecteNetwork = ({ children, className }: { children: JSX.Element; className?: string }) => {
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const switchingNetwork = useSwitchingNetwork()
  const fromChainInfo = useAppStore(state => state.fromChain)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const { chainId } = useWeb3React()
  const clickRef = useRef<boolean>(false)

  const clickFn = useCallback(() => {
    if (clickRef.current) return
    clickRef.current = true
    if (fromChainID !== null) {
      switchingNetwork.doSwitch(fromChainID)
    }
    clickRef.current = false
  }, [fromChainID, switchingNetwork])

  if (fromChainID === SupportedChainId.SOLANA && toChainID === SupportedChainId.SOLANA) {
    return children
  }

  if (fromChainID == toChainID && toToken?.address == fromToken?.address) {
    return (
      <button
        disabled
        className="px-6 py-3.5 text-white flex-1 bg-red-400 hover:bg-red-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto  text-center 0"
      >
        {' '}
        Sources and targets cannot be the same
      </button>
    )
  }

  if (fromChainID !== chainId && fromChainID !== SupportedChainId.SOLANA && !isCosmosChain(fromChainID)) {
    return (
      <button
        onClick={() => {
          clickFn()
        }}
        className="px-6 py-3.5 text-white flex-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto  text-center 0"
      >
        Switch to {fromChainInfo?.label}
      </button>
    )
  }

  return children
}

export default ProtecteNetwork
