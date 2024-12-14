import { render, screen, fireEvent } from '@testing-library/react'

// import { vi } from 'vitest'
import { Counter } from './counter'
import { AppStoreProvider } from '../../state/index'
// import { act } from '@testing-library/react'

// vi.mock('../../state', () => {
//   return {
//     useAppStore: () => {
//       return (email: string, password: string, address: string, mnemonic: string) => {
//         console.info(email)
//       }
//     }
//   }
// })
// afterEach(() => {
//   act(() => {
//     storeResetFns.forEach(resetFn => {
//       resetFn()
//     })
//   })
// })

describe('Counter', () => {
  test('should render successfully', async () => {
    render(
      <AppStoreProvider>
        <Counter />
      </AppStoreProvider>
    )

    expect(await screen.findByText(/^0$/)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /one up/i })).toBeInTheDocument()
  })

  test('should increase count by clicking a button', async () => {
    // const user = userEvent.setup()

    render(
      <AppStoreProvider>
        <Counter />
      </AppStoreProvider>
    )

    expect(await screen.findByText(/^0$/)).toBeInTheDocument()

    await fireEvent.click(await screen.findByRole('button', { name: /one up/ }))

    expect(await screen.findByText(/^1$/)).toBeInTheDocument()
  })
})
