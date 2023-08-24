import { ConfigProvider, PageNotFound }                     from '@acx-ui/components'
import { ManageCustomer, ManageIntegrator, PortalSettings } from '@acx-ui/msp/components'
import { rootRoutes, Route, TenantNavigate }                from '@acx-ui/react-router-dom'
import { Provider }                                         from '@acx-ui/store'

import { DeviceInventory }  from './pages/DeviceInventory'
import { Integrators }      from './pages/Integrators'
import Layout               from './pages/Layout'
import { MspCustomers }     from './pages/MspCustomers'
import { Subscriptions }    from './pages/Subscriptions'
import { AssignMspLicense } from './pages/Subscriptions/AssignMspLicense'
import { VarCustomers }     from './pages/VarCustomers'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path=':tenantId/v' element={<Layout />}>
      <Route path='*' element={<PageNotFound />} />
      <Route index element={<TenantNavigate replace to='/dashboard' tenantType='v'/>} />
      <Route
        path='dashboard'
        element={<TenantNavigate replace to='/dashboard/mspCustomers' tenantType='v'/>}
      />
      <Route path='dashboard/mspCustomers/*' element={<CustomersRoutes />} />
      <Route path='dashboard/varCustomers' element={<VarCustomers />} />
      <Route path='integrators/*' element={<CustomersRoutes />} />
      <Route path='deviceinventory' element={<DeviceInventory />} />
      <Route path='msplicenses/*' element={<CustomersRoutes />} />
      <Route path='portalSetting' element={<PortalSettings />} />
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
      <Route path='*' element={<PageNotFound />} />
      <Route path=':tenantId/v/dashboard/mspCustomers'>
        <Route index element={<MspCustomers />} />
        <Route path='create' element={<ManageCustomer />} />
        <Route path=':action/:status/:mspEcTenantId' element={<ManageCustomer />} />
      </Route>
      <Route path=':tenantId/v/integrators'>
        <Route index element={<Integrators />} />
        <Route path='create' element={<ManageIntegrator />} />
        <Route path=':action/:type/:mspEcTenantId' element={<ManageIntegrator />} />
      </Route>
      <Route path=':tenantId/v/msplicenses'>
        <Route index element={<Subscriptions />} />
        <Route path='assign' element={<AssignMspLicense />} />
      </Route>
    </Route>
  )
}
