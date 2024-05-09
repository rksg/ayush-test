import { PageNotFound }                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AAAForm, AAAPolicyDetail,
  AccessControlDetail,
  AccessControlForm,
  AccessControlTable,
  AdaptivePolicySetForm,
  CertificateAuthorityForm,
  CertificateTemplateForm,
  ClientIsolationForm,
  ConnectionMeteringFormMode,
  DHCPDetail,
  DHCPForm,
  DpskForm,
  MacRegistrationListForm,
  NetworkForm,
  PortalForm,
  ResidentPortalForm,
  RogueAPDetectionDetailView,
  RogueAPDetectionForm,
  RogueAPDetectionTable,
  SyslogDetailView, SyslogForm,
  VLANPoolForm,
  VLANPoolDetail,
  WifiCallingConfigureForm, WifiCallingDetailView,
  WifiCallingForm,
  WifiOperatorForm,
  ConfigurationProfileForm,
  CliTemplateForm,
  CliProfileForm,
  IdentityProviderForm
} from '@acx-ui/rc/components'
import {
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getAdaptivePolicyDetailRoutePath,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  getSelectServiceRoutePath,
  getServiceCatalogRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  CertificateCategoryType
} from '@acx-ui/rc/utils'
import { Navigate, Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'
import { Provider }                                    from '@acx-ui/store'
import { WifiScopes, SwitchScopes }                    from '@acx-ui/types'
import { AuthRoute }                                   from '@acx-ui/user'

import Edges                                        from './pages/Devices/Edge'
import AddEdge                                      from './pages/Devices/Edge/AddEdge'
import AddEdgeCluster                               from './pages/Devices/Edge/AddEdgeCluster'
import EdgeClusterConfigWizard                      from './pages/Devices/Edge/ClusterConfigWizard'
import EdgeDetails                                  from './pages/Devices/Edge/EdgeDetails'
import EditEdge                                     from './pages/Devices/Edge/EdgeDetails/EditEdge'
import EditEdgeCluster                              from './pages/Devices/Edge/EditEdgeCluster'
import { SwitchList, SwitchTabsEnum }               from './pages/Devices/Switch'
import { StackForm }                                from './pages/Devices/Switch/StackForm'
import SwitchDetails                                from './pages/Devices/Switch/SwitchDetails'
import { SwitchClientDetailsPage }                  from './pages/Devices/Switch/SwitchDetails/SwitchClientsTab/SwitchClientDetailsPage'
import { SwitchForm }                               from './pages/Devices/Switch/SwitchForm'
import { AccessPointList, WifiTabsEnum }            from './pages/Devices/Wifi'
import ApDetails                                    from './pages/Devices/Wifi/ApDetails'
import { ApEdit }                                   from './pages/Devices/Wifi/ApEdit'
import { ApForm }                                   from './pages/Devices/Wifi/ApForm'
import ApGroupDetails                               from './pages/Devices/Wifi/ApGroupDetails'
import { ApGroupEdit }                              from './pages/Devices/Wifi/ApGroupEdit'
import Wired                                        from './pages/Networks/wired'
import { NetworkTabsEnum, NetworksList }            from './pages/Networks/wireless'
import NetworkDetails                               from './pages/Networks/wireless/NetworkDetails'
import AAATable                                     from './pages/Policies/AAA/AAATable/AAATable'
import AdaptivePolicyList, { AdaptivePolicyTabKey } from './pages/Policies/AdaptivePolicy'
import AdaptivePolicyDetail                         from './pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyDetail/AdaptivePolicyDetail'
import AdaptivePolicyForm                           from './pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyForm/AdaptivePolicyForm'
import AdaptivePolicySetDetail                      from './pages/Policies/AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetDetail/AdaptivePolicySetDetail'
import RadiusAttributeGroupDetail
  // eslint-disable-next-line max-len
  from './pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupDetail/RadiusAttributeGroupDetail'
import RadiusAttributeGroupForm
  // eslint-disable-next-line max-len
  from './pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeGroupForm'
import CertificateForm                      from './pages/Policies/CertificateTemplate/CertificateForm/CertificateForm'
import CertificateTemplateDetail            from './pages/Policies/CertificateTemplate/CertificateTemplateDetail/CertificateTemplateDetail'
import CertificateTemplateList              from './pages/Policies/CertificateTemplate/CertificateTemplateList/CertificateTemplateList'
import ClientIsolationDetail                from './pages/Policies/ClientIsolation/ClientIsolationDetail/ClientIsolationDetail'
import ClientIsolationTable                 from './pages/Policies/ClientIsolation/ClientIsolationTable/ClientIsolationTable'
import ConnectionMeteringDetail             from './pages/Policies/ConnectionMetering/ConnectionMeteringDetail'
import ConnectionMeteringPageForm           from './pages/Policies/ConnectionMetering/ConnectionMeteringPageForm'
import ConnectionMeteringTable              from './pages/Policies/ConnectionMetering/ConnectionMeteringTable'
import IdentityProviderDetail               from './pages/Policies/IdentityProvider/IdentityProviderDetail/IdentityProviderDetail'
import IdentityProviderTable                from './pages/Policies/IdentityProvider/IdentityProviderTable/IdentityProviderTable'
import MacRegistrationListDetails           from './pages/Policies/MacRegistrationList/MacRegistrarionListDetails/MacRegistrarionListDetails'
import MacRegistrationListsTable            from './pages/Policies/MacRegistrationList/MacRegistrarionListTable'
import MyPolicies                           from './pages/Policies/MyPolicies'
import SelectPolicyForm                     from './pages/Policies/SelectPolicyForm'
import SnmpAgentDetail                      from './pages/Policies/SnmpAgent/SnmpAgentDetail/SnmpAgentDetail'
import SnmpAgentForm                        from './pages/Policies/SnmpAgent/SnmpAgentForm/SnmpAgentForm'
import SnmpAgentTable                       from './pages/Policies/SnmpAgent/SnmpAgentTable/SnmpAgentTable'
import SyslogTable                          from './pages/Policies/Syslog/SyslogTable/SyslogTable'
import AddTunnelProfile                     from './pages/Policies/TunnelProfile/AddTunnelProfile'
import EditTunnelProfile                    from './pages/Policies/TunnelProfile/EditTunnelProfile'
import TunnelProfileDetail                  from './pages/Policies/TunnelProfile/TunnelProfileDetail'
import TunnelProfileTable                   from './pages/Policies/TunnelProfile/TunnelProfileTable'
import VLANPoolTable                        from './pages/Policies/VLANPool/VLANPoolTable/VLANPoolTable'
import { WifiOperatorDetailView }           from './pages/Policies/WifiOperator/WifiOperatorDetail/WifiOperatorDetailView'
import WifiOperatorTable                    from './pages/Policies/WifiOperator/WifiOperatorTable/WifiOperatorTable'
import DHCPTable                            from './pages/Services/DHCP/DHCPTable/DHCPTable'
import AddDHCP                              from './pages/Services/DHCP/Edge/AddDHCP'
import EdgeDHCPDetail                       from './pages/Services/DHCP/Edge/DHCPDetail'
import EdgeDhcpTable                        from './pages/Services/DHCP/Edge/DHCPTable'
import EditDhcp                             from './pages/Services/DHCP/Edge/EditDHCP'
import DpskDetails                          from './pages/Services/Dpsk/DpskDetail/DpskDetails'
import DpskTable                            from './pages/Services/Dpsk/DpskTable/DpskTable'
import AddFirewall                          from './pages/Services/EdgeFirewall/AddFirewall'
import EditFirewall                         from './pages/Services/EdgeFirewall/EditFirewall'
import FirewallDetail                       from './pages/Services/EdgeFirewall/FirewallDetail'
import FirewallTable                        from './pages/Services/EdgeFirewall/FirewallTable'
import AddEdgeSdLan                         from './pages/Services/EdgeSdLan/AddEdgeSdLan'
import EdgeSdLanDetail                      from './pages/Services/EdgeSdLan/EdgeSdLanDetail'
import EdgeSdLanTable                       from './pages/Services/EdgeSdLan/EdgeSdLanTable'
import EditEdgeSdLan                        from './pages/Services/EdgeSdLan/EditEdgeSdLan'
import AddEdgeSdLanP2                       from './pages/Services/EdgeSdLanP2/AddEdgeSdLan'
import EdgeSdLanDetailP2                    from './pages/Services/EdgeSdLanP2/EdgeSdLanDetail'
import EdgeSdLanTableP2                     from './pages/Services/EdgeSdLanP2/EdgeSdLanTable'
import EditEdgeSdLanP2                      from './pages/Services/EdgeSdLanP2/EditEdgeSdLan'
import MdnsProxyDetail                      from './pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail'
import MdnsProxyForm                        from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import MdnsProxyTable                       from './pages/Services/MdnsProxy/MdnsProxyTable/MdnsProxyTable'
import MyServices                           from './pages/Services/MyServices'
import NetworkSegAuthDetail                 from './pages/Services/NetworkSegWebAuth/NetworkSegAuthDetail'
import NetworkSegAuthForm                   from './pages/Services/NetworkSegWebAuth/NetworkSegAuthForm'
import NetworkSegAuthTable                  from './pages/Services/NetworkSegWebAuth/NetworkSegAuthTable'
import AddPersonalIdentitNetwork            from './pages/Services/PersonalIdentityNetwork/AddPersonalIdentityNetwork'
import EditPersonalIdentityNetwork          from './pages/Services/PersonalIdentityNetwork/EditPersonalIdentityNetwork'
import PersonalIdentityNetworkDetail        from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkDetail'
import PersonalIdentityNetworkTable         from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkTable'
import PortalServiceDetail                  from './pages/Services/Portal/PortalDetail'
import PortalTable                          from './pages/Services/Portal/PortalTable'
import ResidentPortalDetail                 from './pages/Services/ResidentPortal/ResidentPortalDetail/ResidentPortalDetail'
import ResidentPortalTable                  from './pages/Services/ResidentPortal/ResidentPortalTable/ResidentPortalTable'
import SelectServiceForm                    from './pages/Services/SelectServiceForm'
import ServiceCatalog                       from './pages/Services/ServiceCatalog'
import WifiCallingTable                     from './pages/Services/WifiCalling/WifiCallingTable/WifiCallingTable'
import Timeline                             from './pages/Timeline'
import PersonaPortal                        from './pages/Users/Persona'
import PersonaDetails                       from './pages/Users/Persona/PersonaDetails'
import PersonaGroupDetails                  from './pages/Users/Persona/PersonaGroupDetails'
import SwitchClientList                     from './pages/Users/Switch/ClientList'
import WifiClientDetails                    from './pages/Users/Wifi/ClientDetails'
import { WifiClientList, WirelessTabsEnum } from './pages/Users/Wifi/ClientList'
import GuestManagerPage                     from './pages/Users/Wifi/GuestManagerPage'

export default function RcRoutes () {
  const routes = rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='devices/*' element={<DeviceRoutes />} />
      <Route path='networks/*' element={<NetworkRoutes />} />
      <Route path='services/*' element={<ServiceRoutes />} />
      <Route path='policies/*' element={<PolicyRoutes />} />
      <Route path='users/*' element={<UserRoutes />} />
      <Route path='timeline/*' element={<TimelineRoutes />} />
    </Route>
  )
  return (
    <Provider children={routes} />
  )
}

function DeviceRoutes () {
  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='devices' element={<TenantNavigate replace to='/devices/wifi' />} />
      <Route path='devices/wifi' element={<AccessPointList tab={WifiTabsEnum.LIST} />} />
      <Route
        path='devices/wifi/apgroups'
        element={<AccessPointList tab={WifiTabsEnum.AP_GROUP}/>} />
      <Route
        path='devices/wifi/reports/aps'
        element={<AccessPointList tab={WifiTabsEnum.AP_REPORT} />} />
      <Route
        path='devices/wifi/reports/airtime'
        element={<AccessPointList tab={WifiTabsEnum.AIRTIME_REPORT} />} />
      <Route path='devices/wifi/:action' element={<ApForm />} />
      <Route path='devices/wifi/:serialNumber/:action/:activeTab' element={<ApEdit />} />
      <Route
        path='devices/wifi/:serialNumber/:action/:activeTab/:activeSubTab'
        element={<ApEdit />}
      />
      <Route path='devices/apgroups/:apGroupId/details/:activeTab' element={<ApGroupDetails />}/>
      <Route path='devices/apgroups/:apGroupId/:action/:activeTab' element={<ApGroupEdit />} />
      <Route path='devices/apgroups/:apGroupId/:action' element={<ApGroupEdit />} />
      <Route path='devices/apgroups/:action' element={<ApGroupEdit />} />
      <Route
        path='devices/wifi/:apId/details/:activeTab'
        element={<ApDetails />} />
      <Route
        path='devices/wifi/:apId/details/:activeTab/:activeSubTab'
        element={<ApDetails />} />
      <Route
        path='devices/wifi/:apId/details/:activeTab/:activeSubTab/:categoryTab'
        element={<ApDetails />} />
      <Route
        path='devices/switch/:switchId/:serialNumber/details/:activeTab'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchDetails />
          </AuthRoute>
        }
      />
      <Route
        path='devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchDetails />
          </AuthRoute>
        }
      />
      <Route
        path='devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab/:categoryTab'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchDetails />
          </AuthRoute>
        }
      />
      <Route path='devices/edge/add' element={<AddEdge />} />
      <Route path='devices/edge/cluster/add' element={<AddEdgeCluster />} />
      <Route
        path='devices/edge/:serialNumber/edit/:activeTab'
        element={<EditEdge />} />
      <Route
        path='devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        element={<EditEdge />} />
      <Route path='devices/edge/:serialNumber/details/:activeTab'
        element={<EdgeDetails />} />
      <Route path='devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        element={<EdgeDetails />} />
      <Route path='devices/edge/cluster/:clusterId/edit/:activeTab'
        element={<EditEdgeCluster />} />
      <Route path='devices/edge/cluster/:clusterId/configure'
        element={<EdgeClusterConfigWizard />} />
      <Route path='devices/edge/cluster/:clusterId/configure/:settingType'
        element={<EdgeClusterConfigWizard />} />

      <Route path='devices/switch'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchList tab={SwitchTabsEnum.LIST} />
          </AuthRoute>
        } />
      <Route path='devices/switch/reports/wired'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchList tab={SwitchTabsEnum.WIRED_REPORT} />
          </AuthRoute>
        } />
      <Route path='devices/switch/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE, SwitchScopes.UPDATE]}>
            <SwitchForm />
          </AuthRoute>
        } />
      <Route path='devices/switch/:switchId/:serialNumber/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE, SwitchScopes.UPDATE]}>
            <SwitchForm />
          </AuthRoute>
        } />
      <Route path='devices/switch/stack/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE, SwitchScopes.UPDATE]}>
            <StackForm />
          </AuthRoute>
        } />
      <Route path='devices/switch/stack/:venueId/:stackList/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE, SwitchScopes.UPDATE]}>
            <StackForm />
          </AuthRoute>
        } />
      <Route path='devices/switch/:switchId/:serialNumber/stack/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE, SwitchScopes.UPDATE]}>
            <StackForm />
          </AuthRoute>
        } />

      <Route path='devices/edge' element={<Edges />} />
    </Route>
  )
}

function NetworkRoutes () {
  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='networks' element={<TenantNavigate replace to='/networks/wireless' />} />
      <Route path='networks/wireless' element={<NetworksList tab={NetworkTabsEnum.LIST} />} />
      <Route path='networks/wireless/reports/wlans'
        element={<NetworksList tab={NetworkTabsEnum.WLANS_REPORT} />} />
      <Route path='networks/wireless/reports/applications'
        element={<NetworksList tab={NetworkTabsEnum.APPLICATIONS_REPORT} />} />
      <Route path='networks/wireless/reports/wireless'
        element={<NetworksList tab={NetworkTabsEnum.WIRELESS_REPORT} />} />
      <Route path='networks/wireless/add' element={<NetworkForm />} />
      <Route
        path='networks/wireless/:networkId/network-details/:activeTab'
        element={<NetworkDetails />}
      />
      <Route
        path='networks/wireless/:networkId/network-details/:activeTab/:activeSubTab'
        element={<NetworkDetails />}
      />
      <Route path='networks/wired/:configType/add'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE]}>
            <CliTemplateForm />
          </AuthRoute>
        } />
      <Route
        path='networks/wired/:configType/:templateId/:action'
        element={<CliTemplateForm />}
      />
      <Route
        path='networks/wireless/:networkId/:action'
        element={<NetworkForm />}
      />
      <Route path='networks/wired' element={<Wired />} />
      <Route path='networks/wired/:activeTab'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <Wired />
          </AuthRoute>} />
      <Route
        path='networks/wired/profiles/add'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE]}>
            <ConfigurationProfileForm />
          </AuthRoute>
        }
      />
      <Route
        path='networks/wired/profiles/regular/:profileId/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.UPDATE]}>
            <ConfigurationProfileForm />
          </AuthRoute>
        }
      />
      <Route path='networks/wired/:configType/cli/add'
        element={
          <AuthRoute scopes={[SwitchScopes.CREATE]}>
            <CliProfileForm />
          </AuthRoute>
        } />
      <Route
        path='networks/wired/:configType/cli/:profileId/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.UPDATE]}>
            <CliProfileForm />
          </AuthRoute>
        }
      />
    </Route>
  )
}

const edgeSdLanRoutes = (isP2Enabled: boolean) => {
  return <>
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
        oper: ServiceOperation.LIST })}
      element={isP2Enabled ? <EdgeSdLanTableP2 /> : <EdgeSdLanTable />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
        oper: ServiceOperation.CREATE })}
      element={isP2Enabled ? <AddEdgeSdLanP2 /> : <AddEdgeSdLan />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
        oper: ServiceOperation.EDIT })}
      element={isP2Enabled ? <EditEdgeSdLanP2 /> : <EditEdgeSdLan />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
        oper: ServiceOperation.DETAIL })}
      element={isP2Enabled ? <EdgeSdLanDetailP2 /> : <EdgeSdLanDetail />}
    />
  </>
}

const edgeDhcpRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.CREATE
      })}
      element={<AddDHCP/>}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.LIST
      })}
      element={<EdgeDhcpTable/>}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.DETAIL
      })}
      element={<EdgeDHCPDetail/>}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.EDIT
      })}
      element={<EditDhcp />}
    />
  </>
}

const edgeFirewallRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.LIST
      })}
      element={<FirewallTable />}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.DETAIL
      })}
      element={<FirewallDetail />}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.CREATE
      })}
      element={<AddFirewall />}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.EDIT
      })}
      element={<EditFirewall />}
    />
  </>
}

const edgePinRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.CREATE })}
      element={<AddPersonalIdentitNetwork />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.LIST })}
      element={<PersonalIdentityNetworkTable />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.DETAIL })}
      element={<PersonalIdentityNetworkDetail />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.EDIT })}
      element={<EditPersonalIdentityNetwork />}
    />
  </>
}

function ServiceRoutes () {
  const isEdgeSdLanEnabled = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaEnabled = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsSplitOn(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsSplitOn(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsSplitOn(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE)

  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='services'
        element={<TenantNavigate replace to={getServiceListRoutePath(true)} />}
      />
      <Route path={getServiceListRoutePath()} element={<MyServices />} />
      <Route path={getSelectServiceRoutePath()} element={<SelectServiceForm />} />
      <Route path={getServiceCatalogRoutePath()} element={<ServiceCatalog />} />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })}
        element={<MdnsProxyForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })}
        element={<MdnsProxyForm editMode={true} />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.DETAIL })}
        element={<MdnsProxyDetail />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.LIST })}
        element={<MdnsProxyTable />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
        element={<WifiCallingForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={<WifiCallingConfigureForm />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={<WifiCallingDetailView />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.LIST })}
        element={<WifiCallingTable/>}
      />
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
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })}
        element={<DHCPTable/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })}
        element={<DpskTable />}
      />
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

      {(isEdgePinReady) && edgePinRoutes()}

      <Route
        path={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,
          oper: ServiceOperation.CREATE })}
        element={<NetworkSegAuthForm />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,
          oper: ServiceOperation.EDIT })}
        element={<NetworkSegAuthForm editMode={true} />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,
          oper: ServiceOperation.DETAIL })}
        element={<NetworkSegAuthDetail/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,
          oper: ServiceOperation.LIST })}
        element={<NetworkSegAuthTable/>}
      />
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
        element={<PortalServiceDetail/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.LIST })}
        element={<PortalTable/>}
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.RESIDENT_PORTAL,
          oper: ServiceOperation.LIST })}
        element={<ResidentPortalTable />}
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.RESIDENT_PORTAL,
          oper: ServiceOperation.DETAIL })}
        element={<ResidentPortalDetail />}
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.RESIDENT_PORTAL,
          oper: ServiceOperation.CREATE })}
        element={<ResidentPortalForm />}
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.RESIDENT_PORTAL,
          oper: ServiceOperation.EDIT })}
        element={<ResidentPortalForm editMode={true} />}
      />

      {(isEdgeHaReady && isEdgeDhcpHaReady)
        && edgeDhcpRoutes()}

      {(isEdgeHaReady && isEdgeFirewallHaReady)
        && edgeFirewallRoutes()}

      {(isEdgeSdLanHaEnabled || isEdgeSdLanEnabled)
        && edgeSdLanRoutes(isEdgeSdLanHaEnabled)}
    </Route>
  )
}

function PolicyRoutes () {
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)

  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path={getPolicyListRoutePath()} element={<MyPolicies />} />
      <Route path={getSelectPolicyRoutePath()} element={<SelectPolicyForm />} />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })}
        element={<RogueAPDetectionForm edit={false}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.EDIT })}
        element={<RogueAPDetectionForm edit={true}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.DETAIL })}
        element={<RogueAPDetectionDetailView />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })}
        element={<RogueAPDetectionTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
        element={<AAAForm edit={false}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })}
        element={<AAAForm edit={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.DETAIL })}
        element={<AAAPolicyDetail/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })}
        element={<AAATable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })}
        element={<SyslogForm edit={false}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.EDIT })}
        element={<SyslogForm edit={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST })}
        element={<SyslogTable />} />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.DETAIL })}
        element={<SyslogDetailView />}
      />
      {isCloudpathBetaEnabled ? <>
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.DETAIL })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <MacRegistrationListDetails />
            </AuthRoute>}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <MacRegistrationListsTable />
            </AuthRoute>}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <MacRegistrationListForm />
            </AuthRoute>
          } />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <MacRegistrationListForm editMode={true}/>
            </AuthRoute>
          }
        /> </> : <></> }
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })}
        element={<VLANPoolForm edit={false}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.EDIT })}
        element={<VLANPoolForm edit={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.DETAIL })}
        element={<VLANPoolDetail/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })}
        element={<VLANPoolTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })}
        element={<AccessControlForm editMode={false}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT })}
        element={<AccessControlForm editMode={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.DETAIL })}
        element={<AccessControlDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })}
        element={<AccessControlTable />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE })}
        element={<ClientIsolationForm editMode={false}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.EDIT })}
        element={<ClientIsolationForm editMode={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })}
        element={<ClientIsolationTable />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL })}
        element={<ClientIsolationDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })}
        element={<WifiOperatorTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.CREATE })}
        element={<WifiOperatorForm editMode={false}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.EDIT })}
        element={<WifiOperatorForm editMode={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.DETAIL })}
        element={<WifiOperatorDetailView />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })}
        element={<IdentityProviderForm editMode={false} />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.EDIT })}
        element={<IdentityProviderForm editMode={true} />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })}
        element={<IdentityProviderTable />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.DETAIL })}
        element={<IdentityProviderDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })}
        element={<SnmpAgentForm editMode={false}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.EDIT })}
        element={<SnmpAgentForm editMode={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })}
        element={<SnmpAgentTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.DETAIL })}
        element={<SnmpAgentDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.CREATE })}
        element={<AddTunnelProfile />} />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.LIST })}
        element={<TunnelProfileTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.DETAIL })}
        element={<TunnelProfileDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.TUNNEL_PROFILE, oper: PolicyOperation.EDIT })}
        element={<EditTunnelProfile />}
      />
      {isConnectionMeteringEnabled && <>
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.LIST })}
          element={<ConnectionMeteringTable />}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.CREATE })}
          element={<ConnectionMeteringPageForm mode={ConnectionMeteringFormMode.CREATE} />}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.EDIT })}
          element={<ConnectionMeteringPageForm mode={ConnectionMeteringFormMode.EDIT} />}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.DETAIL })}
          element={<ConnectionMeteringDetail/>}
        />
      </>}
      {isCloudpathBetaEnabled && <>
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP}/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.CREATE })}
          element={<RadiusAttributeGroupForm />}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.EDIT })}
          element={<RadiusAttributeGroupForm editMode={true}/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.DETAIL })}
          element={<RadiusAttributeGroupDetail />} />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY}/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.CREATE })}
          element={<AdaptivePolicyForm/>}
        />
        <Route
          path={getAdaptivePolicyDetailRoutePath(PolicyOperation.EDIT)}
          element={<AdaptivePolicyForm editMode={true}/>}
        />
        <Route
          path={getAdaptivePolicyDetailRoutePath(PolicyOperation.DETAIL)}
          element={<AdaptivePolicyDetail/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE })}
          element={<AdaptivePolicySetForm/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.EDIT })}
          element={<AdaptivePolicySetForm editMode={true}/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.DETAIL })}
          element={<AdaptivePolicySetDetail/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET}/>}
        /> </>
      }
      {isCertificateTemplateEnabled && <>
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.LIST })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_TEMPLATE}/>
            </AuthRoute>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.LIST })}
          // eslint-disable-next-line max-len
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_AUTHORITY}/>
            </AuthRoute>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE}/>
            </AuthRoute>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE })}
          element={
            <AuthRoute scopes={[WifiScopes.CREATE]}>
              <CertificateTemplateForm editMode={false}/>
            </AuthRoute>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.EDIT })}
          element={
            <AuthRoute scopes={[WifiScopes.UPDATE]}>
              <CertificateTemplateForm editMode={true}/>
            </AuthRoute>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE })}
          element={
            <AuthRoute scopes={[WifiScopes.UPDATE]}>
              <CertificateAuthorityForm/>
            </AuthRoute>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE })}
          element={
            <AuthRoute scopes={[WifiScopes.CREATE]}>
              <CertificateForm/>
            </AuthRoute>}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.DETAIL })}
          element={
            <AuthRoute scopes={[WifiScopes.READ]}>
              <CertificateTemplateDetail/>
            </AuthRoute>}
        />
      </>
      }
    </Route>
  )
}

function UserRoutes () {
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='users/guestsManager' element={<GuestManagerPage />} />
      <Route path='users/dpskAdmin' element={<DpskTable />} />
      <Route path='users' element={<TenantNavigate replace to='/users/wifi/clients' />} />
      <Route path='users/wifi' element={<TenantNavigate replace to='/users/wifi/clients' />} />
      <Route path='users/wifi/clients'
        element={<WifiClientList tab={WirelessTabsEnum.CLIENTS} />} />
      <Route path='users/wifi/guests'
        element={<WifiClientList tab={WirelessTabsEnum.GUESTS} />} />
      <Route path='users/wifi/reports/clients'
        element={<WifiClientList tab={WirelessTabsEnum.CLIENT_REPORT} />} />
      <Route path='users/wifi/:activeTab/:clientId/details'>
        <Route path='' element={<Navigate replace to='./overview' />} />
        <Route path=':activeTab' element={<WifiClientDetails />} />
        <Route path=':activeTab/:activeSubTab' element={<WifiClientDetails />} />
      </Route>
      <Route path='users/switch' element={<TenantNavigate replace to='/users/switch/clients' />} />
      <Route path='users/switch/clients'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchClientList />
          </AuthRoute>
        } />
      <Route path='users/switch/clients/:clientId'
        element={
          <AuthRoute scopes={[SwitchScopes.READ]}>
            <SwitchClientDetailsPage />
          </AuthRoute>
        } />
      {(isCloudpathBetaEnabled)
        ? <><Route
          path='users/identity-management'
          element={<TenantNavigate replace to='/users/identity-management/identity-group'/>}/><Route
          path='users/identity-management/:activeTab'
          element={<PersonaPortal/>}/><Route
          path='users/identity-management/identity-group/:personaGroupId'
          element={<PersonaGroupDetails/>}/><Route
          path='users/identity-management/identity-group/:personaGroupId/identity/:personaId'
          element={<PersonaDetails/>}/></>
        : <></>}
    </Route>
  )
}

function TimelineRoutes () {
  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='timeline' element={<TenantNavigate replace to='/timeline/activities' />} />
      <Route path='timeline/:activeTab' element={<Timeline />} />
    </Route>
  )
}
