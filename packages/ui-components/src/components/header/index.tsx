import React, { FC } from 'react'

import { Bars3Icon } from '@heroicons/react/24/solid'
import logo from '../../assets/VRlogo.svg'
import mobilelogo from '../../assets/smalllogo.png'

import Connectwallet from '../connectwallet'
import ChainList from '../chainList/index'
import Noticeinfo from '../noticeinfo'

import { useNavigate, useLocation } from 'react-router-dom'
import { classNames } from '../../utils'

export const Header: FC = () => {
  const Navigate = useNavigate()
  const navLocation = useLocation()

  const pathname = navLocation.pathname

  return (
    <header className="text-gray-600 body-font">
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 ">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <a href="https://www.valuerouter.com/" target="_blank" className="flex items-center cursor-pointer" rel="noreferrer">
            <img src={mobilelogo} width={32} height={32} className="  sm:hidden  " alt=" Logo" />
            <img src={logo} width={164} height={48} className="mr-3   hidden sm:block    "></img>
          </a>

          <div className="  min-w-[300px] flex  flex-1  items-center justify-end  lg:order-2">
            <Noticeinfo></Noticeinfo>
            {/* <ChainList></ChainList> */}
            <Connectwallet></Connectwallet>
            <button
              data-collapse-toggle="mobile-menu-2"
              type="button"
              className="inline-flex items-center p-2 ml-1 text-sm text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 "
              aria-controls="mobile-menu-2"
              aria-expanded="false"
            >
              <Bars3Icon className=" w-6 h-6"></Bars3Icon>
            </button>
          </div>
          <div className="hidden  justify-between items-center w-full lg:flex lg:w-auto lg:order-1 flex-1 sm:ml-8" id="mobile-menu-2">
            <ul className="flex flex-col mt-4 font-medium lg:flex-row  space-y-2 lg:space-y-0 lg:space-x-8  lg:mt-0">
              <li>
                <a
                  onClick={() => {
                    Navigate('/')
                  }}
                  className={classNames(
                    'block  cursor-pointer py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent  lg:p-0 ',
                    pathname == '/' ? 'lg:text-blue-700' : 'lg:text-gray-800'
                  )}
                  aria-current="page"
                >
                  Route
                </a>
              </li>
              <li>
                <a
                  onClick={() => {
                    Navigate('/transactions')
                  }}
                  className={classNames(
                    'block  cursor-pointer py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent  lg:p-0 ',
                    pathname == '/transactions' ? 'lg:text-blue-700' : 'lg:text-gray-800'
                  )}
                  aria-current="page"
                >
                  Transaction History
                </a>
              </li>
              <li>
                <a
                  href="https://docs.valuerouter.com/"
                  className={classNames(
                    'block  cursor-pointer py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent  lg:p-0 ',
                    pathname == '/docs' ? 'lg:text-blue-700' : 'lg:text-gray-800'
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Docs
                </a>
              </li>
              <li>
                <a
                  href="https://blog.valuerouter.com/"
                  className={classNames(
                    'block  cursor-pointer py-2 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent  lg:p-0 ',
                    pathname == '/docs' ? 'lg:text-blue-700' : 'lg:text-gray-800'
                  )}
                  target="_blank"
                  rel="noreferrer"
                >
                  Blog
                </a>
              </li>
              {/* <li>
                <a
                  href="#"
                  className="block py-2 pr-4 pl-3 text-gray-700 border-b border-gray-100 hover:bg-gray-50 lg:hover:bg-transparent lg:border-0 lg:hover:text-primary-700 lg:p-0 "
                >
                  Doc
                </a>
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
