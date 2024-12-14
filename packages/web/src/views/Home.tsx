// import Swap from "@monorepo/ui-components/src/components/swap"
// import { Link } from "react-router-dom"
// import logo from '@monorepo/ui-components/src/assets/svgkogo/Blacklogo1.svg'

const Home = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1  bg-gradient-to-r from-cyan-100 to-blue-200">
        <div className="flex flex-col text-left w-full mb-20   mt-10 lg:mt-14">
          <div className="   text-2xl text-gray-900 text-center  p-4 m-auto w-full xl:w-1/2 2xl:w-1/3  ">
            <div className="mx-8 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-md py-4 font-semibold  font-serif text-blue-600 ">USDC Router</div>
          </div>
        </div>
        <div className="flex       lg:mx-28  mb-20 ">
          <div className="p-4 m-auto w-full xl:w-1/2 2xl:w-1/3 ">
            <div className="h-full bg-gray-100 bg-opacity-75 px-8 pt-16 pb-24 rounded-lg overflow-hidden text-center relative">{/* <Swap></Swap> */}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
