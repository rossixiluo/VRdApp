export interface Quote {
  chainId: number
  price: string
  guaranteedPrice: string
  estimatedPriceImpact: string
  to: string
  data: string
  value: string
  gas: string
  estimatedGas: string
  gasPrice: string
  protocolFee: string
  minimumProtocolFee: string
  buyTokenAddress: string
  sellTokenAddress: string
  buyAmount: string
  sellAmount: string
  sources: Source[]
  orders: Order[]
  allowanceTarget: string
  decodedUniqueId: string
  sellTokenToEthRate: string
  buyTokenToEthRate: string
  fees: Fees
  grossPrice: string
  grossBuyAmount: string
  grossSellAmount: string
  expectedSlippage: string

  code?: number
  reason?: string
  validationErrors?: ValidationError[]
}

export interface Source {
  name: string
  proportion: string
}

export interface Order {
  type: number
  source: string
  makerToken: string
  takerToken: string
  makerAmount: string
  takerAmount: string
  fillData: FillData
  fill: Fill
}

export interface FillData {
  tokenAddressPath: string[]
  router: string
}

export interface Fill {
  input: string
  output: string
  adjustedOutput: string
  gas: number
}

export interface Fees {
  //eslint-disable-next-line  @typescript-eslint/no-explicit-any
  zeroExFee: any
}

export interface ValidationError {
  field: string
  code: number
  reason: string
  description: string
}
