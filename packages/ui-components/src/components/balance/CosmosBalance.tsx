import React, { FC, useMemo } from 'react'
import { getChainInfo } from '../../constants/chainInfo'
import { When } from 'react-if'
import Skeleton from 'react-loading-skeleton'
import { SupportedChainId, isCosmosChain } from '../../constants/chains'
import useCosmosBalance from '../../hooks/useCosmosBalance'
import { formatUnitsErc20 } from '../../utils'
import { Cosmos_Network } from '../../constants/networks'

type prop = {
  chainid: SupportedChainId
  tokenAddress?: string
  decimals?: number
}

const Balance: FC<prop> = ({ chainid, tokenAddress, decimals }) => {
  const ChainInfo = getChainInfo(chainid)
  const chainType = chainid as Cosmos_Network
  const cosmosBalance = useCosmosBalance(chainType)

  const balance = useMemo(() => {
    if (isCosmosChain(chainid)) {
      const list = cosmosBalance.balance?.filter(item => item.denom.toLowerCase() === tokenAddress?.toLowerCase())
      if (list && list.length > 0) {
        return list[0].amount
      }
      return
    }
    const list = cosmosBalance.balance?.filter(item => item)

    if (list && list.length > 0) {
      return list[0].amount
    }
    return '0'
  }, [cosmosBalance, chainid, tokenAddress])
  // console.info(cosmosBalance, balance, tokenAddress, decimals)
  if (ChainInfo == undefined) return <>**</>
  return (
    <div>
      <When condition={cosmosBalance.isLoading}>
        <Skeleton />
      </When>
      <When condition={!cosmosBalance.isLoading}>{decimals && formatUnitsErc20(balance, '', decimals)}</When>
    </div>
  )
}

export default Balance
