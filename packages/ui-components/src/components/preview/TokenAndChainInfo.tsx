import React, { FC, useMemo } from 'react'
import { useAppStore } from '../../state'
import { formatUnitsErc20, cutOut } from '../../utils'
import ScanUrl from '../linkAndCopy/ScanUrl'
import CopyAddressBtn from '../linkAndCopy/CopyAddressBtn'
import { When } from 'react-if'

type proteType = {
  isFrom: boolean
  txhash?: string | undefined | null
}

const TokenAndChainInfo: FC<proteType> = ({ isFrom, txhash }) => {
  const fromChainInfo = useAppStore(state => state.fromChain)
  const toChainInfo = useAppStore(state => state.toChain)
  const input = useAppStore(state => state.input)
  const output = useAppStore(state => state.willReceiveToken)

  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)

  const Tokeninfo = useMemo(() => {
    if (isFrom) {
      return fromToken
    } else {
      return toToken
    }
  }, [isFrom, fromToken, toToken])

  const ChainInfo = useMemo(() => {
    if (isFrom) {
      return fromChainInfo
    } else {
      return toChainInfo
    }
  }, [isFrom, fromChainInfo, toChainInfo])

  const Amount = useMemo(() => {
    if (isFrom) {
      return input
    } else {
      return output
    }
  }, [isFrom, input, output])

  const ChainID = useMemo(() => {
    if (isFrom) {
      return fromChainID
    } else {
      return toChainID
    }
  }, [isFrom, fromChainID, toChainID])

  if (Tokeninfo == null) {
    return <></>
  }

  return (
    <div className=" bg-slate-50 flex flex-col rounded-md  p-4">
      <div className="">
        <span className=" font-semibold  text-base mr-4">{isFrom ? 'From' : 'To'}</span>
        <span className="">{ChainInfo?.label}</span>
      </div>
      <div className=" flex items-center space-x-1">
        <div className="flex -space-x-4  items-start">
          <img width={40} src={Tokeninfo.logoURI}></img>
          <img width={20} src={ChainInfo?.logoUrl}></img>
        </div>
        <div>
          <div className=" flex flex-wrap">{formatUnitsErc20(Amount, Tokeninfo.symbol, Tokeninfo.decimals)}</div>
        </div>
      </div>

      <div className=" flex items-center  mt-2 space-x-2">
        <When condition={txhash}>
          Tx Hash: {txhash && cutOut(txhash, 2, 2)} <ScanUrl addr={txhash} chainId={ChainID}></ScanUrl> <CopyAddressBtn addr={txhash}></CopyAddressBtn>
        </When>
      </div>
    </div>
  )
}

export default TokenAndChainInfo
