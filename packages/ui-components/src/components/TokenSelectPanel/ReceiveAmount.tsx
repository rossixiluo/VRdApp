import { useAppStore } from '../../state'
import { formatUnitsErc20 } from '../../utils'
import useRelayCallSwapGasFee from '../../hooks/useRelayCallGasFee'
import { Else, If, Then } from 'react-if'
import Skeleton from 'react-loading-skeleton'

const ReceiveAmount = () => {
  const input = useAppStore(state => state.willReceiveToken)
  const toToken = useAppStore(state => state.toToken)
  const { gasFeeLoading } = useRelayCallSwapGasFee()
  const quoteLoading = useAppStore(state => state.quoteLoading)

  return (
    <div className="flex items-center justify-between px-3 py-[14px] sm:py-4">
      <div className="relative flex w-full items-center overflow-hidden">
        <If condition={gasFeeLoading || quoteLoading}>
          <Then>
            <Skeleton width={100} height={20}></Skeleton>
          </Then>
          <Else>
            <input
              type="number"
              className="skt-w skt-w-input text-valuerouter-primary w-full min-w-full max-w-[180px] bg-transparent pt-0.5 text-lg font-bold focus:max-w-none focus-visible:outline-none sm:max-w-full sm:text-xl"
              placeholder={toToken == null ? '0.0' : formatUnitsErc20(input, toToken?.symbol, toToken?.decimals)}
              spellCheck="false"
              readOnly
            />
          </Else>
        </If>
        <div className="invisible absolute w-fit text-xl font-bold" />
      </div>
    </div>
  )
}

export default ReceiveAmount
