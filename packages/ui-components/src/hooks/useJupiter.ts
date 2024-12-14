import { useCallback } from 'react'
import { PublicKey, VersionedTransaction, Connection } from '@solana/web3.js'
import useSWR from 'swr'
import { useWallet } from '@solana/wallet-adapter-react'
import { useAppStore } from '../state'
import { FALLBACK_URLS } from '../constants/networks'
import { SupportedChainId } from '../constants/chains'
import { pollTransaction } from '../utils/solana-utils'

export type RouteFee = {
  amount: number
  mint: string
  pct: number
}

export type RouteMarketInfo = {
  id: string
  label: string
  inputMint: string
  outputMint: string
  inAmount: number
  outAmount: number
  lpFee: RouteFee
  platformFee: RouteFee
  notEnoughLiquidity: boolean
  priceImpactPct: number
  minInAmount?: number
  minOutAmount?: number
}

export type Route = {
  inAmount: number
  outAmount: number
  amount: number
  otherAmountThreshold: number
  outAmountWithSlippage: number
  swapMode: string
  priceImpactPct: number
  marketInfos: RouteMarketInfo[]
}

export async function getRoutes(inputMint: string, outputMint: string, amount: string, slippageBps: string): Promise<any> {
  const params = {
    inputMint: inputMint,
    outputMint: outputMint,
    amount: amount.toString(),
    slippageBps: slippageBps,
    maxAccounts: '15'
  }

  const queryString = new URLSearchParams(params).toString()

  try {
    const response = await fetch('https://quote-api.jup.ag/v6/quote?' + queryString, {
      method: 'GET',
      // body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch routes:', error)
    throw error
  }
}

export async function swap(params: any) {
  try {
    const response = await fetch('https://quote-api.jup.ag/v6/swap', {
      method: 'POST',
      body: JSON.stringify(params),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Failed to fetch routes:', error)
    throw error
  }
}

type paramsType = {
  inputMint: PublicKey
  outputMint: PublicKey
  amount: string
  slippageBps: string
}

export const useJupiterQuote = (params?: paramsType) => {
  const fetchRoutes = useCallback(() => {
    if (!params) {
      return Promise.resolve(null)
    }
    const { inputMint, outputMint, amount, slippageBps } = params
    if (inputMint.toBase58() === outputMint.toBase58()) {
      return false
    }
    return getRoutes(inputMint.toBase58(), outputMint.toBase58(), amount, slippageBps)
  }, [params])

  const swrKey = params ? ['https://quote-api.jup.ag/v6/quote', params.inputMint, params.outputMint, params.amount, params.slippageBps] : null

  const { data, error } = useSWR(swrKey, fetchRoutes, {
    refreshInterval: 20 * 1000, // 20秒获取一次jup的报价
    shouldRetryOnError: false
  })

  return {
    data,
    isLoading: !error && !data,
    isError: error
  }
}

function base64ToUint8Array(base64String: string) {
  const binaryString = atob(base64String)
  const len = binaryString.length
  const bytes = new Uint8Array(len)
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export const useJupiterSwap = () => {
  const { publicKey, signTransaction, connected } = useWallet()
  const wallet = useWallet()
  const solanaQuoteResponse = useAppStore(state => state.solanaQuoteResponse)
  const setJupiterLoading = useAppStore(state => state.setJupiterLoading)

  const sendSwap = async () => {
    setJupiterLoading(true)
    const RPC_URL = FALLBACK_URLS[SupportedChainId.SOLANA][0]
    const connection = new Connection(RPC_URL)
    const swapParams = {
      userPublicKey: publicKey?.toBase58(),
      quoteResponse: JSON.parse(JSON.stringify(solanaQuoteResponse)),
      wrapAndUnwrapSol: true
    }
    const resSwap = await swap(swapParams)

    if (resSwap && resSwap.swapTransaction && signTransaction && connected) {
      const swapTransaction = resSwap.swapTransaction
      const swapTransactionBuf = base64ToUint8Array(swapTransaction)
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf)

      try {
        const signedTransaction = await wallet.sendTransaction(transaction, connection)
        console.info('Signed transaction', signedTransaction)

        const res = await pollTransaction(connection, signedTransaction, 3000, 120000)
        console.info('Transaction confirmed', res)
        setJupiterLoading(false)
        return true
      } catch (error) {
        console.error('Failed to sign transaction', error)
        setJupiterLoading(false)
        return false
      }
    }
  }

  return {
    sendSwap
  }
}
