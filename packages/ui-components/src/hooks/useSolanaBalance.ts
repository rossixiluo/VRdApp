import { useWallet } from '@solana/wallet-adapter-react'
import { useCallback } from 'react'
import { Connection } from '@solana/web3.js'
import { SupportedChainId } from '../constants/chains'
import { FALLBACK_URLS } from '../constants/networks'

import useSWR from 'swr'

export default function useSolanaBalance() {
  const { publicKey } = useWallet()

  const fetchData = useCallback(async () => {
    if (publicKey) {
      const RPC_URL = FALLBACK_URLS[SupportedChainId.SOLANA][0]
      const connection = new Connection(RPC_URL, 'confirmed')
      const balance = await connection.getBalance(publicKey)
      return balance
    } else {
      return '0'
    }
  }, [publicKey])

  const { data, error, isLoading } = useSWR(['SolanaBalance', publicKey?.toBase58()], fetchData, { refreshInterval: 10 * 1000, dedupingInterval: 15000 })

  return {
    balance: data,
    isloading: isLoading,
    error
  }
}
