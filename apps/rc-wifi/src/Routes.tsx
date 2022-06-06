import { rootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { NetworkForm }   from './NetworkForm/NetworkForm'
import { NetworksTable } from './NetworksTable'

export default function WifiRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='networks' element={<NetworksTable />} />
      <Route path='networks/create' element={<NetworkForm />} />
    </Route>
  )
  return (
    <Provider children={routes} />
  )
}
