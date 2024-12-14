import { rest } from 'msw'
import { setupServer } from 'msw/node'
import quto_Avalanche_aave from '../../fixtures/Arb_To_Ava/quto_Avalanche_aave_buy.json'
import quote_Arbitrum_eth from '../../fixtures/Arb_To_Ava/quote_Arbitrum_eth_sell.json'

import { describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

import { AppStoreProvider, intialState } from '../../state'
import React, { FC } from 'react'
import tokenList from '../../fixtures/tokenList.json'
import { Token } from '../../types/token'
import { NativeCoinAddress } from '../../constants/usdc'
// import { NativeCoinAddress, USDC_IDS_TO_ADDR } from '../../constants/usdc'
import { SWRConfig } from 'swr'
import useSwapBuildParameter from '../useSwapBuildParameter'
import { ethers } from 'ethers'
import { BaseQuote } from '../../constants/relayer'

const ethToken: Token = {
  address: '',
  chainId: 42161,
  name: 'ETH',
  symbol: 'eth',
  decimals: 18,
  logoURI: ''
}
const AAVEToken = tokenList.tokens.find(item => item.symbol == 'AAVE' && item.chainId == 43114)

//https://github.com/vercel/swr/discussions/1826
// 2. Describe network behavior with request handlers.
const server = setupServer(
  rest.get(BaseQuote, (req, res, ctx) => {
    //buyToken=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&sellToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&sellAmount=1000000000000000&chainid=42161

    const sellToken = req.url.searchParams.get('sellToken')

    if (sellToken == '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      return res(ctx.json(quote_Arbitrum_eth))
    } else {
      return res(ctx.json(quto_Avalanche_aave))
    }
  }),
  rest.post('https://arb1.arbitrum.io/rpc', async (req, res, ctx) => {
    // const data = await req.json()

    return res(ctx.json({}))
  }),
  rest.post('https://avalanche-mainnet.infura.io/v3/f784c0c448844cce856d62a06f66a52d', async (req, res, ctx) => {
    const data = await req.json()

    if (data.method == 'eth_chainId') {
      return res(ctx.json({ jsonrpc: '2.0', id: 42, result: '0xa86a' }))
    }
    if (data.method == 'eth_call' && data.params[0].to !== undefined && data.params[0].data !== undefined) {
      return res(
        ctx.json({
          jsonrpc: '2.0',
          id: 43,
          result: '0x0000000000000000000000000000000000000000000000000000000000000001'
        })
      )
    }
    return res(ctx.json({}))
  })
)

// 3. Start request interception by starting the Service Worker.
// Enable request interception.
beforeAll(() => server.listen())

vi.mock('@web3-react/core', () => {
  return {
    useWeb3React: () => {
      return {
        chainId: 42161,
        account: '0x12CF5132064Ee45AcD4843E8C9D7Ae5e3852Aaab'
      }
    }
  }
})

const wrapperEthToAaave: FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = Object.assign(intialState, {
    fromChainID: 42161,
    toChainID: 43114,
    fromToken: ethToken,
    toToken: AAVEToken,
    input: '1000000000000000'
  })
  const provider = () => new Map()
  const config = {
    provider,
    refreshInterval: 0
  }
  return (
    <AppStoreProvider data={data}>
      <SWRConfig value={config}>{children}</SWRConfig>
    </AppStoreProvider>
  )
}

//1 跨链 两侧都swap  两侧代币都不是usdc
//2 跨链   一侧 swap 一侧代币是usdc  例如目标侧或者来源侧
//3 不跨链  swap

describe('useQuote on Arbitrum Both sides call swap', () => {
  it('swap  from  Arbitrum eth   to Avalanche aave', async () => {
    const { result } = renderHook(() => useSwapBuildParameter(), { wrapper: wrapperEthToAaave })
    await waitFor(async () => expect(result.current.quoteDataSell.isloading).toBe(true))
    await waitFor(async () => expect(result.current.quoteDataSell.isloading).toBe(false))
    //1 验证交易类型，是跨链的

    await waitFor(async () => {
      expect(result.current.sellArgs).not.toBe(null)
      expect(result.current.sellArgs?.sellToken?.toLowerCase()).toBe(NativeCoinAddress.toLowerCase())
      expect(result.current.sellArgs?.sellcalldata).not.toBe(undefined)
      expect(result.current.sellArgs?.sellcallgas).not.toBe(undefined)
      expect(result.current.isFromNeedSwap).toBe(true)
      expect(result.current.isToNeedSwap).toBe(true)

      expect(result.current.buyArgs).not.toBe(null)
      expect(AAVEToken?.address).not.toBe(undefined)
      if (AAVEToken?.address !== undefined) {
        expect(result.current.buyArgs?.buyToken).toBe(ethers.utils.hexZeroPad(AAVEToken?.address, 32))
      }

      // expect(result.current.buyArgs?.buycalldata).not.toBe(undefined)
      // expect(result.current.buyArgs?.buycallgas).not.toBe(undefined)

      // 1 gas in buyArs and SellArgs is greate than quto
      if (result.current.sellArgs && result.current.quoteDataSell.data && result.current.buyArgs && result.current.quoteDataBuy.data) {
        expect(BigInt(result.current.sellArgs?.sellcallgas)).toBeGreaterThan(BigInt(result.current.quoteDataSell.data?.gas))
        // expect(BigInt(result.current.buyArgs?.buycallgas)).toBeGreaterThan(BigInt(result.current.quoteDataBuy.data?.gas))
        // Fees and Slippage
        const From_grossBuyAmount = result.current.quoteDataSell.data?.grossBuyAmount
        const To_sellAmount = result.current.quoteDataBuy.data?.sellAmount
        // 千分之的手续费
        // 每条网络的手续费可能不一样

        expect(BigInt(From_grossBuyAmount) - BigInt(To_sellAmount)).toBeGreaterThan(BigInt(From_grossBuyAmount) / BigInt(1000))
      } else {
        expect(true).toBe(false)
      }
      expect(result.current.sellArgs?.sellcalldata).toBe(result.current.quoteDataSell.data?.data)
      // expect(result.current.buyArgs?.buycalldata).toBe(result.current.quoteDataBuy.data?.data)
    })
  })
})
