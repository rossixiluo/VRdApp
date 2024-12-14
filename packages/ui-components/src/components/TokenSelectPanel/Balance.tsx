import React, { FC } from 'react'
import EthBalance from '../balance/EthBalance'
import Erc20Balance from '../balance/Erc20Balance'
import SolanaBalance from '../balance/SolanaBalance'
import SLPBalance from '../balance/SPLBalance'
import { If, Then, Else } from 'react-if'
import { useAppStore } from '../../state'
import { SupportedChainId, isCosmosChain } from '../../constants/chains'
import CosmosBalance from '../balance/CosmosBalance'

//SupportedChainId.

type proteType = {
  isFrom: boolean
}
const Balance: FC<proteType> = ({ isFrom }) => {
  const fromToken = useAppStore(state => state.fromToken)
  const fromChainID = useAppStore(state => state.fromChainID)

  if (!isFrom || fromChainID == undefined) {
    return <></>
  }
  return (
    <div className="font-medium text-valuerouter-primary">
      <div className="text-right">Balance</div>
      <div className="text-center">
        <If condition={isCosmosChain(fromChainID)}>
          <Then>
            <CosmosBalance decimals={fromToken?.decimals} tokenAddress={fromToken?.address} chainid={fromChainID}></CosmosBalance>
          </Then>
          <Else>
            <If condition={fromToken?.address == ''}>
              <Then>
                <If condition={fromChainID === SupportedChainId.SOLANA}>
                  <Then>
                    <SolanaBalance chainid={fromChainID}></SolanaBalance>
                  </Then>
                  <Else>
                    <EthBalance chainid={fromChainID}></EthBalance>
                  </Else>
                </If>
              </Then>
              <Else>
                <If condition={fromChainID === SupportedChainId.SOLANA}>
                  <Then>
                    <SLPBalance chainid={fromChainID} tokenAddress={fromToken?.address} decimals={fromToken?.decimals}></SLPBalance>
                  </Then>
                  <Else>
                    <Erc20Balance tokenAddress={fromToken?.address} decimals={fromToken?.decimals} chainid={fromChainID}></Erc20Balance>
                  </Else>
                </If>
              </Else>
            </If>
          </Else>
        </If>
      </div>
    </div>
  )
}

export default Balance
