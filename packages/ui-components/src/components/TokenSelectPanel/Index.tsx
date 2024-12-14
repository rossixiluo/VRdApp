import React, { FC } from 'react'
import SelectChain from './SelectChain'
// import SelectToken from './SelectToken'
import InputAndBalance from './InputAndBalance'
import ReceiveAmount from './ReceiveAmount'
import { Else, If, Then } from 'react-if'
import CosmosInputAndBalance from './CosmosInputAndBalance'
import { useAppStore } from '../../state'
import { isCosmosChain } from '../../constants/chains'

type proteType = {
  isFrom: boolean
}

const TokenSelectPanel: FC<proteType> = ({ isFrom }) => {
  const fromChainID = useAppStore(state => state.fromChainID)
  return (
    <div className="bg-valuerouter-layers-2 rounded   ">
      <div className="border-b-valuerouter-primary/10 flex items-center justify-between border-b px-3 py-2.5 sm:p-3">
        <div className="flex items-center space-x-2 w-full  justify-center relative">
          <p className="text-valuerouter-secondary text-sm font-medium sm:text-base    absolute left-0  ">{isFrom ? 'From' : 'To'}</p>
          <div className=" flex  border-gray-200  border p-1 rounded-md space-x-2 ">
            <div className="relative">
              <SelectChain isFrom={isFrom}></SelectChain>
            </div>
          </div>
        </div>
      </div>
      <If condition={isFrom}>
        <Then>
          <If condition={!isCosmosChain(fromChainID)}>
            <Then>
              <InputAndBalance isFrom={isFrom}></InputAndBalance>
            </Then>
            <Else>
              <CosmosInputAndBalance isFrom={isFrom}></CosmosInputAndBalance>
            </Else>
          </If>
        </Then>
        <Else>
          <ReceiveAmount></ReceiveAmount>
        </Else>
      </If>
    </div>
  )
}

export default TokenSelectPanel
