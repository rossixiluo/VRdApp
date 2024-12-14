import { FC, useState, useCallback, useEffect, useRef } from 'react'
import Balance from './Balance'
import useErc20Balance from '../../hooks/useErc20Balance'
import { useAppStore } from '../../state'
import { validateAmount, formatUnitsErc20 } from '../../utils'
import { BigNumber, ethers } from 'ethers'
import { useDebounce } from 'react-use'
import useEthBalance from '../../hooks/useEthBalance'
import { useToasts } from 'react-toast-notifications'
import useSolanaBalance from '../../hooks/useSolanaBalance'
import { SupportedChainId } from '../../constants/chains'
import { useSPLBalance } from '../../components/balance/SPLBalance'

type proteType = {
  isFrom: boolean
}

const InputAndBalance: FC<proteType> = ({ isFrom }) => {
  const fromToken = useAppStore(state => state.fromToken)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const usdcBalance = useErc20Balance(fromToken?.address, isFrom ? fromChainID : toChainID, 1 * 1000)
  const solanaBalance = useSolanaBalance()
  const splBalance = useSPLBalance(fromToken?.address)
  const ethBalance = useEthBalance(isFrom ? fromChainID : toChainID)
  const { addToast } = useToasts()

  const [inputError, setinputError] = useState<string | undefined>()
  const setInput = useAppStore(state => state.setInput)
  const setWillReceiveToken = useAppStore(state => state.setWillReceiveToken)

  const originalinput = useAppStore(state => state.originalinput)
  const setOriginalinput = useAppStore(state => state.setOriginalinput)

  const setGasFeeStore = useAppStore(state => state.setGasFee)
  const setError = useAppStore(state => state.setError)
  const protocolFee = useAppStore(state => state.getFee)

  // const inputAmount = useMemo(() => {
  //   const valueHaveUnits = ethers.utils.formatUnits(input, fromToken?.decimals).toString()
  //   return valueHaveUnits
  // }, [input, fromToken])

  const [inputValue, setInputValue] = useState(originalinput)

  // useEffect(() => {
  //   setInputValue(inputAmount)
  // }, [inputAmount, setInputValue])

  useDebounce(
    () => {
      setOriginalinput(inputValue)
      if (inputError == undefined) {
        if (inputValue !== '') {
          const valueHaveUnits = ethers.utils.parseUnits(inputValue, fromToken?.decimals).toString()
          setInput(valueHaveUnits)
        } else {
          setInput('0')
        }
        setError('')
      } else {
        setError(inputError)
        addToast(inputError, { appearance: 'error' })
        // setInput('0')
      }
    },
    500,
    [inputValue, inputError, fromToken, setError, setOriginalinput]
  )

  const inputAmountChange = useCallback(
    (value: string) => {
      // startTransition(()=>{
      setinputError(undefined)
      if (value == '' || fromToken == null || ethBalance.balance == undefined || ethBalance.balance == '0') return

      const error = validateAmount(value, fromToken.decimals)
      if (error == undefined) {
        const valueHaveUnits = ethers.utils.parseUnits(value, fromToken?.decimals).toString()
        const protocolFeeBigNum = BigNumber.from(protocolFee())
        const ethBalanceamount = BigNumber.from(ethBalance.balance)

        if (usdcBalance.balance != undefined && fromToken?.address !== '') {
          // 暂时不校验交易输入的金额
          // const inputAmount = BigNumber.from(valueHaveUnits)
          // const usdcBalanceamount = BigNumber.from(usdcBalance.balance)
          // if (inputAmount.gt(usdcBalanceamount)) {
          //   setinputError('The value entered is greater than the balance')
          // }
          // if (protocolFeeBigNum.gt(ethBalanceamount)) {
          //   setinputError('The native token balance is insufficient to pay the handling fee')
          // }
        } else if (ethBalance.balance !== undefined && fromToken?.address == '' && fromChainID != 'solana') {
          // mark
          const inputAmount = BigNumber.from(valueHaveUnits)
          if (inputAmount.add(protocolFeeBigNum).gt(ethBalanceamount)) {
            setinputError('The value entered and protocol fee is greater than the balance')
          }
        }
      } else {
        setinputError(error)
      }
      // })
    },
    [fromToken, setinputError, usdcBalance, ethBalance, protocolFee, fromChainID]
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
    const protocolFeeBigNum = BigNumber.from(protocolFee())
    if (fromChainID === SupportedChainId.SOLANA) {
      if (fromToken?.address === '' && solanaBalance.balance) {
        const amount = BigNumber.from(solanaBalance.balance).sub(protocolFeeBigNum)
        const valueHaveUnits = ethers.utils.formatUnits(amount.toString(), fromToken?.decimals).toString()
        if (parseFloat(valueHaveUnits) > 0) {
          setValue(valueHaveUnits)
        }
        return
      } else {
        if (fromToken?.decimals) {
          const amount = splBalance.balance
          setValue(amount)
        }
      }
    }
    if (fromToken?.address === '') {
      const ethBalanceamount = BigNumber.from(ethBalance.balance)
      const amount = ethBalanceamount.sub(protocolFeeBigNum)
      const valueHaveUnits = ethers.utils.formatUnits(amount.toString(), fromToken?.decimals).toString()
      if (parseFloat(valueHaveUnits) > 0) {
        setValue(valueHaveUnits)
      } else if (parseFloat(ethBalanceamount.toString()) === 0) {
        return
      } else {
        setValue('0')
        addToast('The value entered and protocol fee is greater than the balance.', { appearance: 'error' })
      }
    } else {
      const tokenBalanceamount = BigNumber.from(usdcBalance.balance)
      const valueHaveUnits = ethers.utils.formatUnits(tokenBalanceamount.toString(), fromToken?.decimals).toString()
      if (parseFloat(valueHaveUnits) > 0) {
        setValue(valueHaveUnits)
      } else {
        setValue('0')
        addToast('Insufficient balance', { appearance: 'error' })
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

export default InputAndBalance
