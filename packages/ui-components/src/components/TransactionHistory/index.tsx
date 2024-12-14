import { useAppStore } from '../../state'
import { useWeb3React } from '@web3-react/core'
import Txinfo from './txinfo'
import { Else, If, Then } from 'react-if'
import { useWallet } from '@solana/wallet-adapter-react'

const Index = () => {
  const { account } = useWeb3React()
  const fromChainID = useAppStore(state => state.fromChainID)
  const cosmosAddress = useAppStore(state => state.getCosmosAddress(fromChainID as string))
  const wallet = useWallet()
  const list = useAppStore(state => state.getHistory([account || '', cosmosAddress || '', wallet.publicKey?.toBase58() || '']))
  const clearHistory = useAppStore(state => state.clearHistory)
  // console.info(list)

  const Clear = () => {
    clearHistory()
    return
  }
  return (
    <div className="relative flex min-h-[calc(100vh-160px)] flex-col  overflow-hidden bg-gray-50 py-6 sm:py-12">
      <img
        src="https://play.tailwindcss.com/img/beams.jpg"
        alt=""
        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        width={1308}
      />
      <div className="absolute inset-0 bg-[url(/grid.svg)] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="relative  mx-auto max-w-screen-xl  w-full bg-white rounded-md p-4">
        <h1 className="flex items-center justify-between font-semibold text-xl mt-10 mx-10">
          <span>Transactions</span>
          <span className="text-sm text-blue-500 hover:text-blue-700 cursor-pointer" onClick={() => Clear()}>
            Clear All
          </span>
        </h1>
        <div className=" flex flex-row  mt-10 font-medium    py-4 px-4 rounded-md    border-b text-center ">
          <div className=" w-1/3">Source</div>
          <div className=" w-1/3">Destination</div>
          <div className=" flex-1">Transaction Status</div>
        </div>
        <If condition={list.length > 0}>
          <Then>
            {list.map(item => {
              return <Txinfo key={item.creattime} Item={item}></Txinfo>
            })}
          </Then>
          <Else>
            <div className=" text-center my-20">
              <div className=" font-semibold  text-lg text-black">No Transactions</div>
              <div>You haven&apos;t made any transaction yet</div>
            </div>
          </Else>
        </If>
      </div>
    </div>
  )
}

export default Index
