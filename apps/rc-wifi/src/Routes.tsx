import { ConfigProvider }    from '@acx-ui/components'
import { rootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { NetworkDetails } from './components/NetworkDetails/NetworkDetails'
import { NetworkForm }    from './components/NetworkForm/NetworkForm'
import { NetworksTable }  from './components/NetworksTable'

export default function WifiRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='networks' element={<NetworksTable />} />
      <Route path='networks/create' element={<NetworkForm />} />
      <Route
        path='networks/:networkId/network-details/:activeTab'
        element={<NetworkDetails />}
      />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}
