import { Switch } from '@headlessui/react'
import TokenSelectPanel from '../TokenSelectPanel/Index'
import TokenSwichPanel from '../TokenSwichPanel'
import SwapBtn from './SwapBtn'
import TokenSwapRecipient from '../TokenSwapRecipient/Index'
import PreviewModal from '../preview'
import SolToWsolModal from '../preview/solToWsol'
import SolCreateUsdcModal from '../preview/solCreateUsdc'
import { useAppStore } from '../../state'
import React, { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Popover } from '@headlessui/react'
import { When } from 'react-if'
import { SupportedChainId } from '../../constants/chains'

function MyPopover() {
  const jupiterSlippage = useAppStore(state => state.jupiterSlippage)
  const setJupiterSlippage = useAppStore(state => state.setJupiterSlippage)

  const handleInputChange = (e: { currentTarget: { value: string } }) => {
    const value = e.currentTarget.value

    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0 && Number(value) <= 100)) {
      setJupiterSlippage(value)
    }
  }

  const commonClasses = 'flex items-center justify-center rounded-lg text-sm px-4 py-2 focus:outline-none'
  const commonInputClasses =
    'min-w-[50px] bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 outline-none'

  return (
    <Popover className="relative bg-white">
      <Popover.Button className={`${commonClasses} text-[#7d7d7d]  hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 `}>slippage</Popover.Button>

      <Popover.Panel className="absolute z-10 mt-4 max-w-sm transform -translate-x-1/2 left-1/3 px-4 sm:px-0 lg:max-w-3xl bg-white">
        <div className="flex gap-3 items-center overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4">
          <span className="text-[#7d7d7d]">Max</span>
          <input onChange={handleInputChange} value={jupiterSlippage} type="text" className={`${commonInputClasses} `} />
        </div>
      </Popover.Panel>
    </Popover>
  )
}
function BundleFee() {
  const bundleFee = useAppStore(state => state.bundleFee)
  const setBundleFee = useAppStore(state => state.setBundleFee)
  const autoBundleFee = useAppStore(state => state.autoBundleFee)
  const setAutoBundleFee = useAppStore(state => state.setAutoBundleFee)
  const useJitoBundle = useAppStore(state => state.useJitoBundle)
  const setUseJitoBundle = useAppStore(state => state.setUseJitoBundle)

  const handleInputChange = (e: { currentTarget: { value: string } }) => {
    const value = e.currentTarget.value

    if (value === '' || (/^\d+$/.test(value) && Number(value) >= 0)) {
      setBundleFee(value)
    }
  }

  const commonClasses = 'flex items-center justify-center rounded-lg text-sm px-4 py-2 focus:outline-none'
  const commonInputClasses =
    'min-w-[50px] bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5 outline-none'

  return (
    <Popover className="relative bg-white">
      <Popover.Button className={`${commonClasses} text-[#7d7d7d]  hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 `}>Jito bundle fee</Popover.Button>

      <Popover.Panel className="w-[200px] absolute z-10 mt-4 max-w-sm transform -translate-x-1/2 left-1/3 px-4 sm:px-0 lg:max-w-3xl bg-white">
        <div className="w-full overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 p-4">
          <div className="w-full flex gap-2 justify-between items-center">
            <span className="text-[#7d7d7d]">Use Jito bundle</span>
            <Switch
              checked={useJitoBundle}
              onChange={() => {
                setUseJitoBundle(!useJitoBundle)
                setAutoBundleFee(!useJitoBundle)
              }}
              className={`group inline-flex h-6 w-11 items-center rounded-full transition ${useJitoBundle ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`size-4 rounded-full bg-white transition ${useJitoBundle ? 'translate-x-6' : 'translate-x-1'}`} />
            </Switch>
          </div>
          <div className="w-full flex gap-2 justify-between items-center mt-5">
            <span className="text-[#7d7d7d]">Auto Fee</span>
            <Switch
              checked={autoBundleFee}
              onChange={() => setAutoBundleFee(!autoBundleFee)}
              className={`group inline-flex h-6 w-11 items-center rounded-full transition ${autoBundleFee ? 'bg-blue-600' : 'bg-gray-200'}`}
            >
              <span className={`size-4 rounded-full bg-white transition ${autoBundleFee ? 'translate-x-6' : 'translate-x-1'}`} />
            </Switch>
          </div>
          <div className="w-full flex justify-between items-center gap-2 mt-5">
            <span className="text-[#7d7d7d]">Lamports</span>
            <input
              onChange={handleInputChange}
              value={bundleFee}
              defaultValue={bundleFee}
              type="text"
              disabled={!useJitoBundle}
              className={`${commonInputClasses} `}
            />
          </div>
        </div>
      </Popover.Panel>
    </Popover>
  )
}
const Index = () => {
  // const [isPreviewOpen, setPreviewOpen] = useState(false)
  const Navigate = useNavigate()
  const isPreviewOpen = useAppStore(state => state.isOpenPreview)
  const setOpenPreview = useAppStore(state => state.setOpenPreview)
  const isPreviewSolToWsolOpen = useAppStore(state => state.isOpenPreviewSolToWsol)
  const setOpenPreviewSolToWsol = useAppStore(state => state.setOpenPreviewSolToWsol)
  const isOpenPreviewSolCreateUsdc = useAppStore(state => state.isOpenPreviewSolCreateUsdc)
  const setOpenPreviewSolCreateUsdc = useAppStore(state => state.setOpenPreviewSolCreateUsdc)
  const fromChainID = useAppStore(state => state.fromChainID)
  const toChainID = useAppStore(state => state.toChainID)

  const closePreview = useCallback(() => {
    setOpenPreview(false)
  }, [setOpenPreview])

  const closePreviewSolToWsol = useCallback(() => {
    setOpenPreviewSolToWsol(false)
  }, [setOpenPreviewSolToWsol])

  const closePreviewSolCreateUsdc = useCallback(() => {
    setOpenPreviewSolCreateUsdc(false)
  }, [setOpenPreviewSolCreateUsdc])

  //h-[calc(100vh)
  return (
    <div className="relative flex  min-h-[calc(100vh-160px)]  flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
      <img
        src="https://play.tailwindcss.com/img/beams.jpg"
        alt=""
        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        width={1308}
      />
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="w-full m-auto sm:w-[580px] sm:min-w-[520px] my-6 mt-[-48px] relative text-center text-gray-600">
        Bridge your USDC using Circle's CCTP or swap to any token on ValueRouter asset routing network across multiple chains in just one transaction.
      </div>
      <div className="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-xl sm:rounded-lg sm:px-10">
        <div className="w-full   sm:w-[520px] sm:min-w-[520px] ">
          {/* part1*/}

          <div className="mb-3 flex w-full items-center justify-between">
            <span className="text-valuerouter-primary text-xl font-semibold leading-8 sm:text-2xl">Route</span>
            <div className="flex items-center">
              <When condition={fromChainID === SupportedChainId.SOLANA && toChainID === SupportedChainId.SOLANA}>
                <div className="absolute right-5">{MyPopover()}</div>
              </When>
              <When condition={fromChainID === SupportedChainId.SOLANA && toChainID !== SupportedChainId.SOLANA}>
                <div className="absolute right-5">
                  <BundleFee />
                </div>
              </When>
            </div>
          </div>

          {/*part2*/}
          <TokenSelectPanel isFrom={true}></TokenSelectPanel>

          {/*paprt3*/}
          <TokenSwichPanel></TokenSwichPanel>
          {/*part2*/}
          <TokenSelectPanel isFrom={false}></TokenSelectPanel>
          {/*part3 */}
          <div className="mb-4" />
          <SwapBtn></SwapBtn>
          <div className="mb-4" />
          <div>
            <TokenSwapRecipient></TokenSwapRecipient>
          </div>
          <PreviewModal isOpen={isPreviewOpen} closeModal={closePreview}></PreviewModal>
          <SolToWsolModal isOpen={isPreviewSolToWsolOpen} closeModal={closePreviewSolToWsol}></SolToWsolModal>
          <SolCreateUsdcModal isOpen={isOpenPreviewSolCreateUsdc} closeModal={closePreviewSolCreateUsdc}></SolCreateUsdcModal>
        </div>
      </div>
    </div>
  )
}

export default Index
