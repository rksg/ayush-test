import { ConfigProvider }                    from '@acx-ui/components'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { DeviceInventory } from './pages/DeviceInventory'
import { Integrators }     from './pages/Integrators'
import { AddIntegrator }   from './pages/Integrators/AddIntegrator'
import Layout              from './pages/Layout'
import { LicensesTab }     from './pages/LicensesTab'
import { MspCustomers }    from './pages/MspCustomers'
import { AddMspCustomer }  from './pages/MspCustomers/AddMspCustomer'
import { VarCustomers }    from './pages/VarCustomers'

export default function MspRoutes () {
  const routes = rootRoutes(
    <Route path='v/:tenantId' element={<Layout />}>
      <Route index element={<TenantNavigate replace to='/dashboard' tenantType='v'/>} />
      <Route
        path='dashboard'
        element={<TenantNavigate replace to='/dashboard/mspCustomers' tenantType='v'/>}
      />
      <Route path='dashboard/mspCustomers' element={<MspCustomers />} />
      <Route path='dashboard/mspCustomers/create' element={<AddMspCustomer />} />
      <Route path='dashboard/varCustomers' element={<VarCustomers />} />
      <Route path='integrators' element={<Integrators />} />
      <Route path='integrators/create' element={<AddIntegrator />} />
      <Route path='deviceinventory' element={<DeviceInventory />} />
      <Route path='msplicenses' element={<LicensesTab />} />
      <Route path='portalSetting' element={<div>Portal Setting</div>} />
    </Route>
  )
  return (
    <ConfigProvider>
      <Provider children={routes} />
    </ConfigProvider>
  )
}
