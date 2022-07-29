import { ConfigProvider }    from '@acx-ui/components'
import { Route, rootRoutes } from '@acx-ui/react-router-dom'
import { Provider }          from '@acx-ui/store'

import { VenuesForm }  from './VenuesForm'
import { VenuesTable } from './VenuesTable'

export default function VenueRoutes () {
  const routes = rootRoutes(
    <Route path='t/:tenantId'>
      <Route path='venues' element={<VenuesTable />} />
      <Route path='venues/create' element={<VenuesForm />} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}