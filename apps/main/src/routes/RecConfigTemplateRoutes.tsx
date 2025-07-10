import { ConfigTemplateDpskDetails, ConfigTemplatePortalDetails } from '@acx-ui/main/components'
import { AAAForm, AAAPolicyDetail,
  DHCPDetail,
  DHCPForm, DpskForm,
  PortalForm,
  NetworkDetails, NetworkForm,
  AccessControlForm, AccessControlDetail,
  useConfigTemplateVisibilityMap,
  WifiCallingForm, WifiCallingConfigureForm, WifiCallingDetailView,
  VLANPoolForm,
  VLANPoolDetail,
  RogueAPDetectionForm,
  RogueAPDetectionDetailView,
  SyslogForm,
  SyslogDetailView,
  ConfigurationProfileForm,
  CliProfileForm, ApGroupDetails, ApGroupEdit,
  AddEthernetPortProfile,
  EditEthernetPortProfile,
  EthernetPortProfileDetail
} from '@acx-ui/rc/components'
import { CONFIG_TEMPLATE_LIST_PATH, ConfigTemplateType, getConfigTemplatePath, getPolicyRoutePath, getServiceRoutePath, LayoutWithConfigTemplateContext, PolicyOperation, PolicyType, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { rootRoutes, Route, TenantNavigate }                                                                                                                                                                          from '@acx-ui/react-router-dom'
import { SwitchScopes }                                                                                                                                                                                               from '@acx-ui/types'
import { AuthRoute }                                                                                                                                                                                                  from '@acx-ui/user'

import { VenueDetails, VenuesForm, VenueEdit } from '../pages/Venues'

export default function RecConfigTemplateRoutes () {
  const configTemplateVisibilityMap = useConfigTemplateVisibilityMap()

  return rootRoutes(
    <Route path=':tenantId/t/'>
      <Route path={getConfigTemplatePath()} element={<LayoutWithConfigTemplateContext />}>
        <Route index
          element={<TenantNavigate replace to={CONFIG_TEMPLATE_LIST_PATH} />}
        />
        <Route path='templates' element={<div>ConfigTemplatePage</div>} />
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
          <Route
            path='venues/add'
            element={
              <AuthRoute requireCrossVenuesPermission={{ needGlobalPermission: true }}>
                <VenuesForm />
              </AuthRoute>
            }
          />
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
            element={<ConfigTemplatePortalDetails/>}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.WIFI_CALLING] && <>
          <Route
            path={getServiceRoutePath({
              type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE
            })}
            element={<WifiCallingForm />}
          />
          <Route
            path={getServiceRoutePath({
              type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT
            })}
            element={<WifiCallingConfigureForm />}
          />
          <Route
            path={getServiceRoutePath({
              type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL
            })}
            element={<WifiCallingDetailView />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.VLAN_POOL] && <>
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.VLAN_POOL,
              oper: PolicyOperation.CREATE
            })}
            element={<VLANPoolForm edit={false}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.VLAN_POOL,
              oper: PolicyOperation.EDIT
            })}
            element={<VLANPoolForm edit={true}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.VLAN_POOL,
              oper: PolicyOperation.DETAIL
            })}
            element={<VLANPoolDetail />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.ETHERNET_PORT_PROFILE] && <>
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ETHERNET_PORT_PROFILE,
              oper: PolicyOperation.CREATE
            })}
            element={<AddEthernetPortProfile />}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ETHERNET_PORT_PROFILE,
              oper: PolicyOperation.EDIT
            })}
            element={<EditEthernetPortProfile />}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ETHERNET_PORT_PROFILE,
              oper: PolicyOperation.DETAIL
            })}
            element={<EthernetPortProfileDetail />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.SYSLOG] && <>
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.SYSLOG,
              oper: PolicyOperation.CREATE
            })}
            element={<SyslogForm edit={false} />}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.SYSLOG,
              oper: PolicyOperation.EDIT
            })}
            element={<SyslogForm edit={true}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.SYSLOG,
              oper: PolicyOperation.DETAIL
            })}
            element={<SyslogDetailView />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.ROGUE_AP_DETECTION] && <>
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE
            })}
            element={<RogueAPDetectionForm edit={false}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.EDIT
            })}
            element={<RogueAPDetectionForm edit={true}/>}
          />
          <Route
            path={getPolicyRoutePath({
              type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.DETAIL
            })}
            element={<RogueAPDetectionDetailView />}
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.SWITCH_REGULAR] && <>
          <Route
            path='networks/wired/profiles/add'
            element={
              <AuthRoute scopes={[SwitchScopes.CREATE]} requireCrossVenuesPermission>
                <ConfigurationProfileForm />
              </AuthRoute>
            }
          />
          <Route
            path='networks/wired/profiles/regular/:profileId/:action'
            element={
              <AuthRoute scopes={[SwitchScopes.UPDATE]} requireCrossVenuesPermission>
                <ConfigurationProfileForm />
              </AuthRoute>
            }
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.SWITCH_CLI] && <>
          <Route path='networks/wired/:configType/cli/add'
            element={
              <AuthRoute scopes={[SwitchScopes.CREATE]} requireCrossVenuesPermission>
                <CliProfileForm />
              </AuthRoute>
            } />
          <Route
            path='networks/wired/:configType/cli/:profileId/:action'
            element={
              <AuthRoute scopes={[SwitchScopes.UPDATE]} requireCrossVenuesPermission>
                <CliProfileForm />
              </AuthRoute>
            }
          />
        </>}
        {configTemplateVisibilityMap[ConfigTemplateType.AP_GROUP] && <>
          {/* eslint-disable-next-line max-len */}
          <Route path='devices/apgroups/:apGroupId/details/:activeTab' element={<ApGroupDetails />}/>
          <Route path='devices/apgroups/:apGroupId/:action/:activeTab' element={<ApGroupEdit />} />
          <Route path='devices/apgroups/:apGroupId/:action' element={<ApGroupEdit />} />
          <Route path='devices/apgroups/:action' element={<ApGroupEdit />} />
        </>}
      </Route>
    </Route>
  )
}
