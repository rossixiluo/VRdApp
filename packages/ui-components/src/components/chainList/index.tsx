import React, { FC, useEffect, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { USECHAIN_IDS, SupportedChainId } from '../../constants/chains'
import { getChainInfo, L1ChainInfo, L2ChainInfo, OtherChainInfo } from '../../constants/chainInfo'
import { useWeb3React } from '@web3-react/core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { icon } from '@fortawesome/fontawesome-svg-core/import.macro'
import switchEthereumChain from '../../metamask/switchEthereumChain'
import { RPC_URLS } from '../../constants/networks'
import EventEmitter from '../../EventEmitter/index'
import { When } from 'react-if'
import { useAppStore } from '../../state'

type Props = {
  children?: React.ReactNode
}

interface ChainInfo {
  item: L1ChainInfo | L2ChainInfo | OtherChainInfo
  chainId: SupportedChainId
}

const ChainList: FC<Props> = ({ children }) => {
  const [chains, setChains] = useState<ChainInfo[]>([])
  const [selectedChain, setSelectedChain] = useState<ChainInfo | null>(null)
  const [unsupported] = useState<boolean>(false)
  const { account, chainId, library } = useWeb3React()
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const data = USECHAIN_IDS.map(item => ({
      item: getChainInfo(item),
      chainId: item
    })).filter(item => typeof item.chainId === 'number')
    setChains(data)
  }, [cosmosAddress, account])

  useEffect(() => {
    if (chainId != null) {
      const chainInfo = chains.find(chain => chain.chainId === chainId)
      if (chainInfo) {
        setSelectedChain(chainInfo)
      }
    } else if (chains.length > 0) {
      setSelectedChain(chains[0])
    }
  }, [chainId, chains])

  const SwitchingNetwork = useCallback(
    async (network: ChainInfo) => {
      await switchEthereumChain(network.chainId, network.item.label, RPC_URLS[network.chainId], library, unsupported)
      setSelectedChain(network)
      setIsOpen(false)
    },
    [library, unsupported]
  )

  useEffect(() => {
    EventEmitter.on('UnsupportedChainId', Unsupported => {
      // Handle unsupported chain
    })
  }, [])

  if (chainId == undefined && cosmosAddress == undefined) {
    return <></>
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-blue-50"
      >
        <When condition={unsupported !== true && chainId != undefined}>
          <span className="mr-2 text-[15px]">Connected to network:</span>
          <div className="w-[50px]"> </div>
          <img className="w-6 h-6 mr-2" src={selectedChain?.item.logoUrl} alt={selectedChain?.item.label} />
          <span>{selectedChain?.item.label}</span>
          <FontAwesomeIcon icon={icon({ name: 'chevron-down', style: 'solid' })} className="ml-2" />
        </When>
      </button>

      <Transition appear show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={React.Fragment}
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
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[240px] transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    Select Chain
                  </Dialog.Title>
                  <div className="mt-2 space-y-2">
                    {chains.map(chain => (
                      <button
                        key={chain.chainId}
                        onClick={() => SwitchingNetwork(chain)}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                      >
                        <img className="w-6 h-6 mr-3" src={chain.item.logoUrl} alt={chain.item.label} />
                        {chain.item.label}
                      </button>
                    ))}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}

export default ChainList
