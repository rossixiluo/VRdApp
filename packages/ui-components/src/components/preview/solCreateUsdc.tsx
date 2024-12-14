import { FC, useCallback, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useAppStore } from '../../state'

import CopyAddressBtn from '../linkAndCopy/CopyAddressBtn'
import { cutOut } from '../../utils'
import Loading from '../loading'
import { When } from 'react-if'
import useSolanaTx from '../../hooks/useSolanaTx'
import ScanUrl from '../linkAndCopy/ScanUrl'
import { useWallet } from '@solana/wallet-adapter-react'
interface componentprops {
  isOpen: boolean
  closeModal: () => void
}
const SolanaUSDCToken: any = {
  chainId: 'solana',
  address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  name: 'Create USDC',
  symbol: 'Create USDC',
  decimals: 9,
  logoURI: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png'
}
const SolCreateUsdcModal: FC<componentprops> = ({ isOpen, closeModal }) => {
  const fromChainID = useAppStore(state => state.fromChainID)

  const [txHash, setTxHash] = useState<string | null>(null)

  const { sendTx, createUsdcAccountHash } = useSolanaTx()

  const [isTxLoading, setIsTxLoading] = useState(false)

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const wallet = useWallet()
  const solanaAccount = wallet.publicKey?.toBase58() || ''

  const clickref = useRef<boolean>(false)
  const setPreviewOpenSolCreateUsdc = useAppStore(state => state.setOpenPreviewSolCreateUsdc)
  const setCreateUsdcStatus = useAppStore(state => state.setCreateUsdcStatus)
  const addToHistory = useAppStore(state => state.addToHistory)
  const updateHistoryBytxhash = useAppStore(state => state.updateHistoryBytxhash)

  const SubmitFN = useCallback(async () => {
    setIsTxLoading(true)
    const TX = await sendTx()
    if (TX && TX.hash && fromChainID) {
      addToHistory({
        fromChainID: fromChainID,
        toChainID: fromChainID,
        input: '',
        fee: '0',
        txhash: TX.hash,
        creattime: Date.now(),
        user: solanaAccount,
        fromToken: SolanaUSDCToken,
        toToken: SolanaUSDCToken,
        output: ''
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
    setIsTxLoading(false)
  }, [setIsTxLoading, sendTx])

  useEffect(() => {
    if (createUsdcAccountHash) {
      setTxHash(createUsdcAccountHash)
      setIsTxLoading(false)
      setPreviewOpenSolCreateUsdc(false)
      setCreateUsdcStatus('1')
      clickref.current = false
    }
  }, [createUsdcAccountHash, setPreviewOpenSolCreateUsdc, setCreateUsdcStatus])

  const closeModalFn = useCallback(() => {
    setTxHash(null)
    setPreviewOpenSolCreateUsdc(false)
    setIsTxLoading(false)
    clickref.current = false
  }, [setPreviewOpenSolCreateUsdc, setTxHash, setIsTxLoading])

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
                    Preview (preconditions)
                  </Dialog.Title>

                  <div className="mt-2">
                    <div className="w-full lg:py-6 mb-6 lg:mb-0 text-sm">
                      <div className="flex flex-col items-center mb-4">
                        <div className="bg-slate-50 flex flex-col rounded-md p-4 w-full">
                          <div className="flex justify-center items-center space-x-2">
                            <span className="flex  items-center text-lg font-medium">
                              Create{' '}
                              <img
                                className="ml-2 mr-1"
                                width={30}
                                src="https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png"
                              />{' '}
                              USDC Account on Solana
                            </span>
                          </div>
                          <div className="flex items-center justify-center mt-2 space-x-2">
                            <When condition={txHash}>
                              <div className="flex justify-center items-center gap-1">
                                Tx Hash: {txHash && cutOut(txHash, 2, 2)} <ScanUrl addr={txHash} chainId={fromChainID}></ScanUrl>
                                <CopyAddressBtn addr={txHash}></CopyAddressBtn>
                              </div>
                            </When>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col">
                    {txHash ? (
                      <button
                        type="button"
                        className="px-6 py-3.5 inline-flex flex-1 justify-center rounded-md border border-transparent bg-blue-700  text-sm font-medium  text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                        onClick={() => setPreviewOpenSolCreateUsdc(false)}
                      >
                        <div className=" flex-1 text-center">Close</div>
                      </button>
                    ) : isTxLoading ? (
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
                        Send
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

export default SolCreateUsdcModal
