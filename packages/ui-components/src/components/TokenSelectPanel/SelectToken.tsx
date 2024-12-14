import React, { FC, useEffect, useMemo } from 'react'
import { useAppStore } from '../../state'
import useDefaultToken from '../../hooks/useDefaultToken'

type proteType = {
  isFrom: boolean
}

const SelectToken: FC<proteType> = ({ isFrom }) => {
  const fromToken = useAppStore(state => state.fromToken)
  const toToken = useAppStore(state => state.toToken)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)
  const setToken = useAppStore(state => state.setToken)

  const currChainID = useMemo(() => {
    if (isFrom) return fromChainID
    else return toChainID
  }, [isFrom, fromChainID, toChainID])

  const DefaultToken = useDefaultToken(currChainID)

  useEffect(() => {
    if (fromToken == null && isFrom == true && DefaultToken !== undefined) {
      setToken(true, DefaultToken)
    }
    if (toToken == null && isFrom == false && DefaultToken !== undefined) {
      setToken(false, DefaultToken)
    }
  }, [fromToken, toToken, isFrom, setToken, DefaultToken])

  const TokenInfo = useMemo(() => {
    if (isFrom) {
      return fromToken || DefaultToken
    } else {
      return toToken || DefaultToken
    }
  }, [fromToken, toToken, isFrom, DefaultToken])

  return (
    <div className="skt-w skt-w-input skt-w-button flex w-auto flex-shrink-0 items-center justify-between bg-transparent p-0 hover:bg-transparent">
      <span className="flex items-center">
        <div className="relative flex h-fit w-fit">
          <div className="skt-w h-6 w-6 overflow-hidden rounded-full">
            <img src={TokenInfo?.logoURI} width="100%" height="100%" />
          </div>
        </div>
        <span className="skt-w text-valuerouter-primary -mb-0.5 ml-1 font-medium sm:text-lg">{TokenInfo?.symbol}</span>
      </span>
    </div>
  )
}

export default SelectToken
