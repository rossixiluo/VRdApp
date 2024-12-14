import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useAppStore } from '../../state'

import TokenAndChainInfo from './TokenAndChainInfo'
import CopyAddressBtn from '../linkAndCopy/CopyAddressBtn'
import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid'
import { formatUnitsErc20, cutOut } from '../../utils'
import Loading from '../loading'
import { When } from 'react-if'
import useSolanaTx from '../../hooks/useSolanaTx'
import ScanUrl from '../linkAndCopy/ScanUrl'
import { useWallet } from '@solana/wallet-adapter-react'

interface componentprops {
  isOpen: boolean
  closeModal: () => void
}
const wsol = {
  address: 'So11111111111111111111111111111111111111112',
  chainId: 101,
  decimals: 9,
  name: 'Wrapped SOL',
  symbol: 'wSOL',
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
  tags: ['old-registry'],
  extensions: {
    coingeckoId: 'wrapped-solana'
  }
}
const SolToWsolModal: FC<componentprops> = ({ isOpen, closeModal }) => {
  // const fromChainInfo = useAppStore(state => state.fromChain)
  const fromChainInfo = useAppStore(state => state.fromChain)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const setToken = useAppStore(state => state.setToken)
  const createUsdcStatus = useAppStore(state => state.createUsdcStatus)
  const setPreviewOpen = useAppStore(state => state.setOpenPreview)
  const setPreviewOpenSolCreateUsdc = useAppStore(state => state.setOpenPreviewSolCreateUsdc)
  const addToHistory = useAppStore(state => state.addToHistory)
  const updateHistoryBytxhash = useAppStore(state => state.updateHistoryBytxhash)

  const input = useAppStore(state => state.input)

  const [txHash, setTxHash] = useState<string | null>(null)

  const solanaTx = useSolanaTx()

  const [isTxLoading, setIsTxLoading] = useState(false)

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)

  const clickref = useRef<boolean>(false)

  const wallet = useWallet()
  const solanaAccount = wallet.publicKey?.toBase58() || ''

  const SubmitFN = useCallback(async () => {
    // 如果sol 转成 wsol，则更换fromToken 为wsol
    if (txHash) {
      setToken(true, wsol)
      // 如果没有usdtTokenInfo，说明没有usdc，需要创建
      if (createUsdcStatus === '') {
        setPreviewOpenSolCreateUsdc(true)
        return
      }

      setPreviewOpen(true)
      return
    }
    setIsTxLoading(true)
    const TX = await solanaTx.sendTx()

    if (TX && !TX.hash) {
      setTxHash(null)
      setIsTxLoading(false)
      clickref.current = false
    }
    if (TX && TX.hash) {
      setTxHash(TX.hash)
      setIsTxLoading(false)
      clickref.current = false
      if (solanaAccount && fromChainID !== null && fromToken !== null) {
        const _fromToken: any = JSON.parse(JSON.stringify(fromToken))
        _fromToken.name = 'Wrapped SOL'
        _fromToken.symbol = 'wSOL'
        addToHistory({
          fromChainID: fromChainID,
          toChainID: fromChainID,
          input: input,
          fee: '0',
          txhash: TX.hash,
          creattime: Date.now(),
          user: solanaAccount,
          fromToken,
          toToken: _fromToken,
          output: input
        })
        updateHistoryBytxhash(
          TX.hash,
          TX.hash || '',
          {
            attest: 'done',
            mint: 'done',
            scan: 'done',
            swap: 'done'
          },
          'Success'
        )
      }
    }
  }, [setTxHash, setIsTxLoading, solanaTx, clickref])

  const closeModalFn = useCallback(() => {
    setTxHash(null)
    closeModal()
    setIsTxLoading(false)
    clickref.current = false
  }, [closeModal, setTxHash, setIsTxLoading])

  if (fromToken == null || toToken == null) {
    return <></>
  }

  return (
    <div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModalFn}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Preview
                  </Dialog.Title>
                  <div className="mt-2">
                    <div className="w-full  lg:py-6 mb-6 lg:mb-0 text-sm">
                      <div className=" flex  justify-around mb-2 items-center">
                        <TokenAndChainInfo isFrom={true} txhash={txHash}></TokenAndChainInfo>
                        <div>
                          <ChevronDoubleRightIcon className=" w-4 h-4"></ChevronDoubleRightIcon>
                        </div>
                        <div className=" bg-slate-50 flex flex-col rounded-md  p-4">
                          <div className="">
                            <span className=" font-semibold  text-base mr-4">{'To'}</span>
                            <span className="">{fromChainInfo?.label}</span>
                          </div>
                          <div className=" flex items-center space-x-1">
                            <div className="flex -space-x-4  items-start">
                              <img width={40} src={fromToken.logoURI}></img>
                              <img width={20} src={fromChainInfo?.logoUrl}></img>
                            </div>
                            <div>
                              <div className=" flex flex-wrap">{formatUnitsErc20(input, 'WSOL', fromToken.decimals)}</div>
                            </div>
                          </div>

                          <div className=" flex items-center  mt-2 space-x-2">
                            <When condition={txHash}>
                              Tx Hash: {txHash && cutOut(txHash, 2, 2)} <ScanUrl addr={txHash} chainId={fromChainID}></ScanUrl>{' '}
                              <CopyAddressBtn addr={txHash}></CopyAddressBtn>
                            </When>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex mb-6">
                    <span className="text-gray-500 ml-10">To route SOL requires wrapping SOL first.</span>
                  </div>
                  <div className="mt-4 flex flex-col">
                    {isTxLoading ? (
                      <button className="px-6 py-3.5 text-white flex-1 flex  flex-row   bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center 0  cursor-wait">
                        <Loading></Loading>
                        <div className=" flex-1 text-center">Send Tx loading</div>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="px-6 py-3.5 inline-flex flex-1 justify-center rounded-md border border-transparent bg-blue-700  text-sm font-medium  text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={SubmitFN}
                      >
                        {txHash ? 'Continue' : 'Swap'}
                      </button>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

export default SolToWsolModal
