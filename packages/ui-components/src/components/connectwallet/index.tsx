import React, { FC, useState, useEffect, useCallback } from 'react'
import metamask from '../../assets/icon/metamask.svg'
import WalletModal from '../walletModal'
import { useWeb3React } from '@web3-react/core'
import { When } from 'react-if'
// import {getChainInfo} from '../../constants/chainInfo'
import EventBus from '../../EventEmitter/index'
import keplr from '../../assets/keplr.webp'
import { useAppStore } from '../../state'
import { useWallet } from '@solana/wallet-adapter-react'
import phantom from '../../assets/icon/phantom.svg'
// import useSolanaAccount from '../../hooks/useSolanaAccount'

const Connectwallet: FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  // const [chianName,setchianName]=useState<string>("")
  const { account } = useWeb3React()
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddress = useAppStore(state => state.cosmosAddresses)
  const isCosmosConnected = cosmosAddress.some(address => address.connected)
  const { publicKey } = useWallet()
  // const { publicKey: solanaPublicKey } = useSolanaAccount()

  const closeModal = useCallback(() => {
    setIsOpen(false)
  }, [setIsOpen])

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [setIsOpen])

  useEffect(() => {
    EventBus.on('connectwallet', () => {
      setIsOpen(true)
    })
    return () => {
      EventBus.off('connectwallet')
    }
  }, [setIsOpen])

  const isConnected = account || isCosmosConnected || publicKey?.toBase58()

  return (
    <>
      <When condition={isConnected}>
        <div className="flex items-center cursor-pointer" onClick={openModal}>
          <div className="hidden sm:flex flex-row  py-1 text-xl mr-1 space-x-1 ">
            {account && <img width={20} src={metamask}></img>}
            {isCosmosConnected && <img width={20} src={keplr}></img>}
            {publicKey && <img width={20} src={phantom}></img>}
          </div>
          <div className="flex  flex-col  text-sm mr-1">
            {/* <div className="">{walletName}</div> */}
            <div className="">Connected</div>
          </div>
        </div>
      </When>
      <When condition={!isConnected}>
        <button
          onClick={openModal}
          type="button"
          className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none "
        >
          Connect wallet
        </button>
      </When>

      <WalletModal closeModal={closeModal} isOpen={isOpen}></WalletModal>
    </>
  )
}

export default Connectwallet
