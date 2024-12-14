import { rest } from 'msw'
import { setupServer } from 'msw/node'

import quote_Arbitrum_eth_to_aave from '../../fixtures/Arb_To_Ava/quote_Arbitrum_eth_to_aave.json'

import { describe, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import useQuote from '../useQuote'
import { AppStoreProvider, intialState } from '../../state'
import React, { FC } from 'react'

import { Token } from '../../types/token'

import { SWRConfig } from 'swr'
import { BaseQuote } from '../../constants/relayer'

const ethToken: Token = {
  address: '',
  chainId: 42161,
  name: 'ETH',
  symbol: 'eth',
  decimals: 18,
  logoURI: ''
}

//https://github.com/vercel/swr/discussions/1826
// 2. Describe network behavior with request handlers.
const server = setupServer(
  rest.get(BaseQuote, (req, res, ctx) => {
    //buyToken=0xaf88d065e77c8cC2239327C5EDb3A432268e5831&sellToken=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE&sellAmount=1000000000000000&chainid=42161
    const sellToken = req.url.searchParams.get('sellToken')

    if (sellToken == '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE') {
      return res(ctx.json(quote_Arbitrum_eth_to_aave))
    }
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

const wrapper: FC<{ children: React.ReactNode }> = ({ children }) => {
  const data = Object.assign(intialState, {
    fromChainID: 42161,
    toChainID: 42161,
    fromToken: ethToken,
    toToken: ethToken,
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

describe('useQuote on Arbitrum', () => {
  it('swap Quote on Arbitrum  from eth to aave', async () => {
    const { result } = renderHook(() => useQuote(true, true), { wrapper })

    await waitFor(async () => {
      const swrData = await result.current
      expect(swrData.isloading).toBe(false)
    })
    await waitFor(async () => {
      const swrData = await result.current

      expect(swrData.data).toEqual(undefined)

      // expect(swrData.data?.sellTokenAddress.toLowerCase()).toEqual(NativeCoinAddress.toLowerCase())

      // expect(swrData.data?.buyTokenAddress.toLowerCase()).toEqual(AAVEToken?.address.toLowerCase())
    })
  })
})

describe('useQuote on Arbitrum', () => {
  it('swap Quote on Arbitrum  from eth to aave other side', async () => {
    const { result } = renderHook(() => useQuote(false, false), { wrapper })

    await waitFor(async () => {
      const swrData = await result.current
      expect(swrData.isloading).toBe(false)
    })
    await waitFor(async () => {
      const swrData = await result.current

      expect(swrData.data).toEqual(undefined)

      // expect(swrData.data?.sellTokenAddress.toLowerCase()).toEqual(NativeCoinAddress.toLowerCase())

      // expect(swrData.data?.buyTokenAddress.toLowerCase()).toEqual(AAVEToken?.address.toLowerCase())
    })
  })
})
