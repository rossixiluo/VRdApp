import { formatUnitsErc20 } from '../../utils'
import { When } from 'react-if'
import Skeleton from 'react-loading-skeleton'

import useEthBalance from '../../hooks/useEthBalance'
import React, { FC } from 'react'
import { getChainInfo } from '../../constants/chainInfo'
import { SupportedChainId } from '../../constants/chains'

type prop = {
  chainid: SupportedChainId
}

const Balance: FC<prop> = ({ chainid }) => {
  const ChainInfo = getChainInfo(chainid)
  const ethBalance = useEthBalance(chainid)

  if (ChainInfo == undefined) return <>**</>

  return (
    <div>
      <When condition={ethBalance.isloading}>
        <Skeleton />
      </When>
      <When condition={ethBalance.isloading == false}>{formatUnitsErc20(ethBalance.balance, '', ChainInfo.nativeCurrency.decimals)}</When>
    </div>
  )
}

export default Balance
