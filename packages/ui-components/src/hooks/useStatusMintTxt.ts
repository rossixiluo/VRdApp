import { useMemo } from 'react'
import { SupportedChainId } from '../constants/chains'
import useTxStatus from './useTxStatus'
import { useToHashStatus } from './useTxStatus'
import { useAppStore } from '../state'

export function useStatusMintTxt(txhash: string | null, isLocalSwap: boolean, fromChainID: SupportedChainId | null, toChainID: SupportedChainId | null, isSuccess: boolean) {
  const noticeInfoModal = useAppStore(state => state.noticeInfoModal)
  const isPreviewOpen = useAppStore(state => state.isOpenPreview)
  const fetchStart = (noticeInfoModal || isPreviewOpen) && !isSuccess
  const status:any = useTxStatus(txhash, isLocalSwap, fromChainID, toChainID, fetchStart)
  const toTxHash: any = useToHashStatus(txhash, fetchStart)

  const statusMint = useMemo(() => {
    const statusText = {
      text: 'Waiting for send',
      step: -1,
      isLoading: status.isLoading,
      isLoadingLocaL: status.isLoadingLocaL,
      toTxhash: toTxHash.data?.data?.BridgeAndSwapInfo?.Memo?.TxHash || toTxHash.data?.data?.DestSwapInfo?.TxHash || status.data?.data?.to?.tx_hash,
      serveStatus: {
        attest: status.data?.data?.attest,
        mint: status.data?.data?.mint,
        scan: status.data?.data?.scan,
        swap: status.data?.data?.swap
      },
      bridgeError: toTxHash.data?.data?.BridgeError
    }

    if (txhash !== null) {
      statusText.text = 'Waiting for scan'
      statusText.step = 0
    }

    if (status.isLocalSwap == false && status.data && status.data.data) {
      if (status.data.data.scan == 'done') {
        statusText.text = 'Waiting for attest'
        statusText.step = 1
      }
      if (status.data.data.attest == 'done') {
        statusText.text = 'Waiting for mint'
        statusText.step = 2
      }

      if (status.data.data.mint == 'done' && (toTxHash.data?.data?.BridgeAndSwapInfo?.Memo?.TxHash || toTxHash.data?.data?.DestSwapInfo?.TxHash || status?.data?.data?.to?.tx_hash)) {
        statusText.text = 'Success'
        statusText.step = 3
      }
      if (status.data.data.mint == 'fail' || status.data.data.attest == 'fail' || status.data.data.scan == 'fail' || status.data.data.swap == 'fail') {
        if (statusText.bridgeError) {
          statusText.text = statusText.bridgeError
        } else {
          statusText.text = 'Fail'
        }

        statusText.step = 4
      }

      if (
        status.data.data.mint == 'half-fail' ||
        status.data.data.attest == 'half-fail' ||
        status.data.data.scan == 'half-fail' ||
        status.data.data.swap == 'half-fail'
      ) {
        statusText.text = `The target token amount is below the minimum received. USDC is sent to the user's address`

        statusText.step = 4
      }
    } else {
      if (status.dataLocal !== undefined) {
        if (status.dataLocal == 1) {
          statusText.text = 'Success'
          statusText.step = 3
        } else {
          statusText.text = 'Fail'
          statusText.step = 4
        }
      }
    }
    return statusText
  }, [status, txhash, toTxHash])
  return statusMint
}
