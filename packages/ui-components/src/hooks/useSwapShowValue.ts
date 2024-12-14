import { useEffect } from 'react'
import useSWRImmutable from 'swr/immutable'
import useSwapBuildParameter from './useSwapBuildParameter'
import { useAppStore } from '../state'
import { BigNumber, ethers } from 'ethers'
import { ThousandageValue } from '../utils'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { uniswapTokenList } from '../constants/relayer'
import { RootTokenList } from '../types/token'
import api from '../api/fetch'
type SwapShowValue = ReturnType<typeof useSwapBuildParameter>
// 将 BigNumber 转换为具有正确小数位的数字
const toDecimal = (amount: BigNumber, decimals: number) => {
  return amount.div(BigNumber.from(10).pow(decimals)).toNumber() + amount.mod(BigNumber.from(10).pow(decimals)).toNumber() / Math.pow(10, decimals)
}
export default function useSwapShowValue({
  isSameChain,
  isFromNeedSwap,
  isToNeedSwap,
  sellArgs,
  buyArgs,
  error,
  quoteDataSell,
  quoteDataBuy,
  quotebuyAmount,
  input
}: SwapShowValue) {
  // const setFee = useAppStore(state => state.setFee)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  // const toToken = useAppStore(state => state.toToken)
  const setSrcGrossPrice = useAppStore(state => state.setSrcGrossPrice)
  const setDestGrossPrice = useAppStore(state => state.setDestGrossPrice)

  const setDestEstimatedReceived = useAppStore(state => state.setDestEstimatedReceived)
  const setDestMinimumReceived = useAppStore(state => state.setDestMinimumReceived)
  const setQuoteLoading = useAppStore(state => state.setQuoteLoading)
  const setWillReceiveToken = useAppStore(state => state.setWillReceiveToken)

  const { data } = useSWRImmutable('tokenList', async () => {
    // const tokenUrl = TokenList_Chainid[chainid]
    const tokenUrl = uniswapTokenList
    const res = await api.get<RootTokenList>(tokenUrl)
    return res
  })

  useEffect(() => {
    // setSrcGrossPrice('0')
    // 源链是Noble，目标链的目标token是USDC的情况下是1
    // console.info(toToken)
    const fromUSDC = fromToken && fromToken?.symbol.indexOf('USDC') > -1
    // const destUSDC = toToken && toToken?.symbol.indexOf('USDC') > -1;
    if (isCosmosChain(fromChainID)) {
      setSrcGrossPrice('1')
      return
    }
    // console.info('quoteDataBuy: ', quoteDataBuy)
    // console.info('quoteDataSell: ', quoteDataSell)
    if (fromChainID === SupportedChainId.SOLANA) {
      // console.info(quoteDataSell)
      if (fromUSDC) {
        setSrcGrossPrice('1')
        return
      }

      const tokenDetail = data?.splTokens.find(item => item.address === quoteDataSell.data?.outputMint)
      if (tokenDetail) {
        const tokenDecimals = tokenDetail.decimals
        const grossBuyAmount = toDecimal(BigNumber.from(quoteDataSell.data.grossBuyAmount), tokenDecimals)
        const usdcDecimals = 6 // USDC 的小数位数
        const inAmount = toDecimal(BigNumber.from(quoteDataSell.data.inAmount), usdcDecimals)
        const ratio = fromToken && fromToken?.symbol.indexOf('SOL') > -1 ? (grossBuyAmount * 1000) / inAmount : grossBuyAmount / inAmount
        setSrcGrossPrice(ratio.toFixed(6))
      }
      return
    }
    if (fromToken?.address === '' && toToken && toToken.name.indexOf('Wrapped') > -1) {
      setSrcGrossPrice('1')
      return
    }

    if (isFromNeedSwap) {
      if (quoteDataSell.data == undefined) {
        return
      }
      setSrcGrossPrice(quoteDataSell.data.grossPrice)
    }
  }, [isFromNeedSwap, quoteDataSell, quoteDataBuy, setSrcGrossPrice, fromChainID, toToken, fromToken, data])

  useEffect(() => {
    if (quoteDataSell.isloading || quoteDataBuy.isloading) {
      setQuoteLoading(true)
    } else if (quoteDataSell.isloading == false && quoteDataBuy.isloading == false) {
      setQuoteLoading(false)
    }
  }, [quoteDataSell, quoteDataBuy, setQuoteLoading])

  useEffect(() => {
    setDestEstimatedReceived('0')
    setDestMinimumReceived('0')

    if (isCosmosChain(toChainID)) {
      setDestGrossPrice('1')
      if (quoteDataBuy && quoteDataBuy.data) {
        const guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataBuy.data.grossBuyAmount), 10).toString()
        setDestEstimatedReceived(quoteDataBuy.data.grossBuyAmount)
        setDestMinimumReceived(guaranteedBuyAmount.toString())
      }
      if (quoteDataSell && quoteDataSell.data) {
        const guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataSell.data.grossBuyAmount), 10).toString()
        setDestEstimatedReceived(quoteDataSell.data.grossBuyAmount)
        setDestMinimumReceived(guaranteedBuyAmount.toString())
      }

      return
    }

    if (toChainID === SupportedChainId.SOLANA) {
      if (fromToken && fromToken?.symbol === 'USDC' && toToken && toToken?.symbol === 'USDC') {
        setDestGrossPrice('1')
        return
      }

      // isSwap
      if (quoteDataBuy && quoteDataBuy.data && quoteDataBuy.data.grossBuyAmount !== undefined) {
        setDestEstimatedReceived(quoteDataBuy.data?.grossBuyAmount)
        setDestMinimumReceived(quoteDataBuy.data?.otherAmountThreshold)
        const tokenDetail = data?.splTokens.find(item => item.address === quoteDataBuy.data?.outputMint)
        if (tokenDetail && quoteDataBuy.data?.grossBuyAmount && quoteDataBuy.data?.inAmount) {
          const tokenDecimals = tokenDetail.decimals
          const usdcDecimals = 6 // USDC 的小数位数

          const grossBuyAmount = toDecimal(BigNumber.from(quoteDataBuy.data.grossBuyAmount), tokenDecimals)
          const inAmount = toDecimal(BigNumber.from(quoteDataBuy.data.inAmount), usdcDecimals)

          // 计算比率：每单位 USDC 可以兑换多少目标代币
          const ratio = inAmount / grossBuyAmount

          // 设置目标价格，保留6位小数
          setDestGrossPrice(ratio.toFixed(6))

          return
        }
        // setDestGrossPrice((quoteDataBuy.data?.grossBuyAmount / quoteDataBuy.data?.inAmount).toFixed(6))
        return
      }

      if (toToken && toToken?.symbol === 'USDC') {
        if (quoteDataSell?.data) {
          const guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataSell.data?.grossBuyAmount), 10).toString()
          setDestEstimatedReceived(quoteDataSell?.data?.grossBuyAmount)
          setDestMinimumReceived(guaranteedBuyAmount.toString())
        }
      }

      setDestGrossPrice('0')
      return
    }
    // console.info(quoteDataBuy, isSameChain, isFromNeedSwap, isToNeedSwap)
    let guaranteedBuyAmount
    if (isSameChain) {
      if (isFromNeedSwap) {
        if (quoteDataSell.data && quoteDataSell.data.grossBuyAmount !== undefined) {
          guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataSell.data.grossBuyAmount), 10).toString()
          setDestEstimatedReceived(quoteDataSell.data.grossBuyAmount)
          setDestMinimumReceived(guaranteedBuyAmount.toString())
          setDestGrossPrice(quoteDataSell.data.grossPrice)
        }
      }
    } else {
      if (isToNeedSwap) {
        if (quoteDataBuy?.data) {
          guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataBuy.data?.grossBuyAmount), 10).toString()
          setDestEstimatedReceived(quoteDataBuy?.data?.grossBuyAmount)
          setDestMinimumReceived(guaranteedBuyAmount.toString())
          const num1 = ethers.utils.parseEther('1000') //1*1000
          const num2 = ethers.utils.parseEther(quoteDataBuy.data.grossPrice)

          setDestGrossPrice((num1.div(num2).toNumber() / 1000).toString())
        }
      } else if (isFromNeedSwap) {
        if (quoteDataSell.data) {
          // console.info(quoteDataSell.data.grossBuyAmount)
          guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataSell.data.grossBuyAmount), 10).toString()
          setDestEstimatedReceived(quoteDataSell.data.grossBuyAmount)
          setDestMinimumReceived(guaranteedBuyAmount.toString())
          setDestGrossPrice(quoteDataSell.data.grossPrice)
        }
      } else {
        setDestEstimatedReceived(input)
        setDestMinimumReceived(input)
        setDestGrossPrice('1')
      }
    }

    if (fromChainID === SupportedChainId.SOLANA && fromToken?.symbol !== 'USDC' && toToken?.symbol !== 'USDC') {
      if (quoteDataBuy.data) {
        const guaranteedBuyAmount = ThousandageValue(BigNumber.from(quoteDataBuy.data.grossBuyAmount), 50).toString()
        setDestEstimatedReceived(quoteDataBuy.data.grossBuyAmount)
        setDestMinimumReceived(guaranteedBuyAmount.toString())
        const ratio = 1 / quoteDataBuy.data.grossPrice
        setDestGrossPrice(ratio.toFixed(6))
      }
    }
    // guaranteedBuyAmount=guaranteedBuyAmount||'0'
  }, [
    setDestGrossPrice,
    setDestEstimatedReceived,
    setDestMinimumReceived,
    isToNeedSwap,
    quoteDataBuy,
    quotebuyAmount,
    input,
    isFromNeedSwap,
    isSameChain,
    quoteDataSell,
    toChainID,
    fromToken,
    toToken,
    buyArgs,
    error,
    sellArgs,
    data,
    fromChainID
  ])

  useEffect(() => {
    if (isSameChain) {
      if (fromToken?.address === '' && toToken && toToken.name.indexOf('Wrapped') > -1) {
        setWillReceiveToken(input)
        return
      }
      if (isFromNeedSwap) {
        if (quoteDataSell.data?.grossBuyAmount == undefined) return
        setWillReceiveToken(quoteDataSell.data?.grossBuyAmount)
      }
    } else {
      if (isToNeedSwap) {
        if (quoteDataBuy.data?.grossBuyAmount == undefined) return
        setWillReceiveToken(quoteDataBuy.data?.grossBuyAmount)
      } else if (isFromNeedSwap) {
        if (quoteDataSell.data?.grossBuyAmount == undefined) return
        setWillReceiveToken(quoteDataSell.data?.grossBuyAmount)
      } else {
        // solana token 兑换 usdc 问题临时解决
        if (quoteDataBuy.data?.grossBuyAmount) {
          setWillReceiveToken(quoteDataBuy.data?.grossBuyAmount)
          return
        }
        //usdc->usdc
        setWillReceiveToken(input)
      }
    }
  }, [setWillReceiveToken, isToNeedSwap, isFromNeedSwap, quoteDataBuy.data, quoteDataSell.data, input, isSameChain, fromToken, toToken])
}
