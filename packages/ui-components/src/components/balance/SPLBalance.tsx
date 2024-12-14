import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { When } from 'react-if'
import Skeleton from 'react-loading-skeleton'
import { useWallet } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import { FALLBACK_URLS } from '../../constants/networks'
import { SupportedChainId } from '../../constants/chains'
import useSWR from 'swr'

type Props = {
  chainid: SupportedChainId
  tokenAddress?: string
  decimals?: number
}

const RPC_URL = FALLBACK_URLS.solana[0]
const SOLANA_CONNECTION = new Connection(RPC_URL)

export function useSPLBalance(tokenAddress: string | undefined) {
  const { publicKey } = useWallet()

  const tokenMintAddress = useMemo(() => {
    try {
      return tokenAddress ? new PublicKey(tokenAddress) : null
    } catch (error) {
      return null
    }
  }, [tokenAddress])

  const fetchBalance = useCallback(async () => {
    if (publicKey && tokenMintAddress) {
      try {
        const response = await SOLANA_CONNECTION.getParsedTokenAccountsByOwner(publicKey, { mint: tokenMintAddress })
        if (response.value.length === 0) throw new Error('No token accounts found.')
        return response.value[0].account.data.parsed.info.tokenAmount.uiAmount
      } catch (error) {
        console.error(error)
        return null
      }
    }
    return null
  }, [publicKey, tokenMintAddress])

  const { data, error, isValidating } = useSWR(publicKey && tokenAddress ? [publicKey.toString(), tokenAddress, 'balance'] : null, fetchBalance)

  return {
    balance: data,
    error,
    isLoading: isValidating
  }
}

const Balance: React.FC<Props> = ({ chainid, tokenAddress, decimals }) => {
  const { publicKey } = useWallet()
  const tokenMintAddress = useMemo(() => {
    try {
      return tokenAddress ? new PublicKey(tokenAddress) : null
    } catch (error) {
      return null
    }
  }, [tokenAddress])

  const fetchBalance = useCallback(async () => {
    if (publicKey && tokenMintAddress) {
      try {
        const response = await SOLANA_CONNECTION.getParsedTokenAccountsByOwner(publicKey, { mint: tokenMintAddress })
        if (response.value.length === 0) throw new Error('No token accounts found.')
        return response.value[0].account.data.parsed.info.tokenAmount.uiAmount
      } catch (error) {
        console.error(error)
        return null
      }
    }
    return null
  }, [publicKey, tokenMintAddress])

  const { data, error, isValidating } = useSWR(publicKey && tokenAddress ? [publicKey.toString(), tokenAddress, 'balance'] : null, fetchBalance, {
    dedupingInterval: 45000
  })

  return (
    <div>
      <When condition={isValidating}>
        <Skeleton />
      </When>
      <When condition={!isValidating && data}>{data}</When>
      <When condition={!isValidating && !data}>0</When>
    </div>
  )
}

export default Balance
