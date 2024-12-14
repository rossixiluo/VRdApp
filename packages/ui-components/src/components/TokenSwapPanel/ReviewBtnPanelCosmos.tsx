import React, { useCallback, useMemo } from 'react'
import { useAppStore } from '../../state'
import { useToasts } from 'react-toast-notifications'
import { BigNumber } from 'ethers'
import useCosmosBalance from '../../hooks/useCosmosBalance'
import useKeplr from '../../hooks/useKeplr'

import { USECHAIN_IDS, SupportedChainId, isCosmosChain } from '../../constants/chains'
import { Cosmos_Network } from '../../constants/networks'
import { cosmosFee } from '../../constants/relayer'

const ReviewBtnPanel = () => {
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))

  const { getActiveAccount } = useKeplr()
  const inputNumer = useAppStore(state => state.input)
  const fromToken = useAppStore(state => state.fromToken)
  const { addToast } = useToasts()
  const chainType = fromChainID as Cosmos_Network
  const cosmosBalance = useCosmosBalance(chainType)
  const setPreviewOpen = useAppStore(state => state.setOpenPreview)
  const error = useAppStore(state => state.error)

  const usdcnum = useMemo(() => {
    if (!cosmosBalance.balance) return
    if (fromChainID === SupportedChainId.OSMOSIS) {
      return cosmosBalance.balance.find(
        item => item.denom.toLowerCase() === 'ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4'.toLowerCase()
      )?.amount
    }
    if (fromChainID === SupportedChainId.EVMOS) {
      return cosmosBalance.balance.find(
        item => item.denom.toLowerCase() === 'ibc/35357FE55D81D88054E135529BB2AEB1BB20D207292775A19BD82D83F27BE9B4'.toLowerCase()
      )?.amount
    }
    if (fromChainID === SupportedChainId.SEI) {
      return cosmosBalance.balance.find(
        item => item.denom.toLowerCase() === 'ibc/CA6FBFAF399474A06263E10D0CE5AEBBE15189D6D4B2DD9ADE61007E68EB9DB0'.toLowerCase()
      )?.amount
    }
    if (fromChainID === SupportedChainId.COREUM) {
      return cosmosBalance.balance.find(
        item => item.denom.toLowerCase() === 'ibc/E1E3674A0E4E1EF9C69646F9AF8D9497173821826074622D831BAB73CCB99A2D'.toLowerCase()
      )?.amount
    }
    if (fromChainID === SupportedChainId.DYDX) {
      return cosmosBalance.balance.find(
        item => item.denom.toLowerCase() === 'ibc/8E27BA2D5493AF5636760E354E46004562C46AB7EC0CC4C1CA14E9E20E2545B5'.toLowerCase()
      )?.amount
    }

    if (fromChainID === SupportedChainId.NOBLE) {
      return cosmosBalance.balance.find(item => item.denom.toLowerCase() === 'uusdc')?.amount
    }
  }, [cosmosBalance, fromChainID])

  const num = BigNumber.from(inputNumer)
  const needFeeMemo = Number(usdcnum) - cosmosFee < Number(inputNumer) && !isCosmosChain(toChainID) && toChainID !== SupportedChainId.NOBLE

  const ValidateAmountFN = useCallback(async () => {
    const activeAccount = await getActiveAccount(fromChainID as string)
    if (!cosmosAddress) {
      addToast('Please connect your wallet', { appearance: 'error' })
      return false
    }
    if (cosmosAddress !== activeAccount?.address) {
      addToast('Please switch to your connected wallet: ' + cosmosAddress || '', { appearance: 'error' })
      return false
    }
    if (fromChainID == null || toChainID == null || USECHAIN_IDS.includes(fromChainID) == false || USECHAIN_IDS.includes(toChainID) == false) {
      addToast('Please check the network', { appearance: 'error' })
      return false
    }
    if (needFeeMemo) {
      addToast(`The routing amount + protocol fee(${cosmosFee / 10 ** 6} USDC) must be less than or equal to the available balance.`, { appearance: 'error' })
      return false
    }

    if (usdcnum == undefined) {
      addToast('Please check the balance', { appearance: 'error' })
      return false
    }

    if (num.gt(0) && num.lte(BigNumber.from(usdcnum ?? 0))) {
      setPreviewOpen(true)
      return true
    } else {
      addToast('Please check the values entered', { appearance: 'error' })
      return false
    }
  }, [num, addToast, fromChainID, toChainID, usdcnum, setPreviewOpen, needFeeMemo, cosmosAddress, getActiveAccount])

  const checkNum = useMemo(() => {
    if (needFeeMemo) {
      return true
    }
    return false
  }, [needFeeMemo])

  const Review = useMemo(() => {
    if (needFeeMemo) {
      return `The routing amount + protocol fee(${cosmosFee / 10 ** 6} USDC) must be less than or equal to the available balance.`
    }
    return 'Review'
  }, [needFeeMemo])

  return (
    <>
      <button
        onClick={() => {
          ValidateAmountFN()
        }}
        disabled={checkNum}
        className="px-6 py-3.5 text-white flex-1 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto text-center disabled:bg-slate-700"
      >
        {Review}
      </button>
    </>
  )
}

export default ReviewBtnPanel
