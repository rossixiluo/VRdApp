import { providers, utils } from 'ethers'
import { RPC_URLS } from '../constants/networks'
import { useAppStore } from '../state'
import { SupportedChainId, isCosmosChain } from '../constants/chains'
import { useMemo } from 'react'

// Cache to store provider instances
const providerCache: Record<string, providers.StaticJsonRpcProvider> = {}

export function useStaticJsonRpc(toChainID?: SupportedChainId | null) {
  const fromChainID = useAppStore(state => state.fromChainID)

  const Provider = useMemo(() => {
    const ID = toChainID || fromChainID

    if (ID == null || ID === SupportedChainId.SOLANA || isCosmosChain(ID)) {
      return
    }

    // Check if provider already exists in cache
    if (providerCache[ID]) {
      return providerCache[ID]
    }

    const rpc = RPC_URLS[ID][0]
    const prcPro = new providers.StaticJsonRpcProvider(rpc)

    // Store the new provider in the cache
    providerCache[ID] = prcPro

    return prcPro
  }, [toChainID, fromChainID])

  return Provider
}

export async function getInteractedTokenAddresses(address: string, fromChainID: SupportedChainId): Promise<string[]> {
  if (fromChainID === SupportedChainId.SOLANA || isCosmosChain(fromChainID)) {
    return []
  }

  // Use providerCache logic
  let provider: providers.StaticJsonRpcProvider
  if (providerCache[fromChainID]) {
    provider = providerCache[fromChainID]
  } else {
    const rpc = RPC_URLS[fromChainID][0]
    provider = new providers.StaticJsonRpcProvider(rpc)
    providerCache[fromChainID] = provider
  }

  // 添加网络检测
  try {
    await provider.ready
    const network = await provider.getNetwork()
    console.info(`Connected to network: ${network.name} ${fromChainID}`)
  } catch (error) {
    console.error('Failed to connect to the network:', error)
    throw new Error('Network connection failed')
  }

  const transferEventTopic = utils.id('Transfer(address,address,uint256)')

  const filter: providers.Filter = {
    topics: [transferEventTopic, [utils.hexZeroPad(address, 32)], null],
    fromBlock: 0,
    toBlock: 'latest'
  }

  // 添加重试逻辑
  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      const logs = await provider.getLogs(filter)
      const tokenAddresses = [...new Set(logs.map(log => log.address))]
      return tokenAddresses
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error)
      retries++
      if (retries >= maxRetries) {
        console.error('Max retries reached. Throwing error.')
        throw error
      }
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  throw new Error('Failed to fetch token addresses after multiple attempts')
}
