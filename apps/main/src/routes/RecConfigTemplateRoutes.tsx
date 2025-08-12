import { ConfigTemplatePage }                                     from '@acx-ui/config-template/rec/components'
import { ConfigTemplateDpskDetails, ConfigTemplatePortalDetails } from '@acx-ui/main/components'
import { AAAForm, AAAPolicyDetail,
  DpskForm,
  PortalForm,
  NetworkDetails, NetworkForm,
  useConfigTemplateVisibilityMap
} from '@acx-ui/rc/components'
import { CONFIG_TEMPLATE_LIST_PATH, ConfigTemplateType, getConfigTemplatePath, getPolicyRoutePath, getServiceRoutePath, LayoutWithConfigTemplateContext, PolicyOperation, PolicyType, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate }                                                                                                                                                                          from '@acx-ui/react-router-dom'

import { VenueDetails, VenuesForm, VenueEdit } from '../pages/Venues'

export default function RecConfigTemplateRoutes () {
  const configTemplateVisibilityMap = useConfigTemplateVisibilityMap()

  return rootRoutes(
    <Route path=':tenantId/t/'>
      <Route path={getConfigTemplatePath()} element={<LayoutWithConfigTemplateContext />}>
        <Route index
          element={<TenantNavigate replace to={CONFIG_TEMPLATE_LIST_PATH} />}
        />
        <Route path='templates' element={<ConfigTemplatePage />} />
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
            element={<ConfigTemplateDpskDetails />}
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
            element={<ConfigTemplatePortalDetails/>}
          />
        </>}
      </Route>
    </Route>
  )
}
