import React, { FC } from 'react'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/20/solid'

import { getChainInfo } from '../../constants/chainInfo'
import { SupportedChainId } from '../../constants/chains'

type Prop = {
  addr?: string | null
  chainId?: SupportedChainId | null
}
const ScanUrl: FC<Prop> = ({ addr, chainId }) => {
  if (addr == undefined || addr == null || chainId == undefined || chainId == null) {
    return <></>
  }
  const ChainInfo = getChainInfo(chainId)

  const data = addr

  let href = `${ChainInfo?.explorer}/tx/${data}`

  if (chainId == SupportedChainId.NOBLE_Test) {
    href = `${ChainInfo?.explorer}/noble-testnet/tx/${data}`
  }

  return (
    <a
      data-tooltip-id="tooltip"
      data-tooltip-content={`View on ${ChainInfo?.label} Blockchain Explorer`}
      rel="noreferrer"
      target={'_blank'}
      href={href}
      className=" outline-none"
    >
      <ArrowTopRightOnSquareIcon className=" h-4 w-4 text-blue-500 "></ArrowTopRightOnSquareIcon>
    </a>
  )
}

export default ScanUrl
