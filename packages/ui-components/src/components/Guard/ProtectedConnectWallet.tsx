import { useWeb3React } from '@web3-react/core'
import EventBus from '../../EventEmitter/index'
import React, { useCallback } from 'react'
import { useAppStore } from '../../state'
import { isCosmosChain, SupportedChainId } from '../../constants/chains'
import { useWallet } from '@solana/wallet-adapter-react'

export const ProtectedConnectWallet = ({ children, className }: { children: JSX.Element; className?: string }) => {
  const { account } = useWeb3React()
  const { publicKey } = useWallet()
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddresses = useAppStore(state => state.cosmosAddresses)
  const connectedChains = cosmosAddresses.filter(addr => addr.connected)

  const connectWallet = useCallback(() => {
    EventBus.emit('connectwallet')
  }, [])

  const isWalletConnected = useCallback(() => {
    if (fromChainID === SupportedChainId.SOLANA) {
      return !!publicKey
    }

    if (isCosmosChain(fromChainID)) {
      return connectedChains.some(chain => chain.chainId === fromChainID)
    }

    return !!account
  }, [fromChainID, publicKey, account, connectedChains])

  if (!isWalletConnected()) {
    return (
      <button
        onClick={connectWallet}
        className="px-6 py-3.5 text-white flex-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center"
      >
        Connect wallet
      </button>
    )
  }

  return children
}
