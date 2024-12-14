import { useMemo } from 'react'
import { useWeb3React } from '@web3-react/core'

import useSWRImmutable from 'swr/immutable'
import { useAppStore } from '../state'
import { BigNumber, ethers } from 'ethers'
import useSWR from 'swr/immutable'
import { BaseQuote, cosmosFee, nobleFee } from '../constants/relayer'
import { NativeCoinAddress } from '../constants/usdc'
import api from '../api/fetch'
import { Quote } from '../types/quote'
import useUSDCAddress from './useUsdc'
import { isEqual } from 'lodash-es'
import { getRoutes } from './useJupiter'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { amountThreshold } from '../constants/relayer'
import { uniswapTokenList } from '../constants/relayer'
import { RootTokenList } from '../types/token'
import { toDecimal } from '../utils'

export default function useQuote(isneedSwap: boolean, isFrom: boolean, sellAmount?: string) {
  const { account } = useWeb3React()

  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const error_ = useAppStore(state => state.error)

  const inputAmount = useAppStore(state => state.input)
  const ChainID = isFrom ? fromChainID : toChainID
  const amount = isFrom ? inputAmount : sellAmount

  const usdcAddress = useUSDCAddress(ChainID)
  const usdcAddressFrom = useUSDCAddress(fromChainID)
  const usdcAddressTo = useUSDCAddress(toChainID)
  const setSrcGrossPrice = useAppStore(state => state.setSrcGrossPrice)

  const { data: tokenList } = useSWRImmutable('tokenList', async () => {
    // const tokenUrl = TokenList_Chainid[chainid]
    const tokenUrl = uniswapTokenList
    const res = await api.get<RootTokenList>(tokenUrl)
    return res
  })

  const isSwap = useMemo(() => {
    // 目标链是solana，且不是USDC，需要调用jupiter算出最大买入量
    if (toChainID == 'solana' && toToken?.symbol !== 'USDC' && !isFrom) {
      return true
    }

    // if (!usdcAddress?.startsWith('0x')) {
    //   return false
    // }

    if (fromToken && fromToken.chainId === 'solana' && fromToken.symbol !== 'USDC' && toToken !== null && !isEqual(fromToken, toToken) && inputAmount !== '0') {
      return true
    }

    return fromToken !== null && isneedSwap && toToken !== null && !isEqual(fromToken, toToken) && error_ == '' && inputAmount !== '0'
  }, [fromToken, toToken, isneedSwap, error_, inputAmount, toChainID, isFrom])

  const fromAddress = fromToken?.address
  const toAddress = toToken?.address
  const tokenAddress = isFrom ? fromToken?.address : toToken?.address

  const ContainsSolana = fromChainID === SupportedChainId.SOLANA || toChainID === SupportedChainId.SOLANA
  // console.info(isSwap, ContainsSolana)

  const {
    data: solanaData,
    error: solanaError,
    isLoading: solanaIsLoading
  } = useSWR(
    isSwap && ContainsSolana
      ? ['BaseQuote', account, ChainID, tokenAddress, amount, usdcAddress, isFrom, fromAddress, toAddress, inputAmount, fromToken]
      : null,
    async ([key, account, ChainID, tokenAddress, amount, usdcAddress, isFrom, fromAddress, toTokenaddress, inputAmount]) => {
      // console.info(account)
      if (fromChainID !== null && tokenAddress !== undefined && inputAmount !== undefined) {
        const buyToken = isFrom
          ? fromChainID !== toChainID
            ? usdcAddress
            : toTokenaddress == ''
            ? NativeCoinAddress
            : toTokenaddress
          : tokenAddress == ''
          ? NativeCoinAddress
          : tokenAddress

        const sellToken = isFrom ? (tokenAddress == '' ? NativeCoinAddress : tokenAddress) : usdcAddress
        const sellAmount = inputAmount
        const chainid = ChainID

        if (!sellAmount || sellAmount === '0') return false

        // 目标链是solana，且不是USDC，需要调用jupiter算出最大买入量
        if (!isFrom && toChainID == SupportedChainId.SOLANA && toToken?.symbol !== 'USDC' && usdcAddressTo && toToken) {
          // console.info(!isFrom, toChainID == SupportedChainId.SOLANA, toToken?.symbol !== 'USDC', usdcAddressTo, toToken)
          let amount = sellAmount
          if (fromToken?.symbol !== 'USDC') {
            const _buyToken = fromAddress || NativeCoinAddress
            const url = `${BaseQuote}?buyToken=${usdcAddressFrom}&sellToken=${_buyToken}&sellAmount=${sellAmount}&chainid=${fromChainID}`
            const data = await api.get<Quote>(url)
            amount = data.grossBuyAmount
          }

          const toTokenAddress = toAddress || 'So11111111111111111111111111111111111111112'
          const res = await getRoutes(usdcAddressTo, toTokenAddress, amount, amountThreshold)
          return {
            inAmount: res.inAmount,
            grossBuyAmount: res.outAmount,
            otherAmountThreshold: res.otherAmountThreshold,
            outputMint: res.outputMint
          }
        }

        // 源链时solana，且不是USDC，需要调用jupiter和relayer算出最大买入量
        if (fromChainID === SupportedChainId.SOLANA && toChainID !== SupportedChainId.SOLANA && fromToken && fromToken?.symbol !== 'USDC' && usdcAddressFrom) {
          const fromTokenAddress = fromAddress || 'So11111111111111111111111111111111111111112'
          let amount = sellAmount
          const res = await getRoutes(fromTokenAddress, usdcAddressFrom, amount, amountThreshold)

          amount = res.outAmount
          if (isFrom && toToken?.symbol === 'USDC') {
            return {
              inAmount: res.inAmount,
              grossBuyAmount: res.outAmount,
              otherAmountThreshold: res.otherAmountThreshold,
              outputMint: res.outputMint
            }
          }
          if (fromChainID === SupportedChainId.SOLANA) {
            const tokenDetail = tokenList?.splTokens.find(item => item.address === res.outputMint)

            if (tokenDetail) {
              const tokenDecimals = tokenDetail.decimals
              const grossBuyAmount = toDecimal(BigNumber.from(res.outAmount), tokenDecimals)
              const usdcDecimals = 6
              const inAmount = toDecimal(BigNumber.from(res.inAmount), usdcDecimals)
              const ratio = fromToken?.symbol.indexOf('SOL') > -1 ? (grossBuyAmount * 1000) / inAmount : grossBuyAmount / inAmount
              setSrcGrossPrice(ratio.toFixed(6))
            }
          }
          if (isCosmosChain(toChainID)) {
            return null
          }
          const url = `${BaseQuote}?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${amount}&chainid=${chainid}` // 0x 不支持solana id
          // console.info(url)
          const data = await api.get<Quote>(url)

          if (data.code == undefined) {
            return data
          }
        }

        if (buyToken === sellToken) {
          return {
            grossBuyAmount: sellAmount
          }
        }

        const url = `${BaseQuote}?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&chainid=${chainid}`
        const data = await api.get<Quote>(url)
        // console.info(isneedSwap, isFrom, url, data)
        if (data.code == undefined) {
          return data
        } else {
          if (data.validationErrors && data.validationErrors.length > 0) {
            throw new Error(data.validationErrors[0].description)
          } else {
            throw new Error(data.reason)
          }
        }
      }
    }
  )

  const {
    data: originData,
    error: originError,
    isLoading: originIsLoading
  } = useSWR(
    isSwap && !ContainsSolana ? ['BaseQuoteEvm', account, ChainID, tokenAddress, amount, usdcAddress, isFrom, toToken?.address] : null,
    async ([key, account, ChainID, tokenAddress, inputAmount, usdcAddress, isFrom, toTokenaddress]) => {
      // console.info(ChainID, isFrom)
      // if (isCosmosChain(fromChainID) && fromChainID !== SupportedChainId.NOBLE) {
      //   inputAmount = (Number(inputAmount) - Number(cosmosFee)).toString()
      // }
      // if (fromChainID === SupportedChainId.NOBLE && isFrom) {
      //   inputAmount = (Number(inputAmount) - Number(nobleFee)).toString()
      // }
      // console.info(inputAmount, Number(cosmosFee))
      if (account && fromChainID !== null && tokenAddress !== undefined && inputAmount !== undefined) {
        const buyToken = isFrom
          ? fromChainID !== toChainID
            ? usdcAddress
            : toTokenaddress == ''
            ? NativeCoinAddress
            : toTokenaddress
          : tokenAddress == ''
          ? NativeCoinAddress
          : tokenAddress

        const sellToken = isFrom ? (tokenAddress == '' ? NativeCoinAddress : tokenAddress) : usdcAddress
        const sellAmount = inputAmount
        const chainid = ChainID

        const url = `${BaseQuote}?buyToken=${buyToken}&sellToken=${sellToken}&sellAmount=${sellAmount}&chainid=${chainid}`
        const data = await api.get<Quote>(url)
        if (data.code == undefined) {
          return data
        } else {
          if (data.validationErrors && data.validationErrors.length > 0) {
            throw new Error(data.validationErrors[0].description)
          } else {
            throw new Error(data.reason)
          }
        }
      }
    }
  )

  return {
    data: ContainsSolana ? solanaData : originData,
    isloading: ContainsSolana ? solanaIsLoading : originIsLoading,
    error: ContainsSolana ? solanaError : originError
  }
}
