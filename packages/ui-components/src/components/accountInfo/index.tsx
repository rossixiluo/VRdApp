import React, { FC, useCallback } from 'react'
import { Popover } from '@headlessui/react'
import { useWeb3React } from '@web3-react/core'
import { PowerIcon } from '@heroicons/react/24/solid'
import CopyAddressBtn from '../linkAndCopy/CopyAddressBtn'
import { cutOut } from '../../utils'
import { useCookie } from 'react-use'
import { useAppStore } from '../../state'
import { SupportedChainId } from '../../constants/chains'
import { useWallet as useWalletSolana } from '@solana/wallet-adapter-react'

type Props = {
  children?: React.ReactNode
}
const ChainList: FC<Props> = ({ children }) => {
  const { account, deactivate } = useWeb3React()
  const [, , deleteCookie] = useCookie('walletIsConnectedTo')
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))
  const { publicKey, disconnect } = useWalletSolana()

  const onLogout = useCallback(() => {
    deleteCookie()
    deactivate()
    disconnect()
  }, [deactivate, deleteCookie, disconnect])

  const displayAccountInfo = (fromChainID === SupportedChainId.SOLANA && publicKey && publicKey.toBase58()) || account

  return (
    <Popover className="relative">
      <Popover.Button className="flex flex-row items-center justify-center text-gray-800 hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 lg:py-2.5 mr-2 focus:outline-none">
        {children}
      </Popover.Button>

      <Popover.Panel className="absolute   left-2/3  md:left-1/2 z-10 mt-4    max-w-sm -translate-x-1/2 transform px-4     sm:px-0 lg:max-w-3xl">
        <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="relative   w-64 grid gap-4 bg-white p-6 ">
            <div className="-m-3 flex items-center justify-between rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50">
              <span>{displayAccountInfo && cutOut(displayAccountInfo, 4, 4)}</span>
              <CopyAddressBtn addr={displayAccountInfo}></CopyAddressBtn>
            </div>
            <div className="-m-3 flex items-center justify-between rounded-lg p-2 transition duration-150 ease-in-out hover:bg-gray-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50">
              <span>{cosmosAddress && cutOut(cosmosAddress, 4, 4)}</span>
              <CopyAddressBtn addr={cosmosAddress}></CopyAddressBtn>
            </div>
            <div
              onClick={onLogout}
              className=" break-words flex items-center justify-center  cursor-pointer rounded-lg p-2 transition duration-150 ease-in-out hover:bg-blue-50 focus:outline-none focus-visible:ring focus-visible:ring-orange-500 focus-visible:ring-opacity-50"
            >
              <PowerIcon className=" w-6 h-6 text-red-700  "></PowerIcon>
            </div>
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  )
}

export default ChainList
