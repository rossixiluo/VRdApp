import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from 'react-router-dom'

import App from './App'
import ErrorPage from './views/errorpage'
// import Home from './views/Home'
import NoMatch from './views/noMatch'
import Swap from './views/Swap'
import Transactions from './views/Transactions'

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />} errorElement={<ErrorPage />}>
      <Route path="" element={<Swap />} />
      <Route path="transactions" element={<Transactions />} />

      <Route path="*" element={<NoMatch />} />
    </Route>
  )
)
const Routes = () => {
  return <RouterProvider router={router} />
}

export default Routes
