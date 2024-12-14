import { Else, If, Then } from 'react-if'

import usdclogo from '../../assets/icon/usdc.png'
import { useAppStore } from '../../state'

import EthBalance from './EthBalance'
import Erc20Balance from './Erc20Balance'

const Balance = () => {
  const fromToken = useAppStore(state => state.fromToken)
  const fromChainID = useAppStore(state => state.fromChainID)

  if (fromChainID == null) {
    return <></>
  }
  return (
    <div className=" flex   flex-row  text-gray-500 items-center justify-end">
      <div className=" flex flex-col mr-2 text-sm   text-gray-500">
        <div>Balance</div>
        <If condition={fromToken?.address == ''}>
          <Then>
            <EthBalance chainid={fromChainID}></EthBalance>
          </Then>
          <Else>
            <Erc20Balance chainid={fromChainID} tokenAddress={fromToken?.address} decimals={fromToken?.decimals}></Erc20Balance>
          </Else>
        </If>
      </div>

      <img className=" w-10 h-10" src={fromToken?.logoURI || usdclogo}></img>
    </div>
  )
}

export default Balance
