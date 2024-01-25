import { Brand360 }                                              from '@acx-ui/analytics/components'
import { ConfigProvider, PageNotFound }                          from '@acx-ui/components'
import { Features, useIsSplitOn }                                from '@acx-ui/feature-toggle'
import { VenueDetails }                                          from '@acx-ui/main/components'
import { ManageCustomer, ManageIntegrator, PortalSettings }      from '@acx-ui/msp/components'
import { AAAForm, AAAPolicyDetail, NetworkDetails, NetworkForm } from '@acx-ui/rc/components'
import {
  CONFIG_TEMPLATE_LIST_PATH,
  PolicyOperation,
  PolicyType,
  getConfigTemplatePath,
  getPolicyRoutePath
}  from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                          from '@acx-ui/store'

import { ConfigTemplate }                          from './pages/ConfigTemplates'
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
      <Route path='brand360' element={<Brand360 />} />
      <Route path={getConfigTemplatePath('/*')} element={<ConfigTemplatesRoutes />} />
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

function ConfigTemplatesRoutes () {
  const isConfigTemplateEnabled = useIsSplitOn(Features.CONFIG_TEMPLATE)
  return isConfigTemplateEnabled ? rootRoutes(
    <Route path=':tenantId/v/'>
      <Route path={getConfigTemplatePath()}
        element={<LayoutWithConfigTemplateContext />}
      >
        <Route index
          element={<TenantNavigate replace to={CONFIG_TEMPLATE_LIST_PATH} tenantType='v'/>}
        />
        <Route path=':activeTab' element={<ConfigTemplate />} />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
          element={<AAAForm edit={false} />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })}
          element={<AAAForm edit={true} />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.DETAIL })}
          element={<AAAPolicyDetail />}
        />
        <Route path='networks/wireless/add' element={<NetworkForm />} />
        <Route path='networks/wireless/:networkId/:action' element={<NetworkForm />} />
        <Route
          path='networks/wireless/:networkId/network-details/:activeTab'
          element={<NetworkDetails />}
        />
        <Route path='venues/:venueId/venue-details/:activeTab' element={<VenueDetails />} />
      </Route>
    </Route>
  ) : null
}
