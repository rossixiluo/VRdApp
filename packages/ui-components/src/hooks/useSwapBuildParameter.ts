import useUSDCAddress from './useUsdc'
import { useAppStore } from '../state'
import { useMemo } from 'react'
import { PublicKey } from '@solana/web3.js'
import { NativeCoinAddress } from '../constants/usdc'
import useQuote from './useQuote'
import { BigNumber, ethers } from 'ethers'
import useRelayerFee from './useRelayerFee'
import { IncreasingPercentageValue, ThousandageValue } from '../utils'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { useCusRecipientAddress } from './useCusRecipientAddress'
import { COSMOS_CHAIN_CONFIG } from '../constants/networks'

import { bech32 } from 'bech32'
function convertOsmosisToNobleAddress(osmosisAddress: string): string {
  // 解码 Osmosis 地址
  const decoded = bech32.decode(osmosisAddress)

  // 提取公钥哈希
  const pubkeyHash = decoded.words

  // 使用 Noble 的前缀重新编码地址
  const nobleAddress = bech32.encode('noble', pubkeyHash)

  return nobleAddress
}

const stringToBytes = (str: string): Uint8Array => {
  return new TextEncoder().encode(str)
}

export default function useSwapBuildParameter() {
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const input = useAppStore(state => state.input)
  const solanaInput = useAppStore(state => state.solanaInput)
  // const setWillReceiveToken = useAppStore(state => state.setWillReceiveToken)
  const { fee: dataFee } = useRelayerFee()
  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const CusRecipientAddress: string = getRecipientAddressForChain()

  // const setFee = useAppStore(state => state.setFee)
  // const setSrcGrossPrice = useAppStore(state => state.setSrcGrossPrice)
  // const setDestGrossPrice = useAppStore(state => state.setDestGrossPrice)

  // const setDestEstimatedReceived = useAppStore(state => state.setDestEstimatedReceived)
  // const setDestMinimumReceived = useAppStore(state => state.setDestMinimumReceived)

  const usdcFrom = useUSDCAddress(fromChainID)
  const usdcTo = useUSDCAddress(toChainID)

  const isFromNeedSwap = useMemo(() => {
    if (isCosmosChain(fromChainID)) {
      return false
    }
    // if (fromChainID == SupportedChainId.SOLANA && fromToken?.symbol === 'USDC') {
    //   //  && fromToken?.symbol === 'USDC'
    //   return false
    // }
    if (fromChainID !== toChainID && fromToken?.address.toLowerCase() == usdcFrom?.toLowerCase()) {
      return false
    } else {
      return true
    }
  }, [fromToken, usdcFrom, fromChainID, toChainID])

  const quoteDataSell: any = useQuote(isFromNeedSwap, true)

  const isToNeedSwap = useMemo(() => {
    if (isCosmosChain(toChainID)) {
      return false
    }
    // 目标链是solana，且不是USDC，需要调用jupiter算出最大买入量
    // if (toChainID == SupportedChainId.SOLANA) {
    //   if (toToken?.symbol == 'USDC') {
    //     return false
    //   } else {
    //     return true
    //   }
    // }
    if (toToken?.address.toLowerCase() != usdcTo?.toLowerCase() && fromChainID !== toChainID) {
      return true
    } else {
      return false
    }
  }, [toToken, usdcTo, fromChainID, toChainID])

  const slippageGrossBuyAmount = useMemo(() => {
    let fromNum: string | undefined
    if (isFromNeedSwap) {
      if (quoteDataSell.data == undefined) {
        return
      }
      fromNum = quoteDataSell.data?.grossBuyAmount || quoteDataSell.data?.buyAmount || '0'
      // console.log('fromNum', fromNum)
      fromNum = ThousandageValue(BigNumber.from(fromNum), 10).toString()
      // console.log('fromNum', fromNum)
      //Reduced values provide success rates
    } else {
      if (fromChainID == SupportedChainId.SOLANA) {
        fromNum = solanaInput
      } else {
        fromNum = input
      }
    }

    return fromNum
  }, [isFromNeedSwap, input, solanaInput, fromChainID, quoteDataSell.data])

  const quotebuyAmount = useMemo(() => {
    // if (dataFee !== undefined) {
    //   setFee(dataFee.toString())
    // } else {
    //   setFee('0')
    // }
    if (slippageGrossBuyAmount == undefined) {
      return
    }

    return slippageGrossBuyAmount
  }, [slippageGrossBuyAmount])

  const quoteDataBuy: any = useQuote(isToNeedSwap, false, quotebuyAmount)

  // const quoteDataBuy = {
  //   data: {
  //     grossBuyAmount: '10000'
  //   },
  //   error: null
  // }

  /*
        struct SellArgs {
        address sellToken;
        uint256 sellAmount;
        uint256 sellcallgas;
        bytes sellcalldata;
    }

    struct BuyArgs {
        bytes32 buyToken;
        uint256 guaranteedBuyAmount;
        uint256 buycallgas;
        bytes buycalldata;
    }
    */

  const sellArgs = useMemo(() => {
    if (fromToken == null || input == '0') return null
    // console.info('isFromNeedSwap', isFromNeedSwap)
    // console.info('quoteDataSell', quoteDataSell.data)
    // console.info('slippageGrossBuyAmount', slippageGrossBuyAmount)
    if (isFromNeedSwap == true && quoteDataSell.data == undefined && slippageGrossBuyAmount == undefined) {
      return null
    }
    const sellToken = isFromNeedSwap ? (fromToken.address == '' ? NativeCoinAddress : fromToken.address) : usdcFrom
    const sellAmount = input
    const sellcallgas = isFromNeedSwap ? quoteDataSell.data?.gas : '0'
    const sellcalldata = isFromNeedSwap ? quoteDataSell.data?.data : '0x0000000000000000000000000000000000000000000000000000000000000000'

    const guaranteedBuyAmount = isFromNeedSwap ? slippageGrossBuyAmount : '0'

    return {
      sellToken,
      sellAmount,
      sellcallgas: IncreasingPercentageValue(sellcallgas, 100),
      sellcalldata,
      guaranteedBuyAmount,
      buyToken:
        fromChainID !== toChainID && usdcFrom?.toLowerCase() == quoteDataSell.data?.buyTokenAddress
          ? '0x0000000000000000000000000000000000000000'
          : quoteDataSell.data?.buyTokenAddress
    }
  }, [isFromNeedSwap, fromToken, input, quoteDataSell.data, usdcFrom, slippageGrossBuyAmount, fromChainID, toChainID])

  const buyArgs = useMemo(() => {
    if (toToken == null) return null
    if (isToNeedSwap && quoteDataBuy.data == undefined) return null

    const buyToken = isToNeedSwap ? (toToken.address == '' ? NativeCoinAddress : toToken.address) : usdcTo
    if (buyToken == undefined) {
      return null
    }

    // 目标链滑点 evm - 千分之10， solana 直接使用 otherAmountThreshold
    const guaranteedBuyAmount = isToNeedSwap
      ? quoteDataBuy.data?.otherAmountThreshold || ThousandageValue(BigNumber.from(quoteDataBuy.data?.grossBuyAmount ?? '0'), 10).toString()
      : quotebuyAmount || '0'
    // const guaranteedBuyAmount = isToNeedSwap ? ThousandageValue(BigNumber.from(quoteDataBuy.data?.grossBuyAmount), 5) : quotebuyAmount || '0'

    // const buycallgas = isToNeedSwap ? quoteDataBuy.data?.gas : '0'
    // const buycalldata = isToNeedSwap ? quoteDataBuy.data?.data : '0x0000000000000000000000000000000000000000000000000000000000000000'
    const tokenAddress = usdcTo?.toLowerCase() == buyToken.toLowerCase() ? '0x0000000000000000000000000000000000000000' : buyToken
    let buyTokenAddresds

    if (toChainID === SupportedChainId.SOLANA) {
      // 目标链 SOL，传入合约为WSOL，合约会转成SOL到用户地址
      const _buyToken = buyToken === NativeCoinAddress ? 'So11111111111111111111111111111111111111112' : buyToken
      const publicKey = new PublicKey(_buyToken)
      const hexAddress = Array.from(publicKey.toBytes())
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      buyTokenAddresds = '0x' + hexAddress
    } else {
      buyTokenAddresds = ethers.utils.hexZeroPad(tokenAddress, 32)
    }

    // const nobleAddress = convertOsmosisToNobleAddress('osmo185yqr22vfqjgtxkasjlz7gfs24c7tgvj3md8xs')

    let bytesHex = ''

    if (toChainID && toChainID !== SupportedChainId.NOBLE && isCosmosChain(toChainID)) {
      const cosmosChainConfig = COSMOS_CHAIN_CONFIG[toChainID as keyof typeof COSMOS_CHAIN_CONFIG]

      const bytes = stringToBytes(JSON.stringify({ destChainName: cosmosChainConfig.destChainName, recipient: CusRecipientAddress }))
      bytesHex = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
    }

    return {
      buyToken: buyTokenAddresds,
      guaranteedBuyAmount,
      memo: '0x' + bytesHex
      // buycallgas: 0,
      // buycalldata: '0x'
    }
  }, [isToNeedSwap, toToken, quoteDataBuy.data, quotebuyAmount, usdcTo, toChainID, CusRecipientAddress])

  return {
    isFromNeedSwap,
    isToNeedSwap,
    isSameChain: fromChainID == toChainID,
    sellArgs,
    buyArgs,
    error: quoteDataSell.error || quoteDataBuy.error,
    quoteDataSell,
    quoteDataBuy,
    quotebuyAmount,
    input,
    relayerFee: dataFee
  }
}
