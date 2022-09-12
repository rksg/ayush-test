import { ConfigProvider }                    from '@acx-ui/components'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { Integrators }  from './components/Integrators'
import { MspCustomers } from './components/MspCustomers'
import { VarCustomers } from './components/VarCustomers'
import Layout           from './pages/Layout'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path='v/:tenantId' element={<Layout />}>
      <Route index element={<TenantNavigate to='/dashboard' />} />
      <Route path='dashboard' element={<MspCustomers />} />
      <Route path='mspCustomers' element={<MspCustomers />} />
      <Route path='varCustomers' element={<VarCustomers />} />
      <Route path='integrators' element={<Integrators />} />
      <Route path='deviceInventory' element={<div>Device Inventory</div>} />
      <Route path='portalSetting' element={<div>Portal Setting</div>} />
      <Route path='mspLicenses' element={<div>MSP License</div>} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}
