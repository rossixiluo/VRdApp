import { formatUnitsErc20 } from '../../utils'
import { When } from 'react-if'
import Skeleton from 'react-loading-skeleton'

import useSolanaBalance from '../../hooks/useSolanaBalance'
import { FC } from 'react'
import { getChainInfo } from '../../constants/chainInfo'
import { SupportedChainId } from '../../constants/chains'

type prop = {
  chainid: SupportedChainId
}

const Balance: FC<prop> = ({ chainid }) => {
  const ChainInfo = getChainInfo(chainid)
  const solanaBalance = useSolanaBalance()

  if (ChainInfo == undefined) return <>**</>

  return (
    <div>
      <When condition={solanaBalance.isloading}>
        <Skeleton />
      </When>
      <When condition={solanaBalance.isloading == false}>{formatUnitsErc20(solanaBalance.balance, '', ChainInfo.nativeCurrency.decimals)}</When>
    </div>
  )
}

export default Balance
