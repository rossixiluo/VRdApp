import { ProtectedConnectWallet } from '../Guard/ProtectedConnectWallet'
import ProtectedApprove from '../Guard/ProtectedApprove'
import ProtecteNetwork from '../Guard/ProtecteNetwork'
import ReviewBtnPanel from './ReviewBtnPanel'
import ProtectedError from '../Guard/ProtectedError'

import ReviewBtnPanelCosmos from './ReviewBtnPanelCosmos'
import { Else, If, Then } from 'react-if'
import { useAppStore } from '../../state'
import { isCosmosChain } from '../../constants/chains'

const SwapBtn = () => {
  const fromChainID = useAppStore(state => state.fromChainID)
  return (
    <div className="  flex">
      <ProtectedConnectWallet>
        {/* <ProtectedError> */}
        <ProtecteNetwork>
          <ProtectedApprove>
            <If condition={isCosmosChain(fromChainID)}>
              <Then>
                <ReviewBtnPanelCosmos></ReviewBtnPanelCosmos>
              </Then>
              <Else>
                <ReviewBtnPanel></ReviewBtnPanel>
              </Else>
            </If>
          </ProtectedApprove>
        </ProtecteNetwork>
        {/* </ProtectedError> */}
      </ProtectedConnectWallet>
    </div>
  )
}

export default SwapBtn
