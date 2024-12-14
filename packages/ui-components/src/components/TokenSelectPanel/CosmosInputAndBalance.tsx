import React, { FC, useState, useCallback, useEffect } from 'react'
import Balance from './Balance'
import { useAppStore } from '../../state'
import { useDebounce } from 'react-use'
import { validateAmount } from '../../utils'
import { BigNumber, ethers } from 'ethers'
import { Cosmos_Network } from '../../constants/networks'
import useCosmosBalance from '../../hooks/useCosmosBalance'
import { useToasts } from 'react-toast-notifications'

type proteType = {
  isFrom: boolean
}

const CosmosInputAndBalance: FC<proteType> = ({ isFrom }) => {
  const originalinput = useAppStore(state => state.originalinput)
  const [inputValue, setInputValue] = useState(originalinput)
  const [inputError, setinputError] = useState<string | undefined>()

  const setWillReceiveToken = useAppStore(state => state.setWillReceiveToken)
  const setInput = useAppStore(state => state.setInput)
  const setError = useAppStore(state => state.setError)

  const setGasFeeStore = useAppStore(state => state.setGasFee)
  const fromToken = useAppStore(state => state.fromToken)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const setOriginalinput = useAppStore(state => state.setOriginalinput)
  const protocolFee = useAppStore(state => state.getFee)
  const chainType = isFrom ? fromChainID : toChainID
  const cosmosBalance = useCosmosBalance(chainType as Cosmos_Network)
  const { addToast } = useToasts()

  useDebounce(
    () => {
      setOriginalinput(inputValue)
      // if (inputError == undefined) {
      if (inputValue !== '') {
        const valueHaveUnits = ethers.utils.parseUnits(inputValue, fromToken?.decimals).toString()
        setInput(valueHaveUnits)
      } else {
        setInput('0')
      }
      setError('')
      // } else {
      //   setError(inputError)
      //   // setInput('0')
      // }
    },
    500,
    [inputValue, inputError, fromToken, setError, setOriginalinput]
  )

  const comosBalanceByCoin = useCallback(
    (coin: string) => {
      const value = cosmosBalance.balance?.find(item => item.denom.toLowerCase() == coin.toLowerCase())?.amount
      return value || '0'
    },
    [cosmosBalance]
  )

  const inputAmountChange = useCallback(
    (value: string) => {
      // startTransition(()=>{

      setinputError(undefined)
      if (value == '' || fromToken == null || cosmosBalance.balance == undefined) return
      const error = validateAmount(value, fromToken.decimals)
      if (error == undefined) {
        const valueHaveUnits = ethers.utils.parseUnits(value, fromToken?.decimals).toString()
        const protocolFeeBigNum = BigNumber.from(protocolFee())
        const ethBalanceamount = BigNumber.from(comosBalanceByCoin('uusdc'))

        if (cosmosBalance.balance != undefined && fromToken?.address !== '') {
          const inputAmount = BigNumber.from(valueHaveUnits)
          const usdcBalanceamount = BigNumber.from(comosBalanceByCoin('uusdc'))

          if (inputAmount.gt(usdcBalanceamount)) {
            setinputError('The value entered is greater than the balance')
          }
          // if (protocolFeeBigNum.gt(ethBalanceamount)) {
          //   setinputError('The native token balance is insufficient to pay the handling fee')
          // }
        }
      } else {
        setinputError(error)
      }
      // })
    },
    [fromToken, setinputError, cosmosBalance, protocolFee, comosBalanceByCoin]
  )

  useEffect(() => {
    if (fromChainID && fromToken) {
      setTimeout(() => {
        inputAmountChange(inputValue)
      }, 200)
    }
  }, [fromToken, fromChainID, inputAmountChange, inputValue])

  const setValue = useCallback(
    (value: string) => {
      setInputValue(value)
      inputAmountChange(value)
      setWillReceiveToken('0')
      setGasFeeStore('0')
    },
    [inputAmountChange, setWillReceiveToken, setGasFeeStore]
  )

  const Max = () => {
    if (cosmosBalance.balance && cosmosBalance.balance[0].amount) {
      const protocolFeeBigNum = BigNumber.from(protocolFee())

      const amount = BigNumber.from(cosmosBalance.balance[0].amount).sub(protocolFeeBigNum)
      const valueHaveUnits = ethers.utils.formatUnits(amount.toString(), 6).toString()
      if (parseFloat(valueHaveUnits) > 0) {
        setValue(valueHaveUnits)
      } else if (BigNumber.from(cosmosBalance.balance[0].amount).toString() == '0') {
        return
      } else {
        setValue('0')
        addToast('The value entered and protocol fee is greater than the balance.', { appearance: 'error' })
      }
    }
  }

  return (
    <div className="flex items-center justify-between px-3 py-[14px] sm:py-4">
      <div className="relative flex w-full items-center overflow-hidden">
        <input
          type="number"
          className="skt-w skt-w-input text-valuerouter-primary w-full min-w-full max-w-[180px] bg-transparent pt-0.5 text-lg font-bold focus:max-w-none focus-visible:outline-none sm:max-w-full sm:text-xl"
          placeholder={'0.0'}
          spellCheck="false"
          disabled={!isFrom}
          value={inputValue}
          onChange={e => {
            setValue(e.currentTarget.value)
          }}
        />
        <div className="invisible absolute w-fit text-xl font-bold" />
      </div>
      <Balance isFrom={isFrom}></Balance>
      <div className="flex items-center" onClick={Max}>
        <div className="h-6 w-px bg-gray-300 mx-2"></div>
        <button className="text-primary-700 text-sm font-medium">MAX</button>
      </div>
    </div>
  )
}

export default CosmosInputAndBalance
