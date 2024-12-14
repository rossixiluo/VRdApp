import { FC, useCallback, useEffect, useMemo, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { useAppStore } from '../../state'
import { cutOut, formatUnitsErc20 } from '../../utils'
import useRelayCall from '../../hooks/useRelayCall'
import { Else, If, Then, When } from 'react-if'

import useAverageTime, { useNumberOfBlocks } from '../../hooks/useAverageTime'
import SetepLoading from './StepperLoading'

import TokenAndChainInfo from './TokenAndChainInfo'
import { useCusRecipientAddress } from '../../hooks/useCusRecipientAddress'
import { useToasts } from 'react-toast-notifications'
import { useWeb3React } from '@web3-react/core'
import { useWallet } from '@solana/wallet-adapter-react'
import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid'
// import EventEmitter from '../../EventEmitter/index'
import Loading from '../loading'
import useUSDCAddress from '../../hooks/useUsdc'
import { getChainInfo } from '../../constants/chainInfo'
import useCosmosTx from '../../hooks/useCosmosTx'
import useCosmosNotNobleTx from '../../hooks/useCosmosNotNobleTx'
import useSolanaTx from '../../hooks/useSolanaTx'
import useEthWrapWeth from '../../hooks/useEthWrapWeth'
import { useJupiterSwap } from '../../hooks/useJupiter'
import { SupportedChainId, isCosmosChain } from '../../constants/chains'
import { pollToFetcher } from '../../hooks/useTxStatus'

interface componentprops {
  isOpen: boolean
  closeModal: () => void
}

const PreviewModal: FC<componentprops> = ({ isOpen, closeModal }) => {
  // const fromChainInfo = useAppStore(state => state.fromChain)
  const { getRecipientAddressForChain } = useCusRecipientAddress()
  const RecipientAddress: string = getRecipientAddressForChain()

  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)

  const fee = useAppStore(state => state.fee)
  // const fee = useAppStore(state => state.fee)
  const RelayCall = useRelayCall()
  const [txHash, setTxHash] = useState<string | null>(null)
  const [txMiddleHash, setTxMiddleHash] = useState<string | null>(null)
  const isLocalSwap = useMemo(() => {
    return toChainID == fromChainID
  }, [toChainID, fromChainID])

  // const status = useTxStatus(txHash, isLocalSwap, fromChainID)

  const [isTxLoading, setIsTxLoading] = useState(false)
  const AverageTime = useAverageTime(fromChainID)
  const NumberOfBlocks = useNumberOfBlocks(fromChainID)

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const srcGrossPrice = useAppStore(state => state.srcGrossPrice)
  const destGrossPrice = useAppStore(state => state.destGrossPrice)
  const destEstimatedReceived = useAppStore(state => state.destEstimatedReceived)
  const destMinimumReceived = useAppStore(state => state.destMinimumReceived)
  const jupiterLoading = useAppStore(state => state.jupiterLoading)
  const jupiterSlippage = useAppStore(state => state.jupiterSlippage)

  const [toTxHash, setToTxHash] = useState<string | null>(null)
  // const setInput = useAppStore(state => state.setInput)
  const [txStatus, settxStatus] = useState<number | undefined>(undefined)
  // const toToken = useAppStore(state => state.willReceiveToken)
  // const CusRecipientAddress = useCusRecipientAddress()
  const addToHistory = useAppStore(state => state.addToHistory)
  const RelayerFee = useAppStore(state => state.fee)
  const willReceiveToken = useAppStore(state => state.willReceiveToken)
  const inputAmount = useAppStore(state => state.input)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))

  const { account, chainId } = useWeb3React()
  const usdcTo = useUSDCAddress(toChainID)
  const usdcFrom = useUSDCAddress(fromChainID)
  const cosmosTx = useCosmosTx()
  const cosmosNotNobleTx = useCosmosNotNobleTx()
  const { sendSwap } = useJupiterSwap()
  const solanaTx = useSolanaTx()
  const { addToast } = useToasts()

  const { sendWrapTx } = useEthWrapWeth()
  const wallet = useWallet()
  const solanaAccount = wallet.publicKey?.toBase58() || ''

  const clickref = useRef<boolean>(false)

  const isToNeedSwap = useMemo(() => {
    if (toToken?.address != usdcTo && fromChainID !== toChainID) {
      return true
    } else {
      return false
    }
  }, [toToken, usdcTo, fromChainID, toChainID])

  const isFromNeedSwap = useMemo(() => {
    if (fromToken?.address.toLowerCase() != usdcFrom?.toLowerCase()) {
      return true
    } else {
      return false
    }
  }, [fromToken, usdcFrom])
  const isCosmos = isCosmosChain(fromChainID)

  const isToCosmos = isCosmosChain(toChainID)

  const isNoble = fromChainID == SupportedChainId.NOBLE

  useEffect(() => setIsTxLoading(jupiterLoading), [jupiterLoading])
  const closeModalFn = useCallback(() => {
    setTxHash(null)
    closeModal()
    settxStatus(undefined)
    setToTxHash(null)
    setIsTxLoading(false)
    clickref.current = false
    // EventEmitter.emit('Refresh')
    // setInput('0')
  }, [closeModal, setTxHash, settxStatus, setToTxHash, setIsTxLoading])

  const SubmitFN = useCallback(async () => {
    if (clickref.current == true) return
    clickref.current = true
    setIsTxLoading(true)
    // const searchTx = await cosmosNotNobleTx.searchTx([
    //   { key: 'recv_packet.packet_sequence', value: '13662' },
    //   { key: 'recv_packet.packet_src_port', value: 'transfer' },
    //   { key: 'recv_packet.packet_src_channel', value: 'channel-39' }
    // ])
    // console.info('searchTx:', searchTx)
    try {
      if (fromChainID === SupportedChainId.SOLANA) {
        if (toChainID === SupportedChainId.SOLANA) {
          const result = await sendSwap()
          closeModalFn()
          return
        }
        const TX = await solanaTx.sendTx()
        if (TX && !TX.hash) {
          setTxHash(null)
          setIsTxLoading(false)
          clickref.current = false
        }
        if (TX && TX.hash) {
          console.info(TX.hash)
          addToast(`${TX.hash} successful`, { appearance: 'success' })
          setTxHash(TX.hash)
          settxStatus(1)
          setIsTxLoading(false)
          clickref.current = false

          if (solanaAccount && fromChainID !== null && toChainID != null && fromToken !== null && toToken !== null) {
            addToHistory({
              fromChainID: fromChainID,
              toChainID: toChainID,
              input: inputAmount,
              fee: RelayerFee,
              txhash: TX.hash,
              creattime: Date.now(),
              user: solanaAccount,
              fromToken,
              toToken,
              output: willReceiveToken
            })
          }
        }

        return
      }

      if (isNoble && !isToCosmos) {
        setTxHash('')
        const TX = await cosmosTx.sendTx()
        if (TX) {
          setTxHash(TX.hash)
          settxStatus(1)

          if (cosmosAddress && fromChainID !== null && toChainID != null && fromToken !== null && toToken !== null) {
            addToHistory({
              fromChainID: fromChainID,
              toChainID: toChainID,
              input: inputAmount,
              fee: RelayerFee,
              txhash: TX.hash,
              creattime: Date.now(),
              user: cosmosAddress,
              fromToken,
              toToken,
              output: willReceiveToken
            })
          }
        } else {
          throw new Error('Failed to send transaction')
        }
      }

      if (isCosmos && isToCosmos) {
        console.info('isCosmos && isToCosmos')
        setTxHash('')
        const TX = await cosmosNotNobleTx.sendTx()
        console.info(TX)
        if (TX) {
          setTxHash(TX.hash)
          settxStatus(1)
          const searchTx = await cosmosNotNobleTx.searchTx(TX.query, toChainID as string)
          console.info('searchTx:', searchTx)
          const toTxHash = searchTx && searchTx[0].hash
          setToTxHash(toTxHash)
          if (cosmosAddress && fromChainID !== null && toChainID != null && fromToken !== null && toToken !== null) {
            addToHistory({
              fromChainID: fromChainID,
              toChainID: toChainID,
              input: inputAmount,
              fee: '0',
              txhash: TX.hash,
              toTxhash: toTxHash as string,
              creattime: Date.now(),
              user: cosmosAddress,
              fromToken,
              toToken,
              output: willReceiveToken,
              serveStatus: {
                swap: 'done',
                scan: 'done',
                mint: 'done',
                attest: 'done'
              },
              status: 'Success'
            })
          }
        }
        setIsTxLoading(false)
        clickref.current = false
        return
      }

      if (isCosmos) {
        setTxHash('')
        setTxMiddleHash(null)
        const TX = await cosmosNotNobleTx.sendTx()
        if (TX) {
          setTxHash(TX.hash)
          const searchToChain = isCosmosChain(toChainID) ? toChainID as string : 'noble-1'
          const searchTx = await cosmosNotNobleTx.searchTx(TX.query, searchToChain)
          const toNobleTxHash = searchTx && searchTx[0].hash
          const toTxMiddleHash = await pollToFetcher(toNobleTxHash)
          setTxMiddleHash(toTxMiddleHash?.data.output_hash ?? '')
          // console.info('txMiddleHash:', toTxMiddleHash)
          if (cosmosAddress && fromChainID !== null && toChainID != null && fromToken !== null && toToken !== null && toTxMiddleHash?.data.output_hash) {
            // console.info('txMiddleHash:', toTxMiddleHash?.data.output_hash)
            addToHistory({
              fromChainID: fromChainID,
              toChainID: toChainID,
              input: inputAmount,
              fee: '0',
              txhash: TX.hash,
              creattime: Date.now(),
              user: cosmosAddress,
              fromToken,
              toToken,
              output: willReceiveToken,
              txMiddleHash: toTxMiddleHash?.data.output_hash ?? undefined
            })
          }
        }

      }

      if (fromToken?.address === '' && toToken && toToken.name.indexOf('Wrapped') > -1) {
        const TX = await sendWrapTx({ address: toToken.address })
        if (TX && TX.hash) {
          addToast(`${TX.hash} successful`, { appearance: 'success' })
          setTxHash(TX.hash)
          setToTxHash(TX.hash)
          settxStatus(1)
          setIsTxLoading(false)
          clickref.current = false
          if (solanaAccount && fromChainID !== null && toChainID != null && fromToken !== null && toToken !== null) {
            addToHistory({
              fromChainID: fromChainID,
              toChainID: toChainID,
              input: inputAmount,
              fee: '0',
              txhash: TX.hash,
              creattime: Date.now(),
              user: solanaAccount,
              fromToken,
              toToken,
              output: willReceiveToken
            })
          }
        }
        return
      }

      const TX = await RelayCall.doSwapFetch()

      if (TX) {
        setTxHash(TX.hash)
        const txData = await TX.wait()
        settxStatus(txData.status)
      }
    } catch (ex: any) {
      console.info(ex)
      setTxHash(null)
    }
    setIsTxLoading(false)
    clickref.current = false
  }, [
    RelayCall,
    setTxHash,
    setIsTxLoading,
    settxStatus,
    cosmosTx,
    cosmosNotNobleTx,
    toChainID,
    fromChainID,
    isNoble,
    RelayerFee,
    addToHistory,
    addToast,
    cosmosAddress,
    fromToken,
    inputAmount,
    sendSwap,
    sendWrapTx,
    solanaAccount,
    solanaTx,
    toToken,
    willReceiveToken,
    isCosmos,
    isToCosmos,
    closeModalFn,
  ])

  // useEffect(()=>{
  //  if(statusMint.step==3){
  //   setIsTxLoading(false)
  //  }
  // },[statusMint,closeModal])

  useEffect(() => {
    closeModalFn()
  }, [chainId, closeModalFn, account])

  const ChainGasCoin = useMemo(() => {
    if (fromChainID === 'noble-1') {
      return {
        symbol: 'USDC',
        decimals: 6
      }
    }
    if (fromChainID === 'solana' && toChainID !== 'solana') {
      return {
        symbol: 'SOL',
        decimals: 9
      }
    }
    if (isCosmosChain(fromChainID)) {
      return {
        symbol: 'USDC',
        decimals: 6
      }
    }
    if (fromChainID) {
      return getChainInfo(fromChainID)?.nativeCurrency
    }
  }, [fromChainID, toChainID])
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
                        <TokenAndChainInfo isFrom={false} txhash={toTxHash}></TokenAndChainInfo>
                      </div>

                      <When condition={fromChainID !== toChainID}>
                        <div className="flex border-t border-gray-200 py-1">
                          <span className="text-gray-500">Average time {NumberOfBlocks}</span>
                          <span className="ml-auto text-gray-900">{AverageTime}</span>
                        </div>
                        <div className="flex border-t border-gray-200 py-1">
                          <span className="text-gray-500">Protocol fees</span>
                          <span className="ml-auto text-gray-900">
                            {fee && ChainGasCoin && formatUnitsErc20(fee, ChainGasCoin.symbol, ChainGasCoin.decimals)}
                          </span>
                        </div>
                      </When>

                      <div className="flex border-t border-gray-200 py-1">
                        <span className="text-gray-500">Recipient Address</span>
                        <span className="ml-auto text-gray-900">{RecipientAddress && cutOut(RecipientAddress, 6, 6)}</span>
                      </div>
                      <When condition={fromChainID === SupportedChainId.SOLANA && toChainID === SupportedChainId.SOLANA}>
                        <div className="flex border-t border-gray-200 py-1">
                          <span className="text-gray-500">Max. slippage</span>
                          <span className="ml-auto text-gray-900">{jupiterSlippage}</span>
                        </div>
                      </When>
                      <When condition={isFromNeedSwap}>
                        <div className="flex border-t border-gray-200 py-1">
                          <span className="text-gray-500">Exchange Rate(Src) </span>
                          <span className="ml-auto text-gray-900">
                            {srcGrossPrice} {fromToken.symbol}/{toChainID == fromChainID ? toToken.symbol : 'usdc'}
                          </span>
                        </div>
                      </When>

                      <When condition={fromChainID !== toChainID}>
                        {destGrossPrice && destGrossPrice !== '0' && (
                          <div className="flex border-t border-gray-200 py-1">
                            <span className="text-gray-500">Exchange Rate(Dest) </span>
                            <span className="ml-auto text-gray-900">
                              {destGrossPrice} {toToken.symbol}/usdc
                            </span>
                          </div>
                        )}
                        {destEstimatedReceived && destEstimatedReceived !== '0' && (
                          <div className="flex border-t border-gray-200 py-1">
                            <span className="text-gray-500">Estimated received </span>
                            <span className="ml-auto text-gray-900">{formatUnitsErc20(destEstimatedReceived, toToken.symbol, toToken.decimals)} </span>
                          </div>
                        )}
                        {/* {destMinimumReceived && destMinimumReceived !== '0' && (
                          <div className="flex border-t border-gray-200 py-1">
                            <span className="text-gray-500">Minimum received </span>
                            <span className="ml-auto text-gray-900">{formatUnitsErc20(destMinimumReceived, toToken.symbol, toToken.decimals)}</span>
                          </div>
                        )} */}
                        {[SupportedChainId.MAINNET, SupportedChainId.OPTIMISM, SupportedChainId.ARBITRUM_ONE, SupportedChainId.BASE].includes(
                          fromChainID as SupportedChainId
                        ) && (
                          <div className="flex py-3 bg-yellow-50 rounded-lg mt-2 px-4">
                            <div className="flex items-start">
                              <div className="flex-shrink-0">
                                {/* Info icon */}
                                <svg className="w-4 h-4 text-yellow-600 mt-1 " fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                  To ensure the asset safety, transaction from{' '}
                                  <span className="font-bold">{getChainInfo(fromChainID as SupportedChainId)?.label}</span> will be confirmed in about{' '}
                                  <span className="font-medium">13 minutes</span> or <span className="font-medium">65 blocks</span>. You can safely close this
                                  tab and your assets will arrive in your target chain wallet safely. You can find more info in Transaction History.
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </When>

                      {/* <div className="flex border-t border-b mb-6 border-gray-200 py-2">
                        <span className="text-gray-500">Protocol Fee</span>
                        <span className="ml-auto text-gray-900">
                          {formatUnitsErc20(fee, fromChainInfo?.nativeCurrency.symbol || '', fromChainInfo?.nativeCurrency.decimals || 18)}
                        </span>
                      </div> */}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col">
                    <If condition={isTxLoading == false && txHash == null}>
                      <Then>
                        <button
                          type="button"
                          className="px-6 py-3.5 inline-flex flex-1 justify-center rounded-md border border-transparent bg-blue-700  text-sm font-medium  text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                          onClick={SubmitFN}
                        >
                          Swap
                        </button>
                      </Then>
                      <Else>
                        <If condition={isLocalSwap}>
                          <Then>
                            <If condition={isTxLoading}>
                              <Then>
                                <button className="px-6 py-3.5 text-white flex-1 flex  flex-row   bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center 0  cursor-wait">
                                  <Loading></Loading>
                                  <div className=" flex-1 text-center">Send Tx loading</div>
                                </button>
                              </Then>
                              <Else>
                                {txStatus == 1 ? (
                                  <div className="p-4 mb-4 text-sm  text-center text-green-800 rounded-lg bg-green-50  " role="alert">
                                    <span className="font-medium">Success</span>.
                                  </div>
                                ) : (
                                  <div className="p-4 mb-4 text-sm  text-center text-red-400 rounded-lg bg-red-50  " role="alert">
                                    <span className="font-medium">Error</span>.
                                  </div>
                                )}
                              </Else>
                            </If>
                          </Then>
                          <Else>
                            <If condition={isNoble && isTxLoading}>
                              <Then>
                                <button className="px-6 py-3.5 text-white flex-1 flex  flex-row   bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center 0  cursor-wait">
                                  <Loading></Loading>
                                  <div className=" flex-1 text-center">Send Tx loading</div>
                                </button>
                              </Then>
                              <Else>
                                <If condition={isCosmos && isToCosmos}>
                                  <Then>
                                    {isTxLoading ? (
                                      <button className="px-6 py-3.5 text-white flex-1 flex  flex-row   bg-gray-500 hover:bg-gray-600 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center 0  cursor-wait">
                                        <Loading></Loading>
                                        <div className=" flex-1 text-center">Send Tx loading</div>
                                      </button>
                                    ) : txStatus == 1 ? (
                                      <div className="p-4 mb-4 text-sm  text-center text-green-800 rounded-lg bg-green-50  " role="alert">
                                        <span className="font-medium">Success</span>.
                                      </div>
                                    ) : (
                                      <div className="p-4 mb-4 text-sm  text-center text-red-400 rounded-lg bg-red-50  " role="alert">
                                        <span className="font-medium">Error</span>.
                                      </div>
                                    )}
                                  </Then>
                                  <Else>
                                    <SetepLoading
                                      txhash={!isNoble && isCosmos ? txMiddleHash : txHash}
                                      isLocalSwap={isLocalSwap}
                                      fromChainID={isCosmos ? SupportedChainId.NOBLE : fromChainID}
                                      toChainID={toChainID}
                                      setTxBack={hash => {
                                        setToTxHash(hash)
                                      }}
                                    ></SetepLoading>
                                  </Else>
                                </If>
                              </Else>
                            </If>
                          </Else>
                        </If>
                      </Else>
                    </If>
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

export default PreviewModal
