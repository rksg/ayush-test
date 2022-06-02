/* eslint-disable max-len */
import { RootRoutes, Route } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { NetworkApsTab }       from './NetworkDetails/NetworkApsTab'
import { NetworkEventsTab }    from './NetworkDetails/NetworkEventsTab'
import { NetworkIncidentsTab } from './NetworkDetails/NetworkIncidentsTab'
import { NetworkOverviewTab }  from './NetworkDetails/NetworkOverviewTab'
import { NetworkServicesTab }  from './NetworkDetails/NetworkServicesTab'
import { NetworkVenuesTab }    from './NetworkDetails/NetworkVenuesTab'
import { NetworkForm }         from './NetworkForm/NetworkForm'
import { NetworksTable }       from './NetworksTable'

export default function WifiRoutes () {
  return (
    <Provider>
      <RootRoutes>
        <Route path='/t/:tenantId'>
          <Route path='networks' element={<NetworksTable />} /> 
          <Route path='networks/create' element={<NetworkForm />} /> 
          <Route path='networks/:networkId/network-details/overview' element={<NetworkOverviewTab />} /> 
          <Route path='networks/:networkId/network-details/aps' element={<NetworkApsTab />} /> 
          <Route path='networks/:networkId/network-details/venues' element={<NetworkVenuesTab />} /> 
          <Route path='networks/:networkId/network-details/services' element={<NetworkServicesTab />} /> 
          <Route path='networks/:networkId/network-details/events' element={<NetworkEventsTab />} /> 
          <Route path='networks/:networkId/network-details/incidents' element={<NetworkIncidentsTab />} /> 
        </Route>
      </RootRoutes>
    </Provider>
  )
}
