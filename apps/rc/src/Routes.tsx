
import { PageNotFound }                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AAAForm, AAAPolicyDetail,
  AccessControlDetail,
  AccessControlForm,
  AccessControlTable,
  AdaptivePolicySetForm,
  ApGroupEdit,
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
  IdentityProviderForm,
  LbsServerProfileForm,
  ApGroupDetails,
  useIsEdgeFeatureReady,
  SoftGreForm,
  useIsEdgeFeatureReady,
  AddEthernetPortProfile,
  EditEthernetPortProfile,
  EthernetPortProfileDetail
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
  CertificateCategoryType,
  hasDpskAccess,
  hasCloudpathAccess
} from '@acx-ui/rc/utils'
import { Navigate, Route, TenantNavigate, rootRoutes } from '@acx-ui/react-router-dom'
import { Provider }                                    from '@acx-ui/store'
import { EdgeScopes, WifiScopes, SwitchScopes }        from '@acx-ui/types'
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
import CertificateForm                                                  from './pages/Policies/CertificateTemplate/CertificateForm/CertificateForm'
import CertificateTemplateDetail                                        from './pages/Policies/CertificateTemplate/CertificateTemplateDetail/CertificateTemplateDetail'
import CertificateTemplateList                                          from './pages/Policies/CertificateTemplate/CertificateTemplateList/CertificateTemplateList'
import ClientIsolationDetail                                            from './pages/Policies/ClientIsolation/ClientIsolationDetail/ClientIsolationDetail'
import ClientIsolationTable                                             from './pages/Policies/ClientIsolation/ClientIsolationTable/ClientIsolationTable'
import ConnectionMeteringDetail                                         from './pages/Policies/ConnectionMetering/ConnectionMeteringDetail'
import ConnectionMeteringPageForm                                       from './pages/Policies/ConnectionMetering/ConnectionMeteringPageForm'
import ConnectionMeteringTable                                          from './pages/Policies/ConnectionMetering/ConnectionMeteringTable'
import EthernetPortProfileTable                                         from './pages/Policies/EthernetPortProfile/EthernetPortProfileTable'
import IdentityProviderDetail                                           from './pages/Policies/IdentityProvider/IdentityProviderDetail/IdentityProviderDetail'
import IdentityProviderTable                                            from './pages/Policies/IdentityProvider/IdentityProviderTable/IdentityProviderTable'
import LbsServerProfileDetail                                           from './pages/Policies/LbsServerProfile/LbsServerProfileDetail/LbsServerProfileDetail'
import LbsServerProfileTable                                            from './pages/Policies/LbsServerProfile/LbsServerProfileTable/LbsServerProfileTable'
import MacRegistrationListDetails                                       from './pages/Policies/MacRegistrationList/MacRegistrarionListDetails/MacRegistrarionListDetails'
import MacRegistrationListsTable                                        from './pages/Policies/MacRegistrationList/MacRegistrarionListTable'
import MyPolicies                                                       from './pages/Policies/MyPolicies'
import AddEdgeQosBandwidth                                              from './pages/Policies/QosBandwidth/Edge/AddQosBandwidth'
import EditEdgeQosBandwidth                                             from './pages/Policies/QosBandwidth/Edge/EditQosBandwidth'
import EdgeQosBandwidthDetail                                           from './pages/Policies/QosBandwidth/Edge/QosBandwidthDetail'
import EdgeQosBandwidthTable                                            from './pages/Policies/QosBandwidth/Edge/QosBandwidthTable'
import SelectPolicyForm                                                 from './pages/Policies/SelectPolicyForm'
import SnmpAgentDetail                                                  from './pages/Policies/SnmpAgent/SnmpAgentDetail/SnmpAgentDetail'
import SnmpAgentForm                                                    from './pages/Policies/SnmpAgent/SnmpAgentForm/SnmpAgentForm'
import SnmpAgentTable                                                   from './pages/Policies/SnmpAgent/SnmpAgentTable/SnmpAgentTable'
import SoftGreDetail                                                    from './pages/Policies/SoftGre/SoftGreDetail'
import SoftGreTable                                                     from './pages/Policies/SoftGre/SoftGreTable'
import SyslogTable                                                      from './pages/Policies/Syslog/SyslogTable/SyslogTable'
import AddTunnelProfile                                                 from './pages/Policies/TunnelProfile/AddTunnelProfile'
import EditTunnelProfile                                                from './pages/Policies/TunnelProfile/EditTunnelProfile'
import TunnelProfileDetail                                              from './pages/Policies/TunnelProfile/TunnelProfileDetail'
import TunnelProfileTable                                               from './pages/Policies/TunnelProfile/TunnelProfileTable'
import VLANPoolTable                                                    from './pages/Policies/VLANPool/VLANPoolTable/VLANPoolTable'
import { WifiOperatorDetailView }                                       from './pages/Policies/WifiOperator/WifiOperatorDetail/WifiOperatorDetailView'
import WifiOperatorTable                                                from './pages/Policies/WifiOperator/WifiOperatorTable/WifiOperatorTable'
import DHCPTable                                                        from './pages/Services/DHCP/DHCPTable/DHCPTable'
import AddDHCP                                                          from './pages/Services/DHCP/Edge/AddDHCP'
import EdgeDHCPDetail                                                   from './pages/Services/DHCP/Edge/DHCPDetail'
import EdgeDhcpTable                                                    from './pages/Services/DHCP/Edge/DHCPTable'
import EditDhcp                                                         from './pages/Services/DHCP/Edge/EditDHCP'
import DpskDetails                                                      from './pages/Services/Dpsk/DpskDetail/DpskDetails'
import DpskTable                                                        from './pages/Services/Dpsk/DpskTable/DpskTable'
import AddFirewall                                                      from './pages/Services/EdgeFirewall/AddFirewall'
import EditFirewall                                                     from './pages/Services/EdgeFirewall/EditFirewall'
import FirewallDetail                                                   from './pages/Services/EdgeFirewall/FirewallDetail'
import FirewallTable                                                    from './pages/Services/EdgeFirewall/FirewallTable'
import { AddEdgeSdLan, EditEdgeSdLan, EdgeSdLanDetail, EdgeSdLanTable } from './pages/Services/EdgeSdLan/index'
import MdnsProxyDetail                                                  from './pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail'
import MdnsProxyForm                                                    from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import MdnsProxyTable                                                   from './pages/Services/MdnsProxy/MdnsProxyTable/MdnsProxyTable'
import MyServices                                                       from './pages/Services/MyServices'
import NetworkSegAuthDetail                                             from './pages/Services/NetworkSegWebAuth/NetworkSegAuthDetail'
import NetworkSegAuthForm                                               from './pages/Services/NetworkSegWebAuth/NetworkSegAuthForm'
import NetworkSegAuthTable                                              from './pages/Services/NetworkSegWebAuth/NetworkSegAuthTable'
import AddPersonalIdentitNetwork                                        from './pages/Services/PersonalIdentityNetwork/AddPersonalIdentityNetwork'
import EditPersonalIdentityNetwork                                      from './pages/Services/PersonalIdentityNetwork/EditPersonalIdentityNetwork'
import PersonalIdentityNetworkDetail                                    from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkDetail'
import PersonalIdentityNetworkTable                                     from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkTable'
import PortalServiceDetail                                              from './pages/Services/Portal/PortalDetail'
import PortalTable                                                      from './pages/Services/Portal/PortalTable'
import ResidentPortalDetail                                             from './pages/Services/ResidentPortal/ResidentPortalDetail/ResidentPortalDetail'
import ResidentPortalTable                                              from './pages/Services/ResidentPortal/ResidentPortalTable/ResidentPortalTable'
import SelectServiceForm                                                from './pages/Services/SelectServiceForm'
import ServiceCatalog                                                   from './pages/Services/ServiceCatalog'
import WifiCallingTable                                                 from './pages/Services/WifiCalling/WifiCallingTable/WifiCallingTable'
import Timeline                                                         from './pages/Timeline'
import PersonaPortal                                                    from './pages/Users/Persona'
import PersonaDetails                                                   from './pages/Users/Persona/PersonaDetails'
import PersonaGroupDetails                                              from './pages/Users/Persona/PersonaGroupDetails'
import SwitchClientList                                                 from './pages/Users/Switch/ClientList'
import WifiClientDetails                                                from './pages/Users/Wifi/ClientDetails'
import { WifiClientList, WirelessTabsEnum }                             from './pages/Users/Wifi/ClientList'
import GuestManagerPage                                                 from './pages/Users/Wifi/GuestManagerPage'



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
      <Route
        path='devices/wifi/:action'
        element={
          <AuthRoute scopes={[WifiScopes.CREATE, WifiScopes.UPDATE]}>
            <ApForm />
          </AuthRoute>
        } />
      <Route
        path='devices/wifi/:serialNumber/:action/:activeTab'
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <ApEdit />
          </AuthRoute>
        } />
      <Route
        path='devices/wifi/:serialNumber/:action/:activeTab/:activeSubTab'
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <ApEdit />
          </AuthRoute>
        } />
      <Route path='devices/apgroups/:apGroupId/details/:activeTab' element={<ApGroupDetails />}/>
      <Route
        path='devices/apgroups/:apGroupId/:action/:activeTab'
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <ApGroupEdit />
          </AuthRoute>
        } />
      <Route
        path='devices/apgroups/:apGroupId/:action'
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <ApGroupEdit />
          </AuthRoute>
        } />
      <Route
        path='devices/apgroups/:action'
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <ApGroupEdit />
          </AuthRoute>
        } />
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
        element={<SwitchDetails />}
      />
      <Route
        path='devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab'
        element={<SwitchDetails />}
      />
      <Route
        path='devices/switch/:switchId/:serialNumber/details/:activeTab/:activeSubTab/:categoryTab'
        element={<SwitchDetails />}
      />
      <Route path='devices/edge' element={<Edges />} />
      <Route
        path='devices/edge/add'
        element={<AuthRoute scopes={[EdgeScopes.CREATE]}>
          <AddEdge />
        </AuthRoute>}/>
      <Route
        path='devices/edge/cluster/add'
        element={<AuthRoute scopes={[EdgeScopes.CREATE]}>
          <AddEdgeCluster />
        </AuthRoute>}/>
      <Route
        path='devices/edge/:serialNumber/edit/:activeTab'
        element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
          <EditEdge />
        </AuthRoute>}/>
      <Route
        path='devices/edge/:serialNumber/edit/:activeTab/:activeSubTab'
        element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
          <EditEdge />
        </AuthRoute>} />
      <Route path='devices/edge/:serialNumber/details/:activeTab'
        element={<EdgeDetails />} />
      <Route path='devices/edge/:serialNumber/details/:activeTab/:activeSubTab'
        element={<EdgeDetails />} />
      <Route path='devices/edge/cluster/:clusterId/edit/:activeTab'
        element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
          <EditEdgeCluster />
        </AuthRoute>} />
      <Route path='devices/edge/cluster/:clusterId/configure'
        element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
          <EdgeClusterConfigWizard />
        </AuthRoute>} />
      <Route path='devices/edge/cluster/:clusterId/configure/:settingType'
        element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
          <EdgeClusterConfigWizard />
        </AuthRoute>} />

      <Route path='devices/switch'
        element={
          <SwitchList tab={SwitchTabsEnum.LIST} />
        } />
      <Route path='devices/switch/reports/wired'
        element={
          <SwitchList tab={SwitchTabsEnum.WIRED_REPORT} />
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
          <AuthRoute scopes={[SwitchScopes.CREATE]} requireCrossVenuesPermission>
            <CliTemplateForm />
          </AuthRoute>
        }
      />
      <Route
        path='networks/wired/:configType/:templateId/:action'
        element={
          <AuthRoute scopes={[SwitchScopes.UPDATE]} requireCrossVenuesPermission>
            <CliTemplateForm />
          </AuthRoute>
        }
      />
      <Route
        path='networks/wireless/:networkId/:action'
        element={<NetworkForm />}
      />
      <Route path='networks/wired' element={<Wired />} />
      <Route path='networks/wired/:activeTab'
        element={<Wired />} />
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
    </Route>
  )
}

const edgeDhcpRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.CREATE
      })}
      element={<AuthRoute scopes={[EdgeScopes.CREATE]}>
        <AddDHCP/>
      </AuthRoute>}
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
      element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
        <EditDhcp />
      </AuthRoute>}
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
      element={<AuthRoute scopes={[EdgeScopes.CREATE]}>
        <AddFirewall />
      </AuthRoute>}
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.EDIT
      })}
      element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
        <EditFirewall />
      </AuthRoute>}
    />
  </>
}

const edgePinRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
        oper: ServiceOperation.CREATE })}
      element={<AuthRoute scopes={[EdgeScopes.CREATE]}>
        <AddPersonalIdentitNetwork />
      </AuthRoute>}
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
      element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
        <EditPersonalIdentityNetwork />
      </AuthRoute>}
    />
  </>
}

function ServiceRoutes () {
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)

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
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <MdnsProxyForm />
          </AuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <MdnsProxyForm editMode={true} />
          </AuthRoute>
        }
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
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <WifiCallingForm />
          </AuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <WifiCallingConfigureForm />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <WifiCallingDetailView />
          </AuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.LIST })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <WifiCallingTable/>
          </AuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}
        element={<AuthRoute scopes={[WifiScopes.CREATE]}><DHCPForm/></AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT })}
        element={<AuthRoute scopes={[WifiScopes.UPDATE]}><DHCPForm editMode={true}/></AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.DETAIL })}
        element={<AuthRoute scopes={[WifiScopes.READ]}><DHCPDetail/></AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.LIST })}
        element={<AuthRoute scopes={[WifiScopes.READ]}><DHCPTable/></AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.LIST })}
        element={<DpskTable />}
      />
      {hasDpskAccess() &&
        <>
          <Route
            path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.CREATE })}
            element={<DpskForm />}
          />
          <Route
            path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT })}
            element={<DpskForm editMode={true} />}
          />
        </>
      }
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
        element={<AuthRoute scopes={[WifiScopes.CREATE]}><ResidentPortalForm /></AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.RESIDENT_PORTAL,
          oper: ServiceOperation.EDIT })}
        element={<AuthRoute scopes={[WifiScopes.UPDATE]}>
          <ResidentPortalForm editMode={true} />
        </AuthRoute>}
      />

      {(isEdgeHaReady && isEdgeDhcpHaReady)
        && edgeDhcpRoutes()}

      {(isEdgeHaReady && isEdgeFirewallHaReady)
        && edgeFirewallRoutes()}

      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.LIST })}
        element={<EdgeSdLanTable />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.CREATE })}
        element={<AuthRoute scopes={[EdgeScopes.CREATE]}>
          <AddEdgeSdLan />
        </AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.EDIT })}
        element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
          <EditEdgeSdLan />
        </AuthRoute>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.DETAIL })}
        element={<EdgeSdLanDetail />}
      />
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
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <RogueAPDetectionForm edit={false}/>
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <RogueAPDetectionForm edit={true}/>
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.DETAIL })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <RogueAPDetectionDetailView />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <RogueAPDetectionTable />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <AAAForm edit={false}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <AAAForm edit={true}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.DETAIL })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <AAAPolicyDetail/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <AAATable />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })}
        element={<AuthRoute scopes={[WifiScopes.CREATE]}><SyslogForm edit={false}/></AuthRoute>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.EDIT })}
        element={<AuthRoute scopes={[WifiScopes.UPDATE]}><SyslogForm edit={true}/></AuthRoute>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST })}
        element={<AuthRoute scopes={[WifiScopes.READ]}><SyslogTable /></AuthRoute>} />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.DETAIL })}
        element={<AuthRoute scopes={[WifiScopes.READ]}><SyslogDetailView /></AuthRoute>}
      />
      {isCloudpathBetaEnabled ? <>
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.DETAIL })}
          element={<MacRegistrationListDetails />}
        />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })}
          element={<MacRegistrationListsTable />}
        />
        { hasCloudpathAccess() && <>
          <Route
          // eslint-disable-next-line max-len
            path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
            element={<MacRegistrationListForm />} />
          <Route
          // eslint-disable-next-line max-len
            path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })}
            element={<MacRegistrationListForm editMode={true}/>}
          />
        </> }
      </> : <></> }
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <VLANPoolForm edit={false}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <VLANPoolForm edit={true}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.DETAIL })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <VLANPoolDetail/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <VLANPoolTable/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <AccessControlForm editMode={false}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <AccessControlForm editMode={true}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.DETAIL })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <AccessControlDetail />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <AccessControlTable />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <ClientIsolationForm editMode={false}/>
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <ClientIsolationForm editMode={true}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <ClientIsolationTable />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL })}
        element={
          <AuthRoute scopes={[WifiScopes.READ]}>
            <ClientIsolationDetail />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })}
        element={<WifiOperatorTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <WifiOperatorForm editMode={false} />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <WifiOperatorForm editMode={true}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.DETAIL })}
        element={<WifiOperatorDetailView />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <IdentityProviderForm editMode={false} />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <IdentityProviderForm editMode={true} />
          </AuthRoute>
        }
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
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <LbsServerProfileForm editMode={false} />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <LbsServerProfileForm editMode={true} />
          </AuthRoute>
        }
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.LIST })}
        element={<LbsServerProfileTable />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.DETAIL })}
        element={<LbsServerProfileDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <SnmpAgentForm editMode={false}/>
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <SnmpAgentForm editMode={true}/>
          </AuthRoute>
        }
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
        element={<AuthRoute scopes={[WifiScopes.CREATE, EdgeScopes.CREATE]}>
          <AddTunnelProfile />
        </AuthRoute>} />
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
        element={<AuthRoute scopes={[WifiScopes.UPDATE, EdgeScopes.UPDATE]}>
          <EditTunnelProfile />
        </AuthRoute>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.QOS_BANDWIDTH, oper: PolicyOperation.CREATE })}
        element={<AddEdgeQosBandwidth />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.QOS_BANDWIDTH, oper: PolicyOperation.EDIT })}
        element={<EditEdgeQosBandwidth />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.QOS_BANDWIDTH, oper: PolicyOperation.DETAIL })}
        element={<EdgeQosBandwidthDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.QOS_BANDWIDTH, oper: PolicyOperation.LIST })}
        element={<EdgeQosBandwidthTable />}
      />
      {isConnectionMeteringEnabled && <>
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.LIST })}
          element={<ConnectionMeteringTable />}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.DETAIL })}
          element={<ConnectionMeteringDetail/>}
        />
        { hasCloudpathAccess() && <>
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
        </>}
      </>}
      {isCloudpathBetaEnabled && <>
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP}/>}
        />
        {hasCloudpathAccess() && <>
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
        </>}
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.DETAIL })}
          element={<RadiusAttributeGroupDetail />}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY}/>}
        />
        {hasCloudpathAccess() && <>
          <Route
          // eslint-disable-next-line max-len
            path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.CREATE })}
            element={<AdaptivePolicyForm/>}
          />
          <Route
            path={getAdaptivePolicyDetailRoutePath(PolicyOperation.EDIT)}
            element={<AdaptivePolicyForm editMode={true}/>}
          />
        </> }
        <Route
          path={getAdaptivePolicyDetailRoutePath(PolicyOperation.DETAIL)}
          element={<AdaptivePolicyDetail/>}
        />
        {hasCloudpathAccess() && <>
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
        </>}
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
          element={<CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_TEMPLATE}/>}
        />
        <Route
          // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.LIST })}
          // eslint-disable-next-line max-len
          element={<CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_AUTHORITY}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST })}
          element={<CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE}/>}
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
          element={<CertificateTemplateDetail/>}
        />
      </>
      }
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}
            requireCrossVenuesPermission={{ needGlobalPermission: true }}
          >
            <SoftGreForm editMode={false} />
          </AuthRoute>
        } />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.LIST })}
        element={<SoftGreTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.DETAIL })}
        element={<SoftGreDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute
            scopes={[WifiScopes.UPDATE]}
            requireCrossVenuesPermission={{ needGlobalPermission: true }}
          >
            <SoftGreForm editMode={true} />
          </AuthRoute>}
      />
      {/* </>} */}
      {<>
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.ETHERNET_PORT_PROFILE ,
            oper: PolicyOperation.LIST
          })}
          element={<EthernetPortProfileTable/>}
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.ETHERNET_PORT_PROFILE ,
            oper: PolicyOperation.CREATE
          })}
          element={<AddEthernetPortProfile/>}
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.ETHERNET_PORT_PROFILE ,
            oper: PolicyOperation.EDIT
          })}
          element={<EditEthernetPortProfile/>}
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.ETHERNET_PORT_PROFILE ,
            oper: PolicyOperation.DETAIL
          })}
          element={<EthernetPortProfileDetail/>}
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
      <Route path='users/wifi/clients/search/:clientMac'
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
        element={<SwitchClientList />} />
      <Route path='users/switch/clients/:clientId'
        element={<SwitchClientDetailsPage />} />
      {(isCloudpathBetaEnabled)
        ? <>
          <Route
            path='users/identity-management'
            element={<TenantNavigate replace to='/users/identity-management/identity-group'/>}
          />
          <Route
            path='users/identity-management/:activeTab'
            element={<PersonaPortal/>}
          />
          <Route
            path='users/identity-management/identity-group/:personaGroupId'
            element={<PersonaGroupDetails/>}
          />
          <Route
            path='users/identity-management/identity-group/:personaGroupId/identity/:personaId'
            element={<PersonaDetails/>}
          />
        </> : <></>}
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
