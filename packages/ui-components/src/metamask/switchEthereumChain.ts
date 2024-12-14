import { getChainInfo } from '../constants/chainInfo'
import { SupportedChainId } from '../constants/chains'
import { FALLBACK_URLS } from '../constants/networks'
//getChainInfo
//eslint-disable-next-line  @typescript-eslint/no-explicit-any
export default async function (chainId: SupportedChainId, chainName: string, rpcUrls: Array<string>, library: any, Unsupported: boolean) {
  let libraryprovider
  if (library !== undefined) {
    libraryprovider = library.provider
  } else {
    libraryprovider = window.ethereum
  }

  const nativeCurrency = getChainInfo(chainId)?.nativeCurrency
  const explorer = getChainInfo(chainId)?.explorer
  const rpclist = FALLBACK_URLS[chainId as SupportedChainId]
  const hexchainId = '0x' + chainId.toString(16)

  try {
    if (libraryprovider.request) {
      await libraryprovider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: hexchainId }]
      })
    }
    //eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (switchError: any) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        if (libraryprovider.request) {
          await libraryprovider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: hexchainId,
                chainName: chainName,
                rpcUrls: rpclist /* ... */,
                nativeCurrency: nativeCurrency,
                blockExplorerUrls: [explorer]
              }
            ]
          })
        }
      } catch (addError) {
        // handle "add" error
      }
    } else {
      console.error(switchError)
      // alert((switchError as Error).message)
    }
    // handle other "switch" errors
  }
}

/**
 *   let account
    try {
      account = await (window.ethereum.send as Send)('eth_requestAccounts').then(
        sendReturn => parseSendReturn(sendReturn)[0]
      )
    } catch (error) {
      if ((error as any).code === 4001) {
        throw new UserRejectedRequestError()
      }
      warning(false, 'eth_requestAccounts was unsuccessful, falling back to enable')
    }

    // if unsuccessful, try enable
    if (!account) {
      // if enable is successful but doesn't return accounts, fall back to getAccount (not happy i have to do this...)
      account = await window.ethereum.enable().then(sendReturn => sendReturn && parseSendReturn(sendReturn)[0])
    }
*/
