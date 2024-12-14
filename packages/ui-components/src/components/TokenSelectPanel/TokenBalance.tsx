import { FC } from 'react'
import { Else, If, Then } from 'react-if'

import Erc20Balance from '../balance/Erc20Balance'
import EthBalance from '../balance/EthBalance'
import SolanaBalance from '../balance/SolanaBalance'
import SPLBalance from '../balance/SPLBalance'
import { SupportedChainId, isCosmosChain } from '../../constants/chains'
import CosmosBalance from '../balance/CosmosBalance'

type prop = {
  tokenAddress: string
  decimals: number
  chainid: SupportedChainId
}

const TokenBalance: FC<prop> = ({ tokenAddress, decimals, chainid }) => {
  return (
    <div>
      <If condition={isCosmosChain(chainid)}>
        <Then>
          <CosmosBalance decimals={decimals} tokenAddress={tokenAddress} chainid={chainid}></CosmosBalance>
        </Then>
        <Else>
          <If condition={chainid === SupportedChainId.SOLANA}>
            <Then>
              <If condition={tokenAddress !== ''}>
                <Then>
                  <SPLBalance chainid={chainid} tokenAddress={tokenAddress} decimals={decimals}></SPLBalance>
                </Then>
                <Else>
                  <SolanaBalance chainid={chainid}></SolanaBalance>
                </Else>
              </If>
            </Then>
            <Else>
              <If condition={tokenAddress !== ''}>
                <Then>
                  <Erc20Balance tokenAddress={tokenAddress} decimals={decimals} chainid={chainid}></Erc20Balance>
                </Then>
                <Else>
                  <EthBalance chainid={chainid}></EthBalance>
                </Else>
              </If>
            </Else>
          </If>
        </Else>
      </If>
    </div>
  )
}

export default TokenBalance
