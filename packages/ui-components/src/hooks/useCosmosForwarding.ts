import useSWR from 'swr'
import api from '../api/fetch'

interface ForwardingAddressResponse {
  address: string
  exists: boolean
}

async function fetcher(channel: string, osmoAddress: string): Promise<string | undefined> {
  const url = `https://noble-api.polkachu.com/noble/forwarding/v1/address/${channel}/${osmoAddress}/`
  const res: ForwardingAddressResponse = await api.get(url)
  if (res) {
    //  && res.exists
    return res.address
  } else {
    throw new Error('Failed to get forwarding address')
  }
}

export function useGetForwardingAddress(channel?: string, osmoAddress?: string) {
  const { data, error, isLoading } = useSWR(channel && osmoAddress ? ['/forwarding-address', channel, osmoAddress] : null, () =>
    channel && osmoAddress ? fetcher(channel, osmoAddress) : null
  )

  return {
    address: data,
    error,
    isLoading
  }
}
