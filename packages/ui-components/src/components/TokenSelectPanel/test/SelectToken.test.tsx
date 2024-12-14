import { render, screen } from '@testing-library/react'

import { AppStoreProvider, intialState } from '../../../state/index'
// import { act } from '@testing-library/react'
import SelectToken from '../SelectToken'
import tokenList from '../../../fixtures/tokenList.json'
import { Token } from '../../../types/token'

const USDCToken = tokenList.tokens.find(item => item.symbol == 'USDC' && item.chainId == 1)
const WETHToken = tokenList.tokens.find(item => item.symbol == 'WETH' && item.chainId == 1)

describe('SelectToken is isFrom true', () => {
  test('usdc should render successfully', async () => {
    const storeData = Object.assign(intialState, {
      fromToken: USDCToken as Token,
      toToken: WETHToken as Token,
      fromChainID: 1,
      toChainID: 1
    })
    render(
      <AppStoreProvider data={storeData}>
        <SelectToken isFrom={true} />
      </AppStoreProvider>
    )

    expect(await screen.findByText(/^USDC$/)).toBeInTheDocument()
    // expect(await screen.findByRole('button', { name: /one up/i })).toBeInTheDocument()
  })
})

describe('SelectToken is isFrom false', () => {
  test('WETH should render successfully', async () => {
    const storeData = Object.assign(intialState, {
      fromToken: USDCToken as Token,
      toToken: WETHToken as Token,
      fromChainID: 1,
      toChainID: 1
    })
    render(
      <AppStoreProvider data={storeData}>
        <SelectToken isFrom={false} />
      </AppStoreProvider>
    )

    expect(await screen.findByText(/^WETH$/)).toBeInTheDocument()
    // expect(await screen.findByRole('button', { name: /one up/i })).toBeInTheDocument()
  })
})
