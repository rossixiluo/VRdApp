import { Header, Footer, Web3Provider } from '@monorepo/ui-components'
import { Outlet } from 'react-router-dom'
import 'flowbite'
import ReactGA from 'react-ga4'
ReactGA.initialize('G-2GE1EBEY30')

function App() {
  return (
    <div className="App">
      <Web3Provider>
        <Header></Header>
        <section className="container mx-auto body-font">
          <Outlet />
        </section>
        <Footer></Footer>
      </Web3Provider>
    </div>
  )
}

export default App
