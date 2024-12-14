import { BigNumber, Contract, providers } from 'ethers'
import { nobleFee, solanaFee, cosmosFee } from '../constants/relayer'
import { useAppStore } from '../state'
import useRelayerAddress from './useRelayer'
import UsdcRelayerABI from '../constants/ABI/UsdcRelayer.json'
import { Circle_Chainid } from '../constants/relayer'
import { RPC_URLS } from '../constants/networks'
import useSWR from 'swr'
import { useEffect, useMemo } from 'react'
import useUSDCAddress from './useUsdc'
import { SupportedChainId, isCosmosChain } from '../constants/chains'

export default function useRelayerFee() {
  const toChainID = useAppStore(state => state.toChainID)
  const fromChainID = useAppStore(state => state.fromChainID)

  const contractAddress = useRelayerAddress()
  const setFee = useAppStore(state => state.setFee)
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const usdcFrom = useUSDCAddress(fromChainID)
  const usdcTo = useUSDCAddress(toChainID)

  const isSeemToken = useMemo(() => {
    if (fromToken && toToken) {
      if (fromToken.symbol === toToken.symbol) {
        return true
      }
    }
    return false
  }, [fromToken, toToken])

  const isToNeedSwap = useMemo(() => {
    if (toChainID === 'noble-1') {
      if (fromToken?.address.toLocaleLowerCase() != usdcFrom?.toLowerCase()) {
        return true
      } else {
        return false
      }
    }

    if (toToken?.address.toLowerCase() != usdcTo?.toLowerCase() && fromChainID !== toChainID) {
      return true
    } else {
      return false
    }
  }, [fromToken, toToken, usdcTo, usdcFrom, fromChainID, toChainID])

  const { data, error, isLoading } = useSWR([contractAddress, toChainID, fromChainID, 'useRelayerFee'], async ([contractAddress, toChainID, fromChainID]) => {
    // setValue('0')
    // setFee('0')
    // console.log('= =')
    if (fromChainID == null || fromChainID === SupportedChainId.SOLANA || isCosmosChain(fromChainID)) {
      return
    }
    if (contractAddress && toChainID !== null && fromChainID !== null && toChainID !== fromChainID) {
      const rpc = RPC_URLS[fromChainID][0]
      const prcPro = new providers.StaticJsonRpcProvider(rpc)

      const CircleID = Circle_Chainid[toChainID]
      const contract = new Contract(contractAddress, UsdcRelayerABI, prcPro)

      const result: BigNumber[] = await contract.fee(CircleID)

      return result
    }
  })

  const numFee = useMemo(() => {
    if (data == undefined) return
    if (fromChainID === 'grand-1' || fromChainID === 'noble-1') return
    let result
    // 从relayer获取fee， 0 bridgefee, 1 swapfee
    if (isToNeedSwap && data[1]) {
      result = BigNumber.from(data[1]).toString()
    } else {
      result = BigNumber.from(data[0]).toString()
    }
    return result
  }, [data, isToNeedSwap, fromChainID])

  useEffect(() => {
    if (numFee) {
      setFee(numFee)
    }
  }, [numFee, setFee])

  // todo: remove this when grand-1 is ready
  useEffect(() => {
    // 为noble链单独设置fee
    if (fromChainID === 'grand-1' || fromChainID === 'noble-1') {
      if (toChainID) {
        const nFee = nobleFee[toChainID]
        if (nFee.length > 1) {
          if (toToken && toToken.decimals === 6 && toToken.symbol.indexOf('USDC') > -1) {
            setFee(nFee[0].toString())
          } else {
            setFee(nFee[1].toString())
          }
        }
      }
    }
    // cosmos 到各个链的手续费，单位是USDC
    if (isCosmosChain(fromChainID) && fromChainID !== SupportedChainId.NOBLE) {
      setFee(cosmosFee.toString())
    }
    if (isCosmosChain(fromChainID) && isCosmosChain(toChainID)) {
      setFee('0')
    }
    if (fromChainID === 'solana' && toChainID !== 'solana') {
      if (toChainID) {
        const sFee = solanaFee[toChainID as keyof typeof solanaFee]
        if (isSeemToken) {
          setFee(sFee[0].toString())
        } else {
          setFee(sFee[1].toString())
        }
      }
    }
  }, [toChainID, setFee, fromChainID, toToken, isSeemToken])

  // useEffect(() => {
  //   const run = async () => {
  //     console.log('useRelayerFee')
  //     setValue('0')
  //     setFee('0')
  //     if ( contractAddress && library != undefined&&toChainID!==null&&fromChainID!==null&&toChainID!==fromChainID) {

  //       const rpc= RPC_URLS[fromChainID][0]
  //       const prcPro= new providers.JsonRpcProvider(rpc)

  //       const CircleID = Circle_Chainid[toChainID]
  //       const contract = new Contract(contractAddress, UsdcRelayerABI, prcPro)

  //       const result: BigNumber = await contract.feeByDestinationDomain(CircleID)
  //       if(result.eq(0)){
  //         setValue(ethers.utils.parseEther('0.0001').toString())
  //         setFee(ethers.utils.parseEther('0.0001').toString())
  //       }else{

  //         setValue(result.toString())
  //         setFee(result.toString())
  //       }

  //     }
  //     setIsloading(false)
  //   }

  //   setIsloading(true)
  //   run()

  // }, [library, contractAddress,chainId,toChainID,setFee,fromChainID,setIsloading])

  return {
    fee: numFee,
    isloading: isLoading,
    error
  }
}
