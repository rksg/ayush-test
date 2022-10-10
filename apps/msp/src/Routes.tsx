import { ConfigProvider }                    from '@acx-ui/components'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { Integrators }  from './pages/Integrators'
import Layout           from './pages/Layout'
import { MspCustomers } from './pages/MspCustomers'
import { VarCustomers } from './pages/VarCustomers'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path='v/:tenantId' element={<Layout />}>
      <Route index element={<TenantNavigate replace to='/dashboard' tenantType='v'/>} />
      <Route
        path='dashboard'
        element={<TenantNavigate replace to='/dashboard/mspCustomers' tenantType='v'/>}
      />
      <Route path='dashboard/mspCustomers' element={<MspCustomers />} />
      <Route path='dashboard/varCustomers' element={<VarCustomers />} />
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
