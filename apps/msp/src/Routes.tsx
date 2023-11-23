import { ConfigProvider, PageNotFound }                     from '@acx-ui/components'
import { ManageCustomer, ManageIntegrator, PortalSettings } from '@acx-ui/msp/components'
import { AAAForm }                                          from '@acx-ui/rc/components'
import {
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath
}  from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { DeviceInventory }                         from './pages/DeviceInventory'
import { Integrators }                             from './pages/Integrators'
import Layout, { LayoutWithConfigTemplateContext } from './pages/Layout'
import { MspCustomers }                            from './pages/MspCustomers'
import { MspRecCustomers }                         from './pages/MspRecCustomers'
import { AddRecCustomer }                          from './pages/MspRecCustomers/AddRecCustomer'
import { Subscriptions }                           from './pages/Subscriptions'
import { AssignMspLicense }                        from './pages/Subscriptions/AssignMspLicense'
import { VarCustomers }                            from './pages/VarCustomers'

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
      <Route path='dashboard/mspRecCustomers/*' element={<CustomersRoutes />} />
      <Route path='dashboard/varCustomers' element={<VarCustomers />} />
      <Route path='integrators/*' element={<CustomersRoutes />} />
      <Route path='deviceinventory' element={<DeviceInventory />} />
      <Route path='msplicenses/*' element={<CustomersRoutes />} />
      <Route path='portalSetting' element={<PortalSettings />} />
      <Route path='templates/*' element={<TemplatesRoutes />} />
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
      <Route path=':tenantId/v/dashboard/mspRecCustomers'>
        <Route index element={<MspRecCustomers />} />
        <Route path='create' element={<AddRecCustomer />} />
        <Route path=':action/:status/:mspEcTenantId' element={<AddRecCustomer />} />
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

function TemplatesRoutes () {
  return rootRoutes(
    <Route>
      <Route path='*' element={<PageNotFound />} />
      <Route path=':tenantId/v/templates' element={<LayoutWithConfigTemplateContext />}>
        <Route index element={<div>Templates Main Page</div>} />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
          element={<AAAForm edit={false}/>}
        />
      </Route>
    </Route>
  )
}
