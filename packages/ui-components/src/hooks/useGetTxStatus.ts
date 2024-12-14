import useSWR from 'swr'

import { BaseUrl } from '../constants/relayer'

import api from '../api/fetch'

interface statusType {
  code: number
  data: {
    attest: string
    mint: string
    scan: string
  }
}

async function fetcher(txhash: string | undefined): Promise<statusType | undefined> {
  if (txhash == null || txhash == undefined) {
    return
  }

  const res: statusType = await api.get(BaseUrl + '?txhash=' + txhash)
  if (res) {
    return res
  } else {
    throw new Error('get Accounts info error ')
  }
}

export default function useTxStatus(txhash: string | undefined) {
  const { data, error, isLoading } = useSWR(txhash ? ['/smw/txhash', txhash] : null, () => fetcher(txhash), {
    refreshInterval: 1000 * 15
  })

  return {
    data: data,
    error,
    isLoading
  }
}
