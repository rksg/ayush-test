import { useContext, useEffect, useReducer, useState } from 'react'

import { Brand360 }                                                  from '@acx-ui/analytics/components'
import { ConfigProvider, Loader, PageNotFound }                      from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                  from '@acx-ui/feature-toggle'
import { VenueEdit, VenuesForm, VenueDetails }                       from '@acx-ui/main/components'
import { ManageCustomer, ManageIntegrator, PortalSettings }          from '@acx-ui/msp/components'
import { checkMspRecsForIntegrator }                                 from '@acx-ui/msp/services'
import {
  AAAForm, AAAPolicyDetail,
  DHCPDetail,
  DHCPForm, DpskForm,
  PortalForm,
  NetworkDetails, NetworkForm,
  AccessControlForm, AccessControlDetail,
  useConfigTemplateVisibilityMap,
  WifiCallingForm, WifiCallingConfigureForm, WifiCallingDetailView
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
import { rootRoutes, Route, TenantNavigate, Navigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { Provider }                                                              from '@acx-ui/store'
import { AccountType, getJwtTokenPayload }                                       from '@acx-ui/utils'

import HspContext, { HspActionTypes }              from './HspContext'
import { hspReducer }                              from './HspReducer'
import { ConfigTemplate }                          from './pages/ConfigTemplates'
import DpskDetails                                 from './pages/ConfigTemplates/Wrappers/DpskDetails'
import PortalDetail                                from './pages/ConfigTemplates/Wrappers/PortalDetail'
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
  const {
    state
  } = useContext(HspContext)

  const isBrand360Enabled = useIsSplitOn(Features.MSP_BRAND_360)

  const { tenantType } = getJwtTokenPayload()

  const isInstaller = tenantType === AccountType.MSP_INSTALLER
  const isShowBrand360 = isBrand360Enabled && state.isHsp && !isInstaller

  const basePath = useTenantLink(isShowBrand360 ? '/brand360' : '/dashboard', 'v')
  return <Navigate
    replace
    to={{ pathname: basePath.pathname }}
  />
}

export default function MspRoutes () {
  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn

  const { tenantType } = getJwtTokenPayload()

  const [loadMspRoute, setLoadMspRoute] = useState<boolean>(false)
  const { tenantId } = useParams()

  const [state, dispatch] = useReducer(hspReducer, {
    isHsp: false
  })

  const navigateToDashboard = state.isHsp
    ? '/dashboard/mspRecCustomers'
    : '/dashboard/mspCustomers'

  const isTechPartner =
  tenantType === AccountType.MSP_INTEGRATOR || tenantType === AccountType.MSP_INSTALLER


  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isTechPartner) {
          const response = await checkMspRecsForIntegrator(tenantId as string)
          const integratorListData = await response
          dispatch({
            type: HspActionTypes.IS_HSP,
            payload: {
              isHsp: !!integratorListData?.data?.length
            }
          })
        } else {
          dispatch({
            type: HspActionTypes.IS_HSP,
            payload: {
              isHsp: isHspSupportEnabled
            }
          })
        }
        setLoadMspRoute(true)
      } catch (error) {
        setLoadMspRoute(false)
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }

    fetchData()
  }, [])

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
    <Loader states={[{ isLoading: !loadMspRoute }]}>
      <HspContext.Provider value={{ state, dispatch }}>
        <ConfigProvider>
          <Provider children={routes} />
        </ConfigProvider>
      </HspContext.Provider>
    </Loader>
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
        {configTemplateVisibilityMap[ConfigTemplateType.PORTAL] && <>
          <Route
            path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.CREATE })}
            element={<PortalForm/>}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT })}
            element={<PortalForm editMode={true}/>}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.DETAIL })}
            element={<PortalDetail/>}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.WIFI_CALLING] && <>
          <Route
            path={getServiceRoutePath({
              type: ServiceType.WIFI_CALLING,
              oper: ServiceOperation.CREATE
            })}
            element={<WifiCallingForm />}
          />
          <Route
            path={getServiceRoutePath({
              type: ServiceType.WIFI_CALLING,
              oper: ServiceOperation.EDIT
            })}
            element={<WifiCallingConfigureForm />}
          />
          <Route
            path={getServiceRoutePath({
              type: ServiceType.WIFI_CALLING,
              oper: ServiceOperation.DETAIL
            })}
            element={<WifiCallingDetailView />}
          />
        </>}
      </Route>
    </Route>
  )
}
