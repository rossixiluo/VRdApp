import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { useAppStore, chainIdAddress } from '../../state'
import { ethers } from 'ethers'
import { useToasts } from 'react-toast-notifications'
import { Else, If, Then } from 'react-if'
import { cutOut, isValidSolanaAddress } from '../../utils'
import { SupportedChainId, isCosmosChain } from '../../constants/chains'
import { useCusRecipientAddress } from '../../hooks/useCusRecipientAddress'
import { getChainInfo } from '../../constants/chainInfo'

export default function RecipientModel() {
  const { removeCustomRecipientAddress, getRecipientAddressForChain } = useCusRecipientAddress()

  const recipientAddressForChain: string = getRecipientAddressForChain()
  const CustomRecipientAddressAll = useAppStore(state => state.CustomRecipientAddressAll)
  const setCustomRecipientAddressAll = useAppStore(state => state.setCustomRecipientAddressAll)

  const [isOpen, setIsOpen] = useState(false)
  const [recipientAddress, setRecipientAddress] = useState<string>(recipientAddressForChain || '')
  const toChainID = useAppStore(state => state.toChainID)
  const [selectCheck, setSelectCheck] = useState<boolean>(false)
  const { addToast } = useToasts()
  function closeModal() {
    setIsOpen(false)
    setRecipientAddress('')
    setSelectCheck(false)
  }

  function openModal() {
    setIsOpen(true)
  }

  const setRecipientAddressAll = useCallback(
    (recipientAddress: string, toChainID?: string) => {
      if (toChainID) {
        const newAddress: chainIdAddress = {
          address: recipientAddress,
          chainId: toChainID
        }
        setCustomRecipientAddressAll([...CustomRecipientAddressAll, newAddress])
      }
    },
    [CustomRecipientAddressAll, setCustomRecipientAddressAll]
  )

  const saveClick = useCallback(() => {
    if (selectCheck == false) {
      addToast('Please ensure that the address is correct and not an exchange wallet', { appearance: 'error' })
      return
    }

    if (toChainID === SupportedChainId.SOLANA) {
      if (isValidSolanaAddress(recipientAddress)) {
        setRecipientAddressAll(recipientAddress, toChainID)
      } else {
        addToast('Check the recipient address format', { appearance: 'error' })
        return
      }
    } else if (isCosmosChain(toChainID)) {
      setRecipientAddressAll(recipientAddress, toChainID as string)
    } else {
      const isok = ethers.utils.isAddress(recipientAddress)
      if (isok == false) {
        addToast('Check the recipient address format', { appearance: 'error' })
        return
      }
      if (toChainID) {
        setRecipientAddressAll(recipientAddress, toChainID as string)
      }
    }
    setRecipientAddress('')
    setIsOpen(false)
  }, [recipientAddress, addToast, selectCheck, setIsOpen, toChainID, setRecipientAddressAll])

  const clearClick = useCallback(() => {
    setRecipientAddress('')
    if (toChainID) {
      removeCustomRecipientAddress(toChainID)
    }
  }, [toChainID, removeCustomRecipientAddress])

  const chainName = toChainID ? getChainInfo(toChainID)?.label : ''

  useEffect(() => {
    return () => {
      return setRecipientAddress('')
    }
  }, [])
  return (
    <>
      <div className="flex items-center font-medium">
        <button onClick={openModal} className="text-valuerouter-theme-primary flex items-center font-semibold">
          <If condition={recipientAddressForChain == null || recipientAddressForChain == ''}>
            <Then>
              <svg width={25} height={25} viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12.5 2.97162C6.977 2.97162 2.5 7.44862 2.5 12.9716C2.5 18.4946 6.977 22.9716 12.5 22.9716C18.023 22.9716 22.5 18.4946 22.5 12.9716C22.5 7.44862 18.023 2.97162 12.5 2.97162ZM15.5 13.9716H13.5V15.9716C13.5 16.5236 13.052 16.9716 12.5 16.9716C11.948 16.9716 11.5 16.5236 11.5 15.9716V13.9716H9.5C8.948 13.9716 8.5 13.5236 8.5 12.9716C8.5 12.4196 8.948 11.9716 9.5 11.9716H11.5V9.97162C11.5 9.41962 11.948 8.97162 12.5 8.97162C13.052 8.97162 13.5 9.41962 13.5 9.97162V11.9716H15.5C16.052 11.9716 16.5 12.4196 16.5 12.9716C16.5 13.5236 16.052 13.9716 15.5 13.9716Z"
                  fill="#3838f0"
                />
              </svg>{' '}
              <span className="ml-1">Add Address</span>
            </Then>
            <Else>
              <span className=" font-normal">{recipientAddressForChain && cutOut(recipientAddressForChain, 8, 8)}</span>
              <span className="ml-1  text-blue-500"> Edit</span>
            </Else>
          </If>
        </button>
      </div>

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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Recipient address for {chainName} Chain
                  </Dialog.Title>
                  <div className="mt-2">
                    <input
                      onChange={e => {
                        setRecipientAddress(e.currentTarget.value)
                      }}
                      type="text"
                      value={recipientAddress}
                      className="bg-gray-50 border outline-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 "
                      placeholder={recipientAddressForChain || 'Destination Address'}
                    ></input>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500  bg-gray-50 rounded-md">
                      <input
                        checked={selectCheck}
                        onChange={e => {
                          setSelectCheck(e.currentTarget.checked)
                        }}
                        type="checkbox"
                        className="w-4 h-4 m-2 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 "
                      ></input>
                      Please ensure that the address is correct and not an exchange wallet. Any tokens sent to the wrong address will be impossible to retrieve.
                    </p>
                  </div>

                  <div className="mt-4 flex gap-5">
                    <button
                      type="button"
                      onClick={() => clearClick()}
                      className="px-6 py-3.5 inline-flex  justify-center rounded-md border border-transparent bg-red-500 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                    >
                      Clear
                    </button>
                    <button
                      type="button"
                      onClick={saveClick}
                      className="px-6 py-3.5 inline-flex flex-1 justify-center rounded-md border border-transparent bg-blue-700 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    >
                      Confirm Recipient Address
                    </button>
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
