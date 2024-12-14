import { createStore, useStore } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import React, { createContext, FC, useContext } from 'react'
import { L1ChainInfo, L2ChainInfo } from '../constants/chainInfo'
import { SupportedChainId } from '../constants/chains'
import { Token } from '../types/token'
//SupportedChainId

import { SigningStargateClient } from '@cosmjs/stargate'

export type serveStatus = {
  attest?: string
  mint?: string
  scan?: string
  swap?: string
}

export interface txItem {
  fromChainID: SupportedChainId
  toChainID: SupportedChainId
  input: string
  fee: string
  txhash: string
  status?: string | undefined
  creattime: number
  user: string
  fromToken: Token
  toToken: Token
  output: string
  toTxhash?: string
  serveStatus?: serveStatus
  txMiddleHash?: string
}

export interface chainIdAddress {
  address: string
  chainId: string
}

interface AppState {
  counter: number
  increase: (by: number) => void
  fromChain: L1ChainInfo | L2ChainInfo | null
  toChain: L1ChainInfo | L2ChainInfo | null
  fromChainID: SupportedChainId | null
  toChainID: SupportedChainId | null
  input: string
  output: string
  solanaInput: string
  fee: string
  history: Array<txItem>
  gasFee: string
  fromToken: Token | null
  toToken: Token | null
  CustomRecipientAddressAll: chainIdAddress[]
  enableKeplr: boolean
  cosmosAddressConnected: boolean
  setCosmosAddressConnected: (value: boolean) => void
  getCosmosAddress: (network?: string | null) => string | null
  setFromOrTOChain: (data: L1ChainInfo | L2ChainInfo, dataType: boolean, chainID: SupportedChainId) => void
  getFromChain: () => L1ChainInfo | L2ChainInfo | null
  getToChain: () => L1ChainInfo | L2ChainInfo | null
  setInput: (amount: string) => void
  setSolanaInput: (amount: string) => void
  setOutPut: (amount: string) => void
  setFee: (amount: string) => void
  getInPut: () => string
  getOutPut: () => string
  getFee: () => string
  addToHistory: (tx: txItem) => void
  getHistory: (account: string | undefined | null | string[], isEdit?: boolean) => Array<txItem>
  clearHistory: (tx?: string, isPending?: boolean) => void
  setGasFee: (amount: string) => void
  setToken: (dataType: boolean, data: Token | null) => void
  willReceiveToken: string
  setWillReceiveToken: (amount: string) => void
  setCustomRecipientAddressAll: (all: chainIdAddress[]) => void
  removeCustomRecipientAddress: (chainId?: SupportedChainId) => void
  updateHistoryBytxhash: (txhash: string, toTxhash: string, serveStatus: serveStatus, statusTxt: string) => void
  error: string
  setError: (msg: string) => void
  isOpenPreview: boolean
  setOpenPreview: (isopen: boolean) => void
  quoteLoading: boolean
  setQuoteLoading: (isloading: boolean) => void
  originalinput: string
  setOriginalinput: (value: string) => void
  srcGrossPrice: string
  destGrossPrice: string
  setSrcGrossPrice: (price: string) => void
  setDestGrossPrice: (price: string) => void
  destEstimatedReceived: string
  destMinimumReceived: string

  setDestEstimatedReceived: (value: string) => void
  setDestMinimumReceived: (value: string) => void
  reset: () => void
  fromSearchKey?: string
  toSearchKey?: string
  setSearchKey: (serchKey: string, isFrom: boolean) => void
  setEnableKeplr: (enable: boolean) => void
  getEnableKeplr: () => boolean
  signingCosmosClient: SigningStargateClient | null
  setSigningCosmosClient: (value: SigningStargateClient) => void
  solanaQuoteResponse: any
  setSolanaQuoteResponse: (data: any) => void
  jupiterLoading: boolean
  setJupiterLoading: (loading: boolean) => void
  jupiterSlippage: string
  setJupiterSlippage: (slippage: string) => void
  solanaMyTokenList: string[] | []
  setSolanaMyTokenList: (data: string[] | []) => void
  isOpenPreviewSolToWsol: boolean
  setOpenPreviewSolToWsol: (isopen: boolean) => void
  isOpenPreviewSolCreateUsdc: boolean
  setOpenPreviewSolCreateUsdc: (isopen: boolean) => void
  createUsdcStatus: string
  setCreateUsdcStatus: (status: string) => void
  evmMyTokenList: string[] | []
  setEvmMyTokenList: (data: string[] | []) => void
  noticeInfoModal: boolean
  setNoticeInfoModal: (data: boolean) => void
  bundleFee: string
  setBundleFee: (bundleFee: string) => void
  autoBundleFee: boolean
  setAutoBundleFee: (data: boolean) => void
  useJitoBundle: boolean
  setUseJitoBundle: (data: boolean) => void
  cosmosAddresses: {
    chainId: string
    address: string
    connected: boolean
  }[]
  setCosmosAddresses: (chainId: string, address: string, connected: boolean) => void
}

export const intialState = {
  counter: 0,
  fromChain: null,
  toChain: null,
  fromChainID: null,
  toChainID: null,
  input: '0',
  output: '0',
  solanaInput: '0',
  fee: '0',
  gasFee: '0',
  history: [],
  fromToken: null,
  toToken: null,
  willReceiveToken: '0',
  CustomRecipientAddressAll: [],
  error: '',
  isOpenPreview: false,
  quoteLoading: false,
  originalinput: '0',
  srcGrossPrice: '0',
  destGrossPrice: '0',
  destEstimatedReceived: '0',
  destMinimumReceived: '0',
  enableKeplr: false,
  cosmosAddressConnected: false,
  cosmosAddresses: [],
  signingCosmosClient: null,

  solanaQuoteResponse: null,
  jupiterLoading: false,
  jupiterSlippage: '1',
  solanaMyTokenList: [],
  isOpenPreviewSolToWsol: false,
  isOpenPreviewSolCreateUsdc: false,
  createUsdcStatus: '',
  evmMyTokenList: [],
  noticeInfoModal: false,
  bundleFee: '20000',
  autoBundleFee: true,
  useJitoBundle: true
}

const createMyStore = (state: typeof intialState = intialState) => {
  return createStore<AppState, [['zustand/devtools', never], ['zustand/immer', never], ['zustand/persist', AppState]]>(
    devtools(
      immer(
        persist(
          (set, get) => ({
            ...state,
            increase: () =>
              set(state => {
                state.counter++
              }),
            setFromOrTOChain: (data: L1ChainInfo | L2ChainInfo, dataType: boolean, chainID: SupportedChainId) => {
              if (dataType == true) {
                set(state => {
                  state.fromChain = data
                  state.fromChainID = chainID
                })
              } else {
                set(state => {
                  state.toChain = data
                  state.toChainID = chainID
                })
              }
            },
            getFromChain() {
              const data = get().fromChain
              return data
            },
            getToChain() {
              const data = get().toChain
              return data
            },
            setInput: (amount: string) => {
              set(state => {
                state.input = amount
              })
            },
            setSolanaInput: (amount: string) => {
              set(state => {
                state.solanaInput = amount
              })
            },
            setOutPut: (amount: string) => {
              set(state => {
                state.output = amount
              })
            },
            setFee: (amount: string) => {
              set(state => {
                state.fee = amount
              })
            },
            getInPut() {
              return get().input
            },
            getOutPut() {
              return get().output
            },
            getFee() {
              return get().fee
            },
            addToHistory: (tx: txItem) => {
              const history = get().history
              const data = history.find((item: txItem) => {
                return item.txhash == tx.txhash
              })
              if (data == undefined || data == null) {
                set(state => {
                  state.history.push(tx)
                })
              }
            },
            getHistory: (account: string | undefined | null | string[], isPending?: boolean) => {
              return get()
                .history.filter(item => {
                  const isAccountMatch = Array.isArray(account) ? account.includes(item.user) : item.user === account

                  if (isPending === true) {
                    return isAccountMatch && item.status === undefined
                  } else if (isPending === false) {
                    return isAccountMatch && item.status === 'Success'
                  } else {
                    return isAccountMatch
                  }
                })
                .sort((a, b) => b.creattime - a.creattime)
            },
            clearHistory: (tx?: string, isPending?: boolean) => {
              const history = get().history
              set(state => {
                console.info(history, tx)
                if (tx) {
                  state.history = history.filter(item => item.txhash !== tx)
                } else {
                  if (isPending) {
                    state.history = history.filter(item => item.txhash !== tx && (item.status === 'Success' || item.status === 'Fail'))
                    return
                  }
                  state.history = []
                }
              })
            },
            setGasFee: (amount: string) => {
              set(state => {
                state.gasFee = amount
              })
            },
            setWillReceiveToken: (amount: string) => {
              set(state => {
                state.willReceiveToken = amount
              })
            },
            removeCustomRecipientAddress: (chainId?: SupportedChainId) => {
              set(state => {
                if (chainId) {
                  state.CustomRecipientAddressAll = state.CustomRecipientAddressAll.filter(item => item.chainId !== chainId)
                }
              })
            },
            updateHistoryBytxhash: (txhash: string, toTxhash: string, serveStatus: serveStatus, statusTxt: string) => {
              const history = get().history
              const itemIndex = history.findIndex(item => item.txhash === txhash)

              if (itemIndex !== -1) {
                const currentItem = history[itemIndex]

                // 仅在需要更新时才调用 set
                if (currentItem.toTxhash !== toTxhash || currentItem.status !== statusTxt) {
                  set(state => {
                    const updatedItem = {
                      ...currentItem,
                      toTxhash,
                      status: statusTxt,
                      serveStatus
                    }
                    state.history[itemIndex] = updatedItem
                  })
                }
              }
            },
            setError: (msg: string) => {
              set(state => {
                state.error = msg
              })
            },
            setOpenPreview: (isopen: boolean) => {
              set(state => {
                state.isOpenPreview = isopen
              })
            },
            setQuoteLoading: (isloading: boolean) => {
              set(state => {
                state.quoteLoading = isloading
              })
            },
            setOriginalinput: (value: string) => {
              set(state => {
                state.originalinput = value
              })
            },
            setSrcGrossPrice: (price: string) => {
              set(state => {
                state.srcGrossPrice = price
              })
            },
            setDestGrossPrice: (price: string) => {
              set(state => {
                state.destGrossPrice = price
              })
            },
            setDestEstimatedReceived: (value: string) => {
              set(state => {
                state.destEstimatedReceived = value
              })
            },
            setDestMinimumReceived: (value: string) => {
              set(state => {
                state.destMinimumReceived = value
              })
            },
            setSigningCosmosClient(value: SigningStargateClient) {
              set(state => {
                state.signingCosmosClient = value
              })
            },
            reset: () => {
              set(intialState)
            },
            setEnableKeplr: (isEnable: boolean) => {
              set(state => {
                state.enableKeplr = isEnable
              })
            },
            getEnableKeplr: () => {
              return get().enableKeplr
            },

            setCosmosAddressConnected: (value: boolean) => {
              set(state => {
                state.cosmosAddressConnected = value
              })
            },
            getCosmosAddress: (network?: string | null) => {
              return get().cosmosAddresses.find(addr => addr.chainId === network)?.address || null
            },
            setSearchKey: (serchKey: string, isFrom: boolean) => {
              set(state => {
                if (isFrom) {
                  state.fromSearchKey = serchKey
                } else {
                  state.toSearchKey = serchKey
                }
              })
            },
            setToken: (dataType: boolean, data: Token | null) => {
              set(state => {
                if (dataType) {
                  state.fromToken = data
                } else {
                  state.toToken = data
                }
              })
            },
            setSolanaQuoteResponse: (data: any) => {
              set(state => {
                state.solanaQuoteResponse = data
              })
            },
            setJupiterLoading: (loading: boolean) => {
              set(state => {
                state.jupiterLoading = loading
              })
            },
            setJupiterSlippage: (slippage: string) => {
              set(state => {
                state.jupiterSlippage = slippage
              })
            },
            setSolanaMyTokenList: (data: string[] | []) => {
              set(state => {
                state.solanaMyTokenList = data
              })
            },
            setOpenPreviewSolToWsol: (isopen: boolean) => {
              set(state => {
                state.isOpenPreviewSolToWsol = isopen
              })
            },
            setOpenPreviewSolCreateUsdc: (isopen: boolean) => {
              set(state => {
                state.isOpenPreviewSolCreateUsdc = isopen
              })
            },
            setCreateUsdcStatus: (status: string) => {
              set(state => {
                state.createUsdcStatus = status
              })
            },
            setEvmMyTokenList: (data: string[] | []) => {
              set(state => {
                state.evmMyTokenList = data
              })
            },
            setNoticeInfoModal: (data: boolean) => {
              set(state => {
                state.noticeInfoModal = data
              })
            },
            setCustomRecipientAddressAll: (all: chainIdAddress[]) => {
              set(state => {
                state.CustomRecipientAddressAll = all
              })
            },
            setBundleFee: (data: string) => {
              set(state => {
                state.bundleFee = data
              })
            },
            setAutoBundleFee: (data: boolean) => {
              set(state => {
                state.autoBundleFee = data
              })
            },
            setUseJitoBundle: (data: boolean) => {
              set(state => {
                state.useJitoBundle = data
              })
            },
            setCosmosAddresses: (chainId: string, address: string, connected: boolean) => {
              set(state => {
                const existingIndex = state.cosmosAddresses.findIndex(item => item.chainId === chainId)
                if (existingIndex !== -1) {
                  // Replace existing entry
                  state.cosmosAddresses[existingIndex] = { chainId, address, connected }
                } else {
                  // Add new entry
                  state.cosmosAddresses.push({ chainId, address, connected })
                }
              })
            }
          }),
          {
            name: 'app-storage-v1.1',
            partialize: state => ({
              ...state
              // error: ''
            })
          }
        )
      )
    )
  )
}

const MyStoreContext = createContext<ReturnType<typeof createMyStore> | null>(null)

export const AppStoreProvider: FC<{ children: React.ReactNode; data?: typeof intialState }> = ({ children, data }) => {
  const store = createMyStore(data || intialState)
  // console.log('===========', store)

  return <MyStoreContext.Provider value={store}>{children}</MyStoreContext.Provider>
}

export function useAppStore(): AppState
export function useAppStore<T>(selector: (store: AppState) => T, equalityFn?: (left: T, right: T) => boolean): T
export function useAppStore<T>(selector?: (store: AppState) => T, equalityFn?: (left: T, right: T) => boolean) {
  const store = useContext(MyStoreContext)

  if (!store) {
    throw new Error('MyStoreContext is not provided !')
  }
  //eslint-disable-next-line  @typescript-eslint/no-explicit-any
  return useStore(store, selector as any, equalityFn)
}
