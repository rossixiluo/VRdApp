import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useAppStore } from '../state'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import useSolanaAccount from '../hooks/useSolanaAccount'

export function useCusRecipientAddress() {
  const { account } = useWeb3React()
  const { publicKey: solanaPublicKey } = useSolanaAccount()
  const toChainID = useAppStore(state => state.toChainID)
  const CosmosAccount = useAppStore(state => state.getCosmosAddress(toChainID as string))
  const CustomRecipientAddressAll = useAppStore(state => state.CustomRecipientAddressAll)
  const removeCustomRecipientAddress = useAppStore(state => state.removeCustomRecipientAddress)

  const recipientAddressForChain = useMemo(() => {
    if (toChainID) {
      const item = CustomRecipientAddressAll.find(item => item.chainId === toChainID)

      if (item && item.address) {
        return item.address
      } else {
        if (toChainID === SupportedChainId.SOLANA) {
          return solanaPublicKey?.toBase58()
        } else if (isCosmosChain(toChainID)) {
          return CosmosAccount
        } else {
          return account
        }
      }
    }
  }, [toChainID, CustomRecipientAddressAll, CosmosAccount, account, solanaPublicKey])

  return {
    removeCustomRecipientAddress,
    getRecipientAddressForChain: () => recipientAddressForChain as string
  }
}
