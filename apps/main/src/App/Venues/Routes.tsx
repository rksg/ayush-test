import { Route, rootRoutes } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { VenueEdit }   from './VenueEdit'
import { VenuesTable } from './VenuesTable'

export default function VenueRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='venues' element={<VenuesTable />} />
      <Route
        path='venues/:venueId/edit/:activeTab'
        element={<VenueEdit />}
      />
    </Route>
  )
  return (
    <Provider children={routes} />
  )
}