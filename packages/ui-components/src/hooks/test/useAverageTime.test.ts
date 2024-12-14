import { describe, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import useAverageTime from '../useAverageTime'

vi.mock('@web3-react/core', () => {
  return {
    useWeb3React: () => {
      return {
        chainId: 1
      }
    }
  }
})

describe('useAverageTime', () => {
  it('useAverageTime with chainId_ is 1', async () => {
    const { result } = renderHook(() => useAverageTime(1))
    const time = await result.current

    expect(time).toEqual('13 minutes')
  })

  it('useAverageTime with web3 chainId_ is 1 chainId_ is null', async () => {
    const { result } = renderHook(() => useAverageTime(null))
    const time = await result.current

    expect(time).toEqual('13 minutes')
  })
  it('useAverageTime with web3 chainId_ is 1 chainId_ is undefined', async () => {
    const { result } = renderHook(() => useAverageTime())
    const time = await result.current

    expect(time).toEqual('13 minutes')
  })
})
