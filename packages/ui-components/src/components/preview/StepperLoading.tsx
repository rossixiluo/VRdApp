import React, { FC, useEffect } from 'react'
import Loading from '../loading'
import { classNames } from '../../utils'
import { When } from 'react-if'
import { useStatusMintTxt } from '../../hooks/useStatusMintTxt'
import { SupportedChainId } from '../../constants/chains'

type propType = { txhash: string | null; isLocalSwap: boolean; fromChainID: SupportedChainId | null; toChainID: SupportedChainId | null; setTxBack?: (hash: string) => void }

const StepperLoading: FC<propType> = ({ txhash, isLocalSwap, fromChainID, toChainID, setTxBack }) => {

  const statusMint = useStatusMintTxt(txhash, isLocalSwap, fromChainID, toChainID, false)
  const step = statusMint.step

  useEffect(() => {
    if (statusMint.toTxhash && setTxBack) {
      setTxBack(statusMint.toTxhash)
    }
  }, [statusMint, setTxBack])

  return (
    <>
      <When condition={step == 3}>
        <div className="p-4 mb-4 text-sm  text-center text-green-800 rounded-lg bg-green-50  " role="alert">
          <span className="font-medium">Mint Success</span>.
        </div>
      </When>
      <When condition={step == 4}>
        <div className="p-4 mb-4 text-sm  text-center text-red-400 rounded-lg bg-red-50  " role="alert">
          <span className="font-medium">{statusMint.text}</span>.
          <span className=" text-yellow-400">
            {statusMint.serveStatus.scan == 'fail' ? 'Swap failed due to slippage is too large. Users received USDC on target chain' : ''}
          </span>
        </div>
      </When>
      <ol className="items-center w-full space-y-4 sm:flex sm:space-x-8 sm:space-y-0 my-2 justify-center">
        <li className={classNames('flex items-center text-blue-600  space-x-2.5', step >= -1 ? 'text-blue-600' : 'text-gray-500')}>
          <span
            className={classNames(' flex items-center justify-center w-8 h-8 border  rounded-full shrink-0', step >= -1 ? 'border-blue-600' : 'text-gray-500')}
          >
            1
          </span>
          <span>
            <h3 className="font-medium leading-tight">send</h3>
            <p className="text-sm">
              <When condition={step == -1}>
                <Loading></Loading>
              </When>
            </p>
          </span>
        </li>
        <li className={classNames('flex items-center text-blue-600  space-x-2.5', step >= 0 ? 'text-blue-600' : 'text-gray-500')}>
          <span
            className={classNames(' flex items-center justify-center w-8 h-8 border  rounded-full shrink-0', step >= 0 ? 'border-blue-600' : 'text-gray-500')}
          >
            2
          </span>
          <span>
            <h3 className="font-medium leading-tight">scan</h3>
            <p className="text-sm">
              <When condition={step == 0}>
                <Loading></Loading>
              </When>
            </p>
          </span>
        </li>
        <li className={classNames('flex items-center text-blue-600  space-x-2.5', step >= 1 ? 'text-blue-600' : 'text-gray-500')}>
          <span
            className={classNames(' flex items-center justify-center w-8 h-8 border  rounded-full shrink-0', step >= 1 ? 'border-blue-600' : 'text-gray-500')}
          >
            3
          </span>
          <span>
            <h3 className="font-medium leading-tight">attest</h3>
            <p className="text-sm">
              <When condition={step == 1}>
                <Loading></Loading>
              </When>
            </p>
          </span>
        </li>
        <li className={classNames('flex items-center text-blue-600  space-x-2.5', step >= 2 ? 'text-blue-600' : 'text-gray-500')}>
          <span
            className={classNames(' flex items-center justify-center w-8 h-8 border  rounded-full shrink-0', step >= 2 ? 'border-blue-600' : 'text-gray-500')}
          >
            4
          </span>
          <span>
            <h3 className="font-medium leading-tight">mint</h3>
            <p className="text-sm">
              <When condition={step == 2}>
                <Loading></Loading>
              </When>
            </p>
          </span>
        </li>
      </ol>
    </>
  )
}

export default StepperLoading
