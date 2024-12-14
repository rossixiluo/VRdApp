import { useWeb3React } from '@web3-react/core'

import { useAsyncFn } from 'react-use'

import useRelayerAddress from './useRelayer'

import { useAppStore } from '../state'
import { useToasts } from 'react-toast-notifications'

import useRelayCallGasFee from './useRelayCallGasFee'

export default function useRelayCall() {
  const { library, account, chainId } = useWeb3React()

  const contractAddress = useRelayerAddress()
  const fromChainID = useAppStore(state => state.fromChainID)
  const inputAmount = useAppStore(state => state.input)
  const toChainID = useAppStore(state => state.toChainID)
  const addToHistory = useAppStore(state => state.addToHistory)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const willReceiveToken = useAppStore(state => state.willReceiveToken)

  const { addToast } = useToasts()

  const RelayerFee = useAppStore(state => state.fee)

  const { sendTx } = useRelayCallGasFee()

  const [swapState, doSwapFetch] = useAsyncFn(async () => {
    if (
      account &&
      contractAddress &&
      library != undefined &&
      fromChainID !== null &&
      fromChainID == chainId &&
      toChainID != null &&
      fromToken !== null &&
      toToken !== null
    ) {
      try {
        const result = await sendTx()
        if (result) {
          addToHistory({
            fromChainID: fromChainID,
            toChainID: toChainID,
            input: inputAmount,
            fee: RelayerFee,
            txhash: result.hash,
            creattime: Date.now(),
            user: account,
            fromToken,
            toToken,
            output: willReceiveToken
          })
          addToast('Transactions have been sent', { appearance: 'success', autoDismissTimeout: 1000 * 10 })
        }

        // const txinfo = await result.wait([1])
        // console.log(txinfo)
        return result
        //eslint-disable-next-line  @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.info(error)
        let msg
        if (error.data) {
          msg = error.data.message
        }
        if (error.reason) {
          msg = error.reason
        } else {
          msg = error.message
        }

        addToast(msg, { appearance: 'error', autoDismissTimeout: 1000 * 5 })
      }
    }
  }, [
    account,
    library,
    contractAddress,
    chainId,
    fromChainID,
    RelayerFee,
    toChainID,
    addToHistory,
    addToast,
    inputAmount,
    sendTx,
    fromToken,
    toToken,
    willReceiveToken
  ])

  return {
    swapState,
    doSwapFetch
  }
}
