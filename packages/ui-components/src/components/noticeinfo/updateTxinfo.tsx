import React, { FC, useMemo, useEffect } from 'react'
import { txItem } from '../../state/index'

import dayjs from '../../utils/dayjs'

import { Else, If, Then, When } from 'react-if'
import { SupportedChainId } from '../../constants/chains'
import TokenAndChainInfo from './TokenAndChainInfo'
import { ChevronDoubleRightIcon } from '@heroicons/react/24/solid'
import { useStatusMintTxt } from '../../hooks/useStatusMintTxt'
import { useAppStore } from '../../state'

//txItem
const Txinfo: FC<{ Item: txItem }> = ({ Item }) => {
  const isLocalSwap = useMemo(() => {
    return Item.fromChainID == Item.toChainID
  }, [Item.fromChainID, Item.toChainID])

  const statusMint = useStatusMintTxt(Item.txhash, isLocalSwap, Item.fromChainID, Item.toChainID, Item.status === 'Success' || !!Item.toTxhash)

  const updateHistoryBytxhash = useAppStore(state => state.updateHistoryBytxhash)
  // Item.fromChainID
  // Item.toChainID

  //{"code":0,"data":{"attest":"done","mint":"done","scan":"done"}}

  useEffect(() => {
    if (statusMint.text == 'Success' || statusMint.text == 'Fail') {
      updateHistoryBytxhash(Item.txhash, statusMint.toTxhash || '', statusMint.serveStatus, statusMint.text)
    }
  }, [statusMint, statusMint.text, updateHistoryBytxhash, Item.txhash, statusMint.toTxhash, statusMint.serveStatus, Item])

  return (
    <div className="flex flex-col pb-3 mt-2 pt-2">
      <div className=" flex flex-col sm:flex-row justify-around   items-stretch">
        <TokenAndChainInfo Tokeninfo={Item.fromToken} ChainID={Item.fromChainID} Amount={Item.input} isFrom={true} txhash={Item.txhash}></TokenAndChainInfo>
        <div className=" flex">
          <span className=" m-auto p-2">
            <ChevronDoubleRightIcon className=" w-4 h-4"></ChevronDoubleRightIcon>
          </span>
        </div>
        <TokenAndChainInfo
          Tokeninfo={Item.toToken}
          ChainID={Item.toChainID}
          Amount={Item.output}
          isFrom={false}
          txhash={statusMint.toTxhash}
        ></TokenAndChainInfo>
      </div>

      <dt className="mb-1 text-gray-500 md:text-md ">Time: {dayjs(Item.creattime).fromNow()}</dt>
      <dt className="mb-1 text-gray-500 md:text-md ">
        State:
        <If condition={statusMint.isLoading}>
          <Then>
            <span>Loading</span>
          </Then>
          <Else>
            <When condition={statusMint.step == 3}>
              <span className=" text-green-600">Success</span>
            </When>
            <When condition={statusMint.step != 3}>
              <span className=" text-yellow-400">{statusMint.text}</span>
            </When>
          </Else>
        </If>
      </dt>
    </div>
  )
}

export default Txinfo
