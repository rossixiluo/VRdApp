import React, { FC, useState, useMemo } from 'react'
import SelectChainModal from './SelectChainModel'
import { useAppStore } from '../../state'
import SelectToken from './SelectToken'

type proteType = {
  isFrom: boolean
}

const SelectChain: FC<proteType> = ({ isFrom }) => {
  const [isFromOpen, setIsFromOpen] = useState<boolean>(false)

  const fromChainInfo = useAppStore(state => state.fromChain)
  const toChainInfo = useAppStore(state => state.toChain)

  const ChainInfo = useMemo(() => {
    if (isFrom) {
      return fromChainInfo
    } else {
      return toChainInfo
    }
  }, [fromChainInfo, toChainInfo, isFrom])

  return (
    <>
      <button
        onClick={() => {
          setIsFromOpen(true)
        }}
        className="skt-w skt-w-input skt-w-button flex w-auto  flex-shrink-0 items-center justify-start bg-transparent p-2 py-0 hover:bg-transparent sm:justify-between space-x-2"
      >
        <SelectToken isFrom={isFrom}></SelectToken>
        <p className="text-valuerouter-secondary text-sm font-medium sm:text-base">On</p>
        <span className="flex items-center">
          <div className="relative flex h-fit w-fit">
            <div className="skt-w h-5 w-5 overflow-hidden rounded-full sm:h-6 sm:w-6">
              <img src={ChainInfo?.logoUrl} width="100%" height="100%" />
            </div>
          </div>
          <span className="skt-w text-valuerouter-primary -mb-0.5 ml-1 font-medium sm:text-lg">{ChainInfo?.label}</span>
        </span>
        <div className="bg-valuerouter-layers-2 ml-2 mt-[3px] h-4 w-4 rounded-full sm:h-5 sm:w-5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="skt-w text-valuerouter-primary h-full w-full rotate-0 transition-all"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </button>
      <SelectChainModal
        isOpen={isFromOpen}
        closeModal={() => {
          setIsFromOpen(false)
        }}
        isFrom={isFrom}
      ></SelectChainModal>
    </>
  )
}

export default SelectChain
