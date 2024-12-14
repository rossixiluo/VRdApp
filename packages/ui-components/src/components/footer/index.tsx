import logo from '../../assets/ValueRouter.png'
import telegram from '../../assets/icon/telegram.svg'
import twitter from '../../assets/icon/twitter.svg'
import Circle from '../../assets/Circle.svg'
// import discord from '../../assets/icon/discord.svg'

export const Footer = () => {
  return (
    <footer className="text-gray-600 body-font max-w-screen-xl m-auto">
      <div className="container px-5 py-8 mx-auto flex items-center sm:flex-row flex-col">
        <a className="flex title-font font-medium items-center md:justify-start justify-center ">
          Powered by
          <img src={logo} className=" w-32" />
          <img src={Circle} className=" w-28" />
          {/* <span className="ml-3 text-xl font-semibold">Value Router</span> */}
        </a>
        <p className="text-sm text-gray-500 sm:ml-4 sm:pl-4 sm:border-l-2 sm:border-gray-200 sm:py-2 sm:mt-0 mt-4"></p>
        <span className="text-sm text-gray-500  max-w-md">
          Route your assets among Ethereum, Avalanche, Optimism, Arbitrum, Cosmos, Solana, Base and Polygon in a secure, low-cost, and fast way.
        </span>
        <span className="inline-flex sm:ml-auto sm:mt-0 mt-4 justify-center sm:justify-start">
          {/* <a className="text-gray-500">
            <img width={16} src={discord}></img>
          </a> */}
          <a href="https://twitter.com/ValueRouter" target="_blank" rel="noreferrer" className="ml-3 text-gray-500">
            <img width={32} src={twitter}></img>
          </a>
          <a href="https://t.me/+IW6uPXXlZeFlZTBh" target="_blank" className="ml-3 text-gray-500" rel="noreferrer">
            <img width={32} src={telegram}></img>
          </a>
        </span>
      </div>
    </footer>
  )
}
