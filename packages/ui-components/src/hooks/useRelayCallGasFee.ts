import { useWeb3React } from '@web3-react/core'
import { useState, useMemo, useCallback, useEffect } from 'react'
import { BigNumber, Contract, ethers } from 'ethers'
import type { ContractTransaction } from 'ethers'
import { PublicKey } from '@solana/web3.js'
import { useDebounce } from 'react-use'
import UsdcRelayerABI from './../constants/ABI/UsdcRelayer.json'
import useRelayerAddress from './useRelayer'

import { Circle_Chainid } from '../constants/relayer'
import { useAppStore } from '../state'

import useErcCheckAllowance from './useCheckAllowance'

import useSwapBuildParameter from './useSwapBuildParameter'
import { useCusRecipientAddress } from './useCusRecipientAddress'
import useSwapShowValue from './useSwapShowValue'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import useCosmosAddressToEvm from './useCosmosAddressToEvm'
import { amountThreshold } from '../constants/relayer'
import { useGetForwardingAddress } from '../hooks/useCosmosForwarding'
import { COSMOS_CHAIN_CONFIG } from '../constants/networks'

import { useJupiterQuote } from './useJupiter'
export default function useRelayCallGasFee() {
  const { library, account, chainId } = useWeb3React()

  const contractAddress = useRelayerAddress()

  const originalinput = useAppStore(state => state.originalinput)
  const inputAmount = useAppStore(state => state.input)
  const toChainID = useAppStore(state => state.toChainID)
  const fromChainID = useAppStore(state => state.fromChainID)
  const setGasFeeStore = useAppStore(state => state.setGasFee)
  const setError = useAppStore(state => state.setError)
  const error = useAppStore(state => state.error)

  const setWillReceiveToken = useAppStore(state => state.setWillReceiveToken)
  const setSolanaQuoteResponse = useAppStore(state => state.setSolanaQuoteResponse)

  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const CusRecipientAddress: string = getRecipientAddressForChain()
  const channel = toChainID ? COSMOS_CHAIN_CONFIG[toChainID as keyof typeof COSMOS_CHAIN_CONFIG]?.channel : ''
  const { address: fowardingAddress } = useGetForwardingAddress(channel, CusRecipientAddress || '')

  const { Validation2, allowanceValue, fetchAllowanceData } = useErcCheckAllowance()

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const SwapParameter = useSwapBuildParameter()
  useSwapShowValue(SwapParameter)

  const [gasFeeLoading, setGasFeeLoading] = useState(false)

  const comosEvmAddress = useCosmosAddressToEvm(CusRecipientAddress)
  const comosFowardingAddress = useCosmosAddressToEvm(fowardingAddress)

  const isAllowance = useMemo(() => {
    if (isCosmosChain(fromChainID)) {
      return true
    }

    return Validation2(allowanceValue, inputAmount) || fromToken?.address == ''
  }, [Validation2, inputAmount, allowanceValue, fromToken, fromChainID])

  useEffect(() => {
    if (SwapParameter.error) {
      setError(SwapParameter.error?.message)
    }
  }, [SwapParameter.error, setError])

  const jupiterSlippage = useAppStore(state => state.jupiterSlippage)
  const params = useMemo(() => {
    if (fromChainID !== SupportedChainId.SOLANA || toChainID !== SupportedChainId.SOLANA || !fromToken || !toToken || !originalinput) return

    let _fromToken
    let _toToken
    if (fromToken?.address === '') {
      _fromToken = 'So11111111111111111111111111111111111111112'
    } else {
      _fromToken = fromToken?.address || ''
    }
    if (toToken?.address === '') {
      _toToken = 'So11111111111111111111111111111111111111112'
    } else {
      _toToken = toToken?.address || ''
    }

    const slippageBps = jupiterSlippage && Number(jupiterSlippage) ? jupiterSlippage : amountThreshold

    const truncatedInput = Number(originalinput).toFixed(fromToken?.decimals || 0)
    const amountUnit = ethers.utils.parseUnits(truncatedInput, fromToken?.decimals || 0).toString()

    return {
      inputMint: new PublicKey(_fromToken),
      outputMint: new PublicKey(_toToken),
      amount: amountUnit,
      slippageBps: slippageBps + ''
    }
  }, [fromToken, toToken, originalinput, fromChainID, toChainID, jupiterSlippage])

  const { data } = useJupiterQuote(params)

  useEffect(() => {
    // Jupiter
    if (data && data.outAmount && fromChainID === SupportedChainId.SOLANA && toChainID === SupportedChainId.SOLANA) {
      setWillReceiveToken(data.outAmount)
      setSolanaQuoteResponse(data)
    }
  }, [data, setWillReceiveToken, setSolanaQuoteResponse, fromChainID, toChainID])

  const getgas = useCallback(
    async (isestimateGas: boolean) => {
      // console.info("contractAddress:", contractAddress)
      // console.info("comosEvmAddress:", comosEvmAddress)
      // console.info("toChainID:", toChainID)
      // console.info("isAllowance:", isAllowance)
      // console.info("SwapParameter.sellArgs:", SwapParameter.sellArgs)
      // console.info("SwapParameter.buyArgs:", SwapParameter.buyArgs)
      // console.info("account:", account)
      // console.info("fromChainID:", fromChainID)
      // console.info("chainId:", chainId)
      // console.info(SwapParameter)

      if (
        contractAddress == undefined ||
        (comosEvmAddress == undefined && (fromChainID === 'noble-1' || fromChainID === 'grand-1')) ||
        toChainID == null ||
        isAllowance == false ||
        SwapParameter.sellArgs == null ||
        SwapParameter.buyArgs == null ||
        account == undefined ||
        account == null ||
        fromChainID == null ||
        fromChainID !== chainId ||
        (fromChainID !== toChainID && SwapParameter.relayerFee == undefined)
      ) {
        return
      }

      // console.info('getgas')
      const signer = library.getSigner()
      const contract = new Contract(contractAddress, UsdcRelayerABI, signer)
      const destDomain = Circle_Chainid[toChainID]
      /**
     *    function swapAndBridge(
        SellArgs calldata sellArgs,
        BuyArgs calldata buyArgs,
        uint32 destDomain,
        bytes32 recipient
    ) public payable returns (uint64, uint64)
    */
      const sellArgs = SwapParameter.sellArgs
      const buyArgs = SwapParameter.buyArgs
      const value = fromToken?.address == '' ? inputAmount : '0'
      const accountRecipient = CusRecipientAddress || account
      let accounthex32
      if (comosEvmAddress && (toChainID == SupportedChainId.NOBLE_Test || toChainID == SupportedChainId.NOBLE)) {
        accounthex32 = ethers.utils.hexZeroPad(comosEvmAddress, 32)
      } else if (toChainID === SupportedChainId.SOLANA) {
        const publicKey = new PublicKey(accountRecipient)
        const hexAddress = Array.from(publicKey.toBytes())
          .map(b => b.toString(16).padStart(2, '0'))
          .join('')
        accounthex32 = '0x' + hexAddress
      } else if (comosFowardingAddress && isCosmosChain(toChainID)) {
        accounthex32 = ethers.utils.hexZeroPad(comosFowardingAddress, 32)
      } else {
        accounthex32 = ethers.utils.hexZeroPad(accountRecipient, 32)
      }

      const gasAndValue: { value?: string; gasLimit?: number } = {}
      if (value != '0') {
        gasAndValue.value = value
      }
      if (SwapParameter.relayerFee !== undefined && SwapParameter.isSameChain == false) {
        gasAndValue.value = BigNumber.from(gasAndValue.value || '0')
          .add(SwapParameter.relayerFee)
          .toString()
      }

      // buyArgs.buycallgas = '0';
      // buyArgs.buycalldata = '0x';
      // buyArgs.guaranteedBuyAmount = '0'

      // gasLimit 预估不准，全部乘以2
      sellArgs.sellcallgas = Number(sellArgs.sellcallgas) * 5 + ''

      if (isestimateGas) {
        setGasFeeLoading(true)
        try {
          // @ts-ignore
          if (fromToken?.address !== '' && fromChainID !== SupportedChainId.NOBLE && fromChainID !== SupportedChainId.NOBLE_Test) {
            const AllowanceData = await fetchAllowanceData()
            const isApprove = Validation2(AllowanceData, inputAmount)
            if (isApprove == false) {
              setGasFeeLoading(true)
              console.info('need approve')
              return
            }
          }
          let result

          if (fromChainID !== toChainID) {
            gasAndValue.gasLimit = 1000000
            // console.info(JSON.stringify({ sellArgs, buyArgs, destDomain, accounthex32, gasAndValue }))
            result = await contract.estimateGas.swapAndBridge(sellArgs, buyArgs, destDomain, accounthex32, gasAndValue)
          } else {
            gasAndValue.gasLimit = 1000000
            result = await contract.estimateGas.swap(
              sellArgs.sellcalldata,
              sellArgs.sellcallgas,
              sellArgs.sellToken,
              sellArgs.sellAmount,
              sellArgs.buyToken,
              sellArgs.guaranteedBuyAmount,
              accountRecipient,
              gasAndValue
            )
          }

          setGasFeeStore(result.toString())
        } catch (error: unknown) {
          setGasFeeLoading(false)
          //error.data.message

          const errorInfo = error as {
            reason: string
            message: string
            data: {
              message: string
            }
          }
          // console.info(errorInfo)
          setError(errorInfo.data?.message || errorInfo.message.substring(0, 200) + '...' || errorInfo.reason || 'call swap failed')
          throw error as Error
        }
        setGasFeeLoading(false)
      } else {
        try {
          let result: ContractTransaction
          if (fromChainID !== toChainID) {
            const _sellArgs = JSON.parse(JSON.stringify(sellArgs))
            console.info('sellArgs:', _sellArgs)
            console.info('buyArgs:', buyArgs)
            console.info('destDomain:', destDomain)
            console.info('accounthex32:', accounthex32)
            console.info('gasAndValue:', gasAndValue)
            gasAndValue.gasLimit = 1000000
            result = await contract.swapAndBridge(sellArgs, buyArgs, destDomain, accounthex32, gasAndValue)
          } else {
            console.info(
              sellArgs.sellcalldata,
              sellArgs.sellcallgas,
              sellArgs.sellToken,
              sellArgs.sellAmount,
              sellArgs.buyToken,
              sellArgs.guaranteedBuyAmount,
              accountRecipient,
              gasAndValue
            )
            gasAndValue.gasLimit = 1000000
            result = await contract.swap(
              sellArgs.sellcalldata,
              sellArgs.sellcallgas,
              sellArgs.sellToken,
              sellArgs.sellAmount,
              sellArgs.buyToken,
              sellArgs.guaranteedBuyAmount,
              accountRecipient,
              gasAndValue
            )
          }

          return result
        } catch (error: unknown) {
          console.info('error', error)
          throw error as Error
        }
      }
    },
    [
      library,
      contractAddress,
      setGasFeeStore,
      toChainID,
      account,
      SwapParameter.buyArgs,
      SwapParameter.sellArgs,
      setGasFeeLoading,
      isAllowance,
      inputAmount,
      fromToken?.address,
      CusRecipientAddress,
      setError,
      fetchAllowanceData,
      Validation2,
      fromChainID,
      chainId,
      SwapParameter.isSameChain,
      SwapParameter.relayerFee,
      comosEvmAddress,
      comosFowardingAddress
    ]
  )

  useDebounce(
    () => {
      if (error == '') {
        getgas(true)
      }
    },
    100,
    [getgas, error]
  )

  const sendTx = useCallback(() => {
    return getgas(false)
  }, [getgas])

  return {
    gasFeeLoading: gasFeeLoading,
    sendTx
  }
}
