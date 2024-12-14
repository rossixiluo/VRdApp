import { Dialog, Transition, Tab } from '@headlessui/react'
import { Fragment, FC } from 'react'
import { PowerIcon } from '@heroicons/react/24/solid'
import connectors from '../../web3react/connectors'
import { useToasts } from 'react-toast-notifications'
import { useWeb3React } from '@web3-react/core'
import { PhantomWalletName } from '@solana/wallet-adapter-wallets'
import { useWallet as useWalletSolana } from '@solana/wallet-adapter-react'
// import { accountDataType } from '../../web3react/types'
import { useEffect, useCallback, useState } from 'react'
import EventEmitter from '../../EventEmitter/index'
import metamask from '../../assets/icon/metamask.svg'
import phantomSvg from '../../assets/icon/phantom.svg'
import { useCookie } from 'react-use'
import keplr from '../../assets/keplr.webp'
import useKeplr from '../../hooks/useKeplr'
import { useAppStore } from '../../state'
import CopyAddressBtn from '../linkAndCopy/CopyAddressBtn'
import ChainList from '../chainList/index'

// Define a list of all supported Cosmos wallets
const supportedCosmosWallets = [
  { chainId: 'noble-1', name: 'Noble' },
  { chainId: 'osmosis-1', name: 'Osmosis' },
  { chainId: 'evmos_9001-2', name: 'Evmos' },
  { chainId: 'pacific-1', name: 'Sei' },
  // { chainId: 'coreum-mainnet-1', name: 'Coreum' },
  { chainId: 'dydx-mainnet-1', name: 'dYdX' }
]

interface componentprops {
  isOpen: boolean
  closeModal: () => void
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

const DisconnectMM = async () => {
  if (window.ethereum.request) {
    await window.ethereum.request({
      method: 'wallet_revokePermissions',
      params: [
        {
          eth_accounts: {}
        }
      ]
    })
  } else {
    // 对于较旧版本的 MetaMask
    await window.ethereum.disable()
  }
}

const WalletModal: FC<componentprops> = ({ isOpen, closeModal }) => {
  const { wallet, connect, select, publicKey, connected, disconnect } = useWalletSolana()
  const { cosmosAddresses, setCosmosAddresses } = useAppStore(state => state)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedCatch, setConnectCatch] = useState(false)

  const { addToast } = useToasts()
  const [walletIsConnectvalue, updateCookie, deleteCookie] = useCookie('walletIsConnectedTo')
  const { enableKeplr, disconnectKeplr } = useKeplr()
  // const [accountData, setAccountData] = useState<null | accountDataType>(null)
  // const noderef= useRef()
  const { account, activate, deactivate } = useWeb3React()

  const connectMetaMask = useCallback(async () => {
    let status = false
    await activate(connectors.metamask, (err: Error) => {
      addToast(err.message, { appearance: 'error' })
      if (err.message.indexOf('UnsupportedChainId')) {
        EventEmitter.emit('UnsupportedChainId', true)
      } else {
        EventEmitter.emit('UnsupportedChainId', false)
      }

      status = true
    })

    if (!status) {
      updateCookie('metamask', { expires: 30, path: '/' })
    }
  }, [activate, addToast, updateCookie])

  const connectWalletConnect = useCallback(async () => {
    // let status = false
    await activate(connectors.walletConnect, (err: Error) => {
      addToast(err.message, { appearance: 'error' })
      if (err.message.indexOf('UnsupportedChainId')) {
        EventEmitter.emit('UnsupportedChainId', true)
      } else {
        EventEmitter.emit('UnsupportedChainId', false)
      }
    })
  }, [activate, addToast])

  const connectPhantom = useCallback(async () => {
    if (isConnecting) return
    setIsConnecting(true)

    try {
      if (!wallet) {
        await select(PhantomWalletName)
      }
      await connect()
      setConnectCatch(true)

      closeModal()
    } catch (err) {
      addToast(String(err), { appearance: 'error' })
    } finally {
      setIsConnecting(false)
    }
  }, [wallet, connect, select, addToast, closeModal, isConnecting])

  const walletsToDisplay = [{ id: '1', title: 'MetaMask', imgSrc: metamask, fn: connectMetaMask }]

  // connect on load
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (walletIsConnectvalue?.trim() === 'metamask') {
        await connectMetaMask()
      }

      if (connected) {
        await connectPhantom()
      }
    }

    connectWalletOnPageLoad()
    // }
  }, [connectMetaMask, connectWalletConnect, connectPhantom, walletIsConnectvalue, connected])

  useEffect(() => {
    if (connectedCatch) {
      const timer = setTimeout(() => {
        if (!connected) {
          window.location.reload()
        }
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [connectedCatch, connected])

  const renderWalletButton = (wallet: (typeof walletsToDisplay)[0]) => (
    <button
      key={wallet.id}
      onClick={wallet.fn}
      type="button"
      className="text-gray-900 bg-white w-full hover:bg-gray-100 border border-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center  mr-2 mb-2 min-w-full"
    >
      <img src={wallet.imgSrc} className="w-6 h-6 mr-2 -ml-1" alt={wallet.title} />
      {wallet.title}
    </button>
  )

  const renderConnectedAccount = (address: string, disconnectFn: () => void, walletName: string) => (
    <div className="bg-gray-100 rounded-lg p-3 mb-2">
      <div className="flex items-center justify-between mb-2">
        <span className="font-medium">{walletName}</span>
        <button onClick={disconnectFn} className="text-red-600 hover:text-red-800 flex items-center">
          <PowerIcon className="w-4 h-4 mr-1" />
          Disconnect
        </button>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600 truncate max-w-[70%]">{address}</span>
        <CopyAddressBtn addr={address} />
      </div>
    </div>
  )

  const categories = {
    Evm: (
      <div className="flex flex-col gap-2">
        <ChainList />
        {!account
          ? walletsToDisplay.map(renderWalletButton)
          : renderConnectedAccount(
              account,
              async () => {
                await deactivate()
                DisconnectMM()
                localStorage.removeItem('walletIsConnectedTo')
                deleteCookie()
              },
              'MetaMask'
            )}
      </div>
    ),
    Cosmos: (
      <div className="flex flex-col gap-2">
        {supportedCosmosWallets.map(wallet => {
          const connectedWallet = cosmosAddresses.find(addr => addr.chainId === wallet.chainId)
          return (
            <div key={wallet.chainId}>
              {connectedWallet && connectedWallet.connected && connectedWallet.address
                ? renderConnectedAccount(connectedWallet.address, () => disconnectKeplr(wallet.chainId), `${wallet.name}`)
                : renderWalletButton({
                    id: wallet.chainId,
                    title: `${wallet.name}`,
                    imgSrc: keplr,
                    fn: () => enableKeplr(wallet.chainId)
                  })}
            </div>
          )
        })}
      </div>
    ),
    Solana: (
      <div className="text-[15px]">
        {!publicKey
          ? renderWalletButton(
              walletsToDisplay.find(wallet => wallet.title === 'Phantom') ?? { id: '0', title: 'Phantom', imgSrc: phantomSvg, fn: connectPhantom }
            )
          : renderConnectedAccount(
              publicKey.toBase58(),
              async () => {
                disconnect()
                setConnectCatch(false)
              },
              'Phantom'
            )}
      </div>
    )
  }
  return (
    <>
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
                <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Select Wallet
                  </Dialog.Title>
                  <div className="w-full max-w-lg px-2 pt-5 sm:px-0">
                    <Tab.Group>
                      <Tab.List className="flex space-x-1 rounded-xl bg-primary-700 p-1">
                        {Object.keys(categories).map(category => (
                          <Tab
                            key={category}
                            className={({ selected }) =>
                              classNames(
                                'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                                'ring-white/60 ring-offset-2 ring-offset-blue-400 ',
                                selected ? 'bg-white text-blue-700 shadow' : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                              )
                            }
                          >
                            {category}
                          </Tab>
                        ))}
                      </Tab.List>
                      <Tab.Panels className="mt-2 flex">
                        {Object.values(categories).map((content, idx) => (
                          <Tab.Panel key={idx} className={classNames('w-full rounded-xl bg-white p-3', 'ring-white/60 ring-offset-2 ring-offset-blue-400')}>
                            {content}
                          </Tab.Panel>
                        ))}
                      </Tab.Panels>
                    </Tab.Group>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
      {/* Add a button to manually trigger connection */}
      {/* <button onClick={connectPhantom} disabled={isConnecting}>
        {isConnecting ? 'Connecting...' : 'Connect Phantom'}
      </button> */}
    </>
  )
}

export default WalletModal
