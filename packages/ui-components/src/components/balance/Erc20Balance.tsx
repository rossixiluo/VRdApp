import useErc20Balance from '../../hooks/useErc20Balance'
import { formatUnitsErc20 } from '../../utils'
import { When } from 'react-if'
import Skeleton from 'react-loading-skeleton'
import { SupportedChainId } from '../../constants/chains'
import React, { FC } from 'react'

type prop = {
  tokenAddress?: string
  decimals?: number
  chainid: SupportedChainId
}

const Balance: FC<prop> = ({ tokenAddress, decimals, chainid }) => {
  const usdcBalance = useErc20Balance(tokenAddress, chainid)

  if (tokenAddress == undefined || decimals == undefined) return <></>

  return (
    <div>
      <When condition={usdcBalance.isloading}>
        <Skeleton />
      </When>
      <When condition={usdcBalance.isloading == false}>{formatUnitsErc20(usdcBalance.balance, '', decimals)}</When>
    </div>
  )
}

export default Balance
