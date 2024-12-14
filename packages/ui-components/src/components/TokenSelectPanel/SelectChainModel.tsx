import React, { useMemo, useEffect, useCallback, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Fragment, FC } from 'react'
import { Else, If, Then, When } from 'react-if'
import { X } from 'lucide-react'
import { GAS_IS_ETH, SupportedChainId, USECHAIN_IDS, DISABLE_CHAIN_IDS } from '../../constants/chains'
import { L1ChainInfo, L2ChainInfo, getChainInfo } from '../../constants/chainInfo'
import { useAppStore } from '../../state'
import { isCosmosChain } from '../../constants/chains'

import useTokenList from '../../hooks/useTokenList'
import Skeleton from 'react-loading-skeleton'
import { Token } from '../../types/token'
import { CheckIcon } from '@heroicons/react/24/solid'
import List from 'rc-virtual-list'
import { classNames, cutOut } from '../../utils'
import ethlogo from '../../assets/icon/ethereum-logo.png'
import usdclogo from '../../assets/icon/usdc.png'
import TokenBalance from './TokenBalance'
import useKeplr from '../../hooks/useKeplr'
import useDefaultToken from '../../hooks/useDefaultToken'

interface ComponentProps {
  isOpen: boolean
  closeModal: () => void
  isFrom: boolean
}

/**
 * 切换网络，token也需要清空
 */

const SelectChainModal: FC<ComponentProps> = ({ isOpen, closeModal, isFrom }) => {
  const setFromOrTOChain = useAppStore(state => state.setFromOrTOChain)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const setToken = useAppStore(state => state.setToken)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const [searchKey, setSearchKey] = useState<string | undefined>()
  const setError = useAppStore(state => state.setError)
  const [loading, setLoading] = useState<boolean>(false)

  const setSearchKeyToStore = useAppStore(state => state.setSearchKey)

  const fromSearchKey = useAppStore(state => state.fromSearchKey)
  const toSearchKey = useAppStore(state => state.toSearchKey)
  const setWillReceiveToken = useAppStore(state => state.setWillReceiveToken)
  const setGasFeeStore = useAppStore(state => state.setGasFee)
  const nobleDefaultToken = useDefaultToken(SupportedChainId.NOBLE)

  const { enableKeplr } = useKeplr()

  const listIng = useMemo(() => {
    // if (!isFrom && isCosmosChain(fromChainID)) {
    //   if (fromChainID !== SupportedChainId.NOBLE) {
    //     return [SupportedChainId.NOBLE]
    //   }
    //   // return USECHAIN_IDS.filter(item => isCosmosChain(item))
    // }

    return USECHAIN_IDS
  }, [isFrom, fromChainID])

  const currChainID = useMemo(() => {
    return isFrom ? fromChainID : toChainID
  }, [isFrom, fromChainID, toChainID])

  const currToken = useMemo(() => {
    return isFrom ? fromToken : toToken
  }, [isFrom, fromToken, toToken])

  const { data: tokenList, isLoading: tokenIsLoading } = useTokenList(isFrom)

  const tokenListEth = useMemo(() => {
    if (currChainID == null || tokenList == undefined || loading) return []

    const chainInfo = getChainInfo(currChainID)
    const isEthGas = GAS_IS_ETH.includes(currChainID)
    const item: Token = {
      chainId: currChainID,
      address: '',
      name: chainInfo.nativeCurrency.name,
      symbol: chainInfo.nativeCurrency.symbol,
      decimals: chainInfo.nativeCurrency.decimals,
      logoURI: isEthGas ? ethlogo : chainInfo.logoUrl
    }

    const list = tokenList.filter(item => {
      if (searchKey == '' || searchKey == undefined) return true
      if (item.name.toLowerCase().includes(searchKey.toLowerCase()) || item.symbol.toLowerCase().includes(searchKey.toLowerCase())) {
        return true
      } else {
        return false
      }
    })

    // 过滤相同的token
    const uniqueList = Array.from(new Set(list.map(item => item.address))).map(address => {
      return list.find(item => item.address === address)
    })

    // cosmos 不显示gas token
    if (isCosmosChain(currChainID)) {
      return uniqueList
    } else {
      return [item, ...uniqueList]
    }
  }, [tokenList, currChainID, searchKey, loading])

  useEffect(() => {
    const need = fromChainID == null || toChainID == null || USECHAIN_IDS.includes(fromChainID) == false || USECHAIN_IDS.includes(toChainID) == false
    //set default
    const list = USECHAIN_IDS.filter(item => DISABLE_CHAIN_IDS.includes(item) == false)
    if (need && isFrom) {
      const networkFrom = getChainInfo(list[2])
      const networkTo = getChainInfo(list[7])

      setFromOrTOChain(networkFrom, true, list[2]) // true from
      setFromOrTOChain(networkTo, false, list[7]) //false to

      const usdc = {
        name: 'USDC Token',
        address: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
        symbol: 'USDC',
        decimals: 6,
        chainId: 43114,
        logoURI: 'https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/avalanchec/assets/0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E/logo.png',
        extensions: {
          bridgeInfo: {
            '1': {
              tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
            }
          }
        }
      }
      setToken(true, usdc)
    }
  }, [fromChainID, toChainID, isFrom, setFromOrTOChain, setToken])

  const selectToken = useCallback(
    (data: Token | null) => {
      setToken(isFrom, data)
      setError('')
      setWillReceiveToken('0')
      setGasFeeStore('0')
      if (data !== null) {
        closeModal()
      }
    },
    [setToken, closeModal, isFrom, setError, setWillReceiveToken, setGasFeeStore]
  )

  const clickFn = useCallback(
    async (network: L1ChainInfo | L2ChainInfo, chainId: SupportedChainId) => {
      if (DISABLE_CHAIN_IDS.includes(chainId)) {
        return
      }
      setFromOrTOChain(network, isFrom, chainId)
      selectToken(null)
      setError('')
      setWillReceiveToken('0')
      setGasFeeStore('0')
      // if (isCosmosChain(chainId) && isFrom) {
      //   enableKeplr(chainId as string)
      //   const NobleChain = getChainInfo(SupportedChainId.NOBLE)
      //   setFromOrTOChain(NobleChain, false, SupportedChainId.NOBLE)
      //   if (nobleDefaultToken) {
      //     setToken(false, nobleDefaultToken)
      //   }
      // }
    },
    [isFrom, setFromOrTOChain, selectToken, setError, setWillReceiveToken, setGasFeeStore]
  )

  const searchClick = async (value: string) => {
    setLoading(true)
    setSearchKey(value)
    setSearchKeyToStore(value, isFrom)
    await new Promise(resolve => setTimeout(resolve, 50))
    setLoading(false)
  }

  useEffect(() => {
    if (isFrom) {
      setSearchKey(fromSearchKey)
    } else {
      setSearchKey(toSearchKey)
    }
  }, [setSearchKey, fromSearchKey, toSearchKey, isFrom])

  // 关闭时清空搜索框
  useEffect(() => {
    if (!isOpen) {
      setSearchKeyToStore('', isFrom)
      setSearchKeyToStore('', !isFrom)
    }
  }, [isOpen])

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="flex justify-between text-lg font-medium leading-6 text-gray-900">
                  <If condition={isFrom}>
                    <Then>Select a chain and token</Then>
                    <Else>Select a chain and token</Else>
                  </If>
                  <X onClick={closeModal} />
                </Dialog.Title>
                <div className="mt-3">
                  <ul className="max-w-md flex flex-row flex-wrap">
                    {listIng.map((chainId, index) => {
                      const network = getChainInfo(chainId)

                      return (
                        <li
                          key={index}
                          onClick={() => {
                            clickFn(network, chainId)
                          }}
                          className={classNames('w-1/4 cursor-pointer hover:bg-slate-50')}
                        >
                          <div
                            className={classNames(
                              'flex flex-col items-center space-y-4 border border-gray-200 rounded-md m-1 relative',
                              DISABLE_CHAIN_IDS.includes(chainId) ? 'bg-slate-300 cursor-text' : ''
                            )}
                          >
                            <div className="absolute right-2">
                              <When condition={currChainID == chainId}>
                                <CheckIcon className="w-6 h-6 text-green-600" />
                              </When>
                            </div>
                            <div className="flex-shrink-0">
                              <img className="w-8 h-8 rounded-full" src={network.logoUrl} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate  mb-2">{network.label}</p>
                            </div>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                  <div>
                    <input
                      onChange={e => {
                        searchClick(e.currentTarget.value)
                      }}
                      placeholder="search token"
                      value={searchKey}
                      type="text"
                      className="bg-gray-50 border outline-none mb-4 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                    />
                  </div>
                  <div>
                    <If condition={tokenIsLoading}>
                      <Then>
                        <Skeleton count={10} />
                      </Then>
                      <Else>
                        <ul className="max-w-md divide-y divide-gray-200  max-h-[300px]">
                          {!loading ? (
                            <List data={tokenListEth} height={300} itemHeight={44} itemKey="address">
                              {TokenItem =>
                                TokenItem && (
                                  <li
                                    key={TokenItem.address}
                                    onClick={() => {
                                      selectToken(TokenItem as Token)
                                    }}
                                    className="pb-3 pt-2 sm:pb-4 cursor-pointer hover:bg-slate-50"
                                  >
                                    <div className="flex items-center space-x-4">
                                      <div className="flex-shrink-0">
                                        <img className="w-6 h-6 rounded-full" src={TokenItem.logoURI} />
                                      </div>
                                      <div className="flex-1 min-w-0 group">
                                        <p className="font-medium text-md text-gray-900 truncate ">{TokenItem.symbol}</p>
                                        <p className="text-sm transition ease-in-out block group-hover:hidden text-gray-500 truncate ">{TokenItem.name}</p>
                                        <p className="text-sm transition ease-in-out hidden group-hover:block text-gray-500 truncate ">
                                          {TokenItem.address == '' ? TokenItem.name : cutOut(TokenItem.address, 8, 8)}
                                        </p>
                                      </div>
                                      <div className="min-w-[50px] pr-2">
                                        <div className="text-sm font-medium text-gray-900 truncate ">
                                          <TokenBalance
                                            chainid={TokenItem.chainId as SupportedChainId}
                                            tokenAddress={TokenItem.address}
                                            decimals={TokenItem.decimals}
                                          />
                                        </div>
                                        <p className="text-sm text-gray-500 truncate ">
                                          <When condition={currToken?.address == TokenItem.address}>
                                            <CheckIcon className="w-6 h-6 text-green-600" />
                                          </When>
                                        </p>
                                      </div>
                                    </div>
                                  </li>
                                )
                              }
                            </List>
                          ) : (
                            <div className="h-[300px] flex justify-center">{/* <Loading /> */}</div>
                          )}
                        </ul>
                      </Else>
                    </If>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}

export default SelectChainModal
