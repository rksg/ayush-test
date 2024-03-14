import { Brand360 }                                         from '@acx-ui/analytics/components'
import { ConfigProvider, PageNotFound }                     from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }         from '@acx-ui/feature-toggle'
import { VenueEdit, VenuesForm, VenueDetails }              from '@acx-ui/main/components'
import { ManageCustomer, ManageIntegrator, PortalSettings } from '@acx-ui/msp/components'
import {
  AAAForm, AAAPolicyDetail,
  DHCPDetail,
  DHCPForm, DpskForm,
  NetworkDetails, NetworkForm,
  AccessControlForm, AccessControlDetail,
  useConfigTemplateVisibilityMap
} from '@acx-ui/rc/components'
import {
  CONFIG_TEMPLATE_LIST_PATH,
  ConfigTemplateType,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getConfigTemplatePath,
  getPolicyRoutePath,
  getServiceRoutePath
}  from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate, Navigate, useTenantLink } from '@acx-ui/react-router-dom'
import { Provider }                                                   from '@acx-ui/store'
import { AccountType, getJwtTokenPayload }                            from '@acx-ui/utils'

import { ConfigTemplate }                          from './pages/ConfigTemplates'
import DpskDetails                                 from './pages/ConfigTemplates/Wrappers/DpskDetails'
import { DeviceInventory }                         from './pages/DeviceInventory'
import { Integrators }                             from './pages/Integrators'
import Layout, { LayoutWithConfigTemplateContext } from './pages/Layout'
import { MspCustomers }                            from './pages/MspCustomers'
import { MspRecCustomers }                         from './pages/MspRecCustomers'
import { AddRecCustomer }                          from './pages/MspRecCustomers/AddRecCustomer'
import { Subscriptions }                           from './pages/Subscriptions'
import { AssignMspLicense }                        from './pages/Subscriptions/AssignMspLicense'
import { VarCustomers }                            from './pages/VarCustomers'

function Init () {
  const { tenantType } = getJwtTokenPayload()
  const isShowBrand360 =
    tenantType === AccountType.MSP_INTEGRATOR ||
    tenantType === AccountType.MSP_NON_VAR
  const basePath = useTenantLink(isShowBrand360 ? '/brand360' : '/dashboard', 'v')
  return <Navigate
    replace
    to={{ pathname: basePath.pathname }}
  />
}

export default function MspRoutes () {
  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn

  const navigateToDashboard = isHspSupportEnabled
    ? '/dashboard/mspRecCustomers'
    : '/dashboard/mspCustomers'

  const routes = rootRoutes(
    <Route path=':tenantId/v' element={<Layout />}>
      <Route path='*' element={<PageNotFound />} />
      <Route index element={<Init />} />
      <Route
        path='dashboard'
        element={<TenantNavigate replace to={navigateToDashboard} tenantType='v'/>}
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

export function ConfigTemplatesRoutes () {
  const configTemplateVisibilityMap = useConfigTemplateVisibilityMap()

  return rootRoutes(
    <Route path=':tenantId/v/'>
      <Route path={getConfigTemplatePath()} element={<LayoutWithConfigTemplateContext />}>
        <Route index
          element={<TenantNavigate replace to={CONFIG_TEMPLATE_LIST_PATH} tenantType='v'/>}
        />
        <Route path=':activeTab' element={<ConfigTemplate />} />
        {configTemplateVisibilityMap[ConfigTemplateType.RADIUS] && <>
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
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.ACCESS_CONTROL] && <>
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE
            })}
            element={<AccessControlForm editMode={false}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT
            })}
            element={<AccessControlForm editMode={true}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.DETAIL
            })}
            element={<AccessControlDetail />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.NETWORK] && <>
          <Route path='networks/wireless/add' element={<NetworkForm />} />
          <Route path='networks/wireless/:networkId/:action' element={<NetworkForm />} />
          <Route path='networks/wireless/:networkId/network-details/:activeTab'
            element={<NetworkDetails />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.VENUE] && <>
          <Route path='venues/add' element={<VenuesForm />} />
          <Route path='venues/:venueId/:action/:activeTab' element={<VenueEdit />} />
          <Route path='venues/:venueId/:action/:activeTab/:activeSubTab' element={<VenueEdit />} />
          <Route path='venues/:venueId/venue-details/:activeTab' element={<VenueDetails />} />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.DPSK] && <>
          <Route
            path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })}
            element={<DpskForm />}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT })}
            element={<DpskForm editMode={true} />}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })}
            element={<DpskDetails />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.DHCP] && <>
          <Route
            path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}
            element={<DHCPForm/>}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT })}
            element={<DHCPForm editMode={true}/>}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.DETAIL })}
            element={<DHCPDetail/>}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.VLAN_POOL] && <>
          <Route
            path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })}
            element={<div>VLAN POOL Creation</div>}
          />
          <Route
            path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.EDIT })}
            element={<div>VLAN POOL Edition</div>}
          />
          <Route
            path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.DETAIL })}
            element={<div>VLAN POOL Details</div>}
          />
        </>}
      </Route>
    </Route>
  )
}
