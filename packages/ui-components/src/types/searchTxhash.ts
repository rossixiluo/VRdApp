export interface SearchTxhash {
  code: number
  data: Data
}

export interface Data {
  status?: string
  from?: From
  to?: To
  steps: string[]
  scan: string
  mint: string
  attest: string
  swap: string
}

export interface From {
  txhash: string
  chainid: string
  tokenaddress: string
  useraddress: string
  tokeninfo: Tokeninfo
}

export interface Tokeninfo {
  name: string
  symbol: string
  decimal: number
}

export interface To {
  tx_hash: string
  chainid: string
  tokenaddress: string
  recipient: string
  tokeninfo: Tokeninfo2
}

export interface Tokeninfo2 {
  name: string
  symbol: string
  decimal: number
}
