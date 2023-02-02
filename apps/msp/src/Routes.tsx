import { ConfigProvider }                    from '@acx-ui/components'
import { ManageCustomer }                    from '@acx-ui/msp/components'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { DeviceInventory } from './pages/DeviceInventory'
import { Integrators }     from './pages/Integrators'
import Layout              from './pages/Layout'
import { MspCustomers }    from './pages/MspCustomers'
import { Subscriptions }   from './pages/Subscriptions'
import { VarCustomers }    from './pages/VarCustomers'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path='v/:tenantId' element={<Layout />}>
      <Route index element={<TenantNavigate replace to='/dashboard' tenantType='v'/>} />
      <Route
        path='dashboard'
        element={<TenantNavigate replace to='/dashboard/mspCustomers' tenantType='v'/>}
      />
      <Route path='dashboard/mspCustomers/*' element={<CustomersRoutes />} />
      <Route path='dashboard/varCustomers' element={<VarCustomers />} />
      <Route path='integrators/*' element={<CustomersRoutes />} />
      <Route path='deviceinventory' element={<DeviceInventory />} />
      <Route path='msplicenses' element={<Subscriptions />} />
      <Route path='portalSetting' element={<div>Portal Setting</div>} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}

function CustomersRoutes () {
  return rootRoutes(
    <Route>
      <Route path='v/:tenantId/dashboard/mspCustomers'>
        <Route index element={<MspCustomers />} />
        <Route path='create' element={<ManageCustomer />} />
        <Route path=':action/:status/:mspEcTenantId' element={<ManageCustomer />} />
      </Route>
      <Route path='v/:tenantId/integrators'>
        <Route index element={<Integrators />} />
        {/* <Route path='create' element={<AddIntegrator />} />
        <Route path=':action/:mspEcTenantId' element={<AddIntegrator />} /> */}
      </Route>
    </Route>
  )
}
