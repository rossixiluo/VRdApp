import React, { useCallback, useEffect, useMemo, useState } from 'react'
import useSWRImmutable from 'swr/immutable'
import { useAppStore } from '../../state'
import { useToasts } from 'react-toast-notifications'
import { BigNumber } from 'ethers'
import { fromBech32 } from '@cosmjs/encoding'
import useErc20Balance from '../../hooks/useErc20Balance'
import useSolanaBalance from '../../hooks/useSolanaBalance'
import useSolanaUsdcAccount from '../../hooks/useSolanaUsdcAccount'
import { USECHAIN_IDS } from '../../constants/chains'
import useEthBalance from '../../hooks/useEthBalance'
import { SupportedChainId } from '../../constants/chains'
import { useCusRecipientAddress } from '../../hooks/useCusRecipientAddress'
import { useSPLBalance } from '../../components/balance/SPLBalance'
import { uniswapTokenList } from '../../constants/relayer'
import { RootTokenList } from '../../types/token'
import api from '../../api/fetch'

const ReviewBtnPanel = () => {
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)

  const inputNumer = useAppStore(state => state.input)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const { addToast } = useToasts()
  const usdcBalance = useErc20Balance(fromToken?.address, fromChainID!)
  const ethBalance = useEthBalance(fromChainID!)
  const splBalance = useSPLBalance(fromToken?.address)
  const solanaBalance = useSolanaBalance()
  const willReceiveToken = useAppStore(state => state.willReceiveToken)

  const setPreviewOpen = useAppStore(state => state.setOpenPreview)
  const setPreviewOpenSolToWsol = useAppStore(state => state.setOpenPreviewSolToWsol)
  const setPreviewOpenSolCreateUsdc = useAppStore(state => state.setOpenPreviewSolCreateUsdc)
  const createUsdcStatus = useAppStore(state => state.createUsdcStatus)
  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const recipientAddressForChain: string = getRecipientAddressForChain()
  const error = useAppStore(state => state.error)
  const [localError, setLocalError] = useState('')
  useSolanaUsdcAccount()

  const { data: tokenList } = useSWRImmutable('tokenList', async () => {
    // const tokenUrl = TokenList_Chainid[chainid]
    const tokenUrl = uniswapTokenList
    const res = await api.get<RootTokenList>(tokenUrl)
    return res
  })

  const ValidateAmountFN = useCallback(() => {
    // 临时开放
    if (fromChainID === SupportedChainId.SOLANA) {
      if (!recipientAddressForChain) {
        addToast('Please enter the recipient address.', { appearance: 'error' })
        return false
      }

      if (fromToken?.address === '' && toChainID !== SupportedChainId.SOLANA) {
        setPreviewOpenSolToWsol(true)
        return
      }

      // 如果没有usdtTokenInfo，说明没有usdc，需要创建
      if (createUsdcStatus === '') {
        setPreviewOpenSolCreateUsdc(true)
        return
      }
      // solana 链，比较余额
      const tokenDetail = tokenList?.splTokens.find(item => item.address === fromToken?.address)

      if (fromToken?.address === '') {
        const inputAmountBigInt = BigInt(inputNumer)
        const balance = BigInt(solanaBalance?.balance || 0)

        if (inputAmountBigInt <= balance) {
          setPreviewOpen(true)
        } else {
          addToast('Insufficient balance', { appearance: 'error' })
        }
        return
      }

      if (tokenDetail) {
        const tokenDecimals = tokenDetail.decimals
        const inputAmountBigInt = BigInt(inputNumer)
        const balanceBigInt = BigInt(Math.floor(splBalance.balance * 10 ** tokenDecimals))
        if (inputAmountBigInt <= balanceBigInt) {
          setPreviewOpen(true)
          return
        } else {
          addToast('Insufficient balance', { appearance: 'error' })
          return false
        }
      }
      // If tokenDetail is not found, you might want to handle this case
      addToast('Token details not found', { appearance: 'error' })
      return false
    }

    if (fromChainID == null || toChainID == null || USECHAIN_IDS.includes(fromChainID) == false || USECHAIN_IDS.includes(toChainID) == false) {
      addToast('Please check the network', { appearance: 'error' })
      return false
    }

    if (!recipientAddressForChain) {
      addToast('Please enter the recipient address.', { appearance: 'error' })
      return false
    }

    const num = BigNumber.from(inputNumer)
    let tempbalance
    if (fromToken?.address !== '') {
      tempbalance = usdcBalance
    } else {
      tempbalance = ethBalance
    }

    if (tempbalance.balance == undefined) {
      addToast('Please check the balance', { appearance: 'error' })
      return false
    }
    if (num.eq(0)) {
      addToast('Please check the values entered', { appearance: 'error' })
      return false
    }
    if (num.gt(tempbalance.balance)) {
      addToast('Insufficient balance', { appearance: 'error' })
      return false
    }
    if (num.gt(0) && num.lte(tempbalance.balance)) {
      setPreviewOpen(true)
      return true
    }
  }, [
    inputNumer,
    usdcBalance,
    addToast,
    fromChainID,
    toChainID,
    ethBalance,
    fromToken,
    setPreviewOpen,
    setPreviewOpenSolToWsol,
    setPreviewOpenSolCreateUsdc,
    createUsdcStatus,
    recipientAddressForChain,
    splBalance.balance,
    tokenList?.splTokens,
    solanaBalance?.balance
  ])

  useEffect(() => {
    if (toChainID === SupportedChainId.SOLANA && toToken?.address === '' && Number(willReceiveToken) <= 3000000) {
      setLocalError('Minimum amount for SOL is 0.003')
    } else {
      setLocalError('')
    }
  }, [willReceiveToken, toChainID, toToken?.address])

  const checkNum = useMemo(() => {
    if (!willReceiveToken || willReceiveToken === '0') return true
    if (toChainID === SupportedChainId.SOLANA && toToken?.address === '') {
      if (Number(willReceiveToken) > 3000000) {
        return false
      } else {
        return true
      }
    }
    // 临时开放
    if (fromChainID === SupportedChainId.SOLANA) return false
    // if (gasFee === '0' || error !== '') return true
  }, [fromChainID, willReceiveToken, toChainID, toToken])

  const Review = useMemo(() => {
    if (fromChainID === SupportedChainId.SOLANA && toChainID !== SupportedChainId.SOLANA && fromToken?.address === '') {
      return 'Wrap SOL'
    }
    if (localError) {
      return localError
    }
    return 'Review'
  }, [fromChainID, fromToken?.address, localError, toChainID])

  return (
    <>
      <button
        onClick={() => {
          ValidateAmountFN()
        }}
        disabled={checkNum}
        className="px-6 py-3.5 text-white flex-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center disabled:bg-slate-700"
      >
        {Review}
      </button>
    </>
  )
}

export default ReviewBtnPanel
