/* eslint-disable max-len */
import { PageNotFound }                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  AAAForm,
  AAAPolicyDetail,
  AccessControlDetail,
  AccessControlForm,
  AccessControlTable,
  AdaptivePolicySetForm,
  AddEthernetPortProfile,
  ApGroupDetails,
  ApGroupEdit,
  CertificateAuthorityForm,
  CertificateForm,
  CertificateTemplateForm,
  ClientIsolationForm,
  CliProfileForm,
  CliTemplateForm,
  ConfigurationProfileForm,
  ConnectionMeteringFormMode,
  DHCPDetail,
  DHCPForm,
  DpskForm,
  EditEthernetPortProfile,
  EthernetPortProfileDetail,
  IdentityProviderForm,
  IpsecForm,
  LbsServerProfileForm,
  MacRegistrationListForm,
  NetworkForm,
  PortalForm,
  ResidentPortalForm,
  RogueAPDetectionDetailView,
  RogueAPDetectionForm,
  RogueAPDetectionTable,
  ServerClientCertificateForm,
  SoftGreForm,
  SyslogDetailView,
  SyslogForm,
  useIsEdgeFeatureReady,
  VLANPoolDetail,
  VLANPoolForm,
  WifiCallingConfigureForm,
  WifiCallingDetailView,
  WifiCallingForm,
  WifiOperatorForm,
  DirectoryServerForm,
  AddSamlIdp,
  EditSamlIdp,
  SamlIdpDetail,
  IdentityGroupForm,
  IdentityForm
} from '@acx-ui/rc/components'
import {
  CertificateCategoryType,
  getAdaptivePolicyDetailRoutePath,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  getSelectServiceRoutePath,
  getServiceCatalogRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  getScopeKeyByPolicy,
  hasSomePoliciesPermission,
  hasSomeServicesPermission,
  PolicyAuthRoute,
  PolicyOperation,
  PolicyType,
  ServiceAuthRoute,
  ServiceOperation,
  ServiceType,
  IdentityProviderTabType,
  PersonaUrls
} from '@acx-ui/rc/utils'
import { Navigate, rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                                    from '@acx-ui/store'
import { EdgeScopes, SwitchScopes, WifiScopes }        from '@acx-ui/types'
import { AuthRoute, getUserProfile, goToNoPermission } from '@acx-ui/user'
import { AccountTier, getOpsApi }                      from '@acx-ui/utils'

import Edges                                        from './pages/Devices/Edge'
import AddEdge                                      from './pages/Devices/Edge/AddEdge'
import AddEdgeCluster                               from './pages/Devices/Edge/AddEdgeCluster'
import EdgeClusterConfigWizard                      from './pages/Devices/Edge/ClusterConfigWizard'
import EdgeClusterDetails                           from './pages/Devices/Edge/ClusterDetails'
import EdgeDetails                                  from './pages/Devices/Edge/EdgeDetails'
import EditEdge                                     from './pages/Devices/Edge/EditEdge'
import EditEdgeCluster                              from './pages/Devices/Edge/EditEdgeCluster'
import { EdgeNokiaOltDetails }                      from './pages/Devices/Edge/Olt/OltDetails'
import { IotController }                            from './pages/Devices/IotController'
import { IotControllerForm }                        from './pages/Devices/IotController/IotControllerForm'
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
import { NetworksList, NetworkTabsEnum }            from './pages/Networks/wireless'
import NetworkDetails                               from './pages/Networks/wireless/NetworkDetails'
import AAATable                                     from './pages/Policies/AAA/AAATable/AAATable'
import AccessControl                                from './pages/Policies/AccessControl'
import CreateAccessControl                          from './pages/Policies/AccessControl/create'
import AdaptivePolicyList, { AdaptivePolicyTabKey } from './pages/Policies/AdaptivePolicy'
import AdaptivePolicyDetail                         from './pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyDetail/AdaptivePolicyDetail'
import AdaptivePolicyForm                           from './pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyForm/AdaptivePolicyForm'
import AdaptivePolicySetDetail                      from './pages/Policies/AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetDetail/AdaptivePolicySetDetail'
import RadiusAttributeGroupDetail                   from './pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupDetail/RadiusAttributeGroupDetail'
import RadiusAttributeGroupForm                     from './pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeGroupForm'
import CertificateTemplateDetail                    from './pages/Policies/CertificateTemplate/CertificateTemplateDetail/CertificateTemplateDetail'
import CertificateTemplateList                      from './pages/Policies/CertificateTemplate/CertificateTemplateList/CertificateTemplateList'
import ClientIsolationDetail                        from './pages/Policies/ClientIsolation/ClientIsolationDetail/ClientIsolationDetail'
import ClientIsolationTable                         from './pages/Policies/ClientIsolation/ClientIsolationTable/ClientIsolationTable'
import ConnectionMeteringDetail                     from './pages/Policies/ConnectionMetering/ConnectionMeteringDetail'
import ConnectionMeteringPageForm                   from './pages/Policies/ConnectionMetering/ConnectionMeteringPageForm'
import ConnectionMeteringTable                      from './pages/Policies/ConnectionMetering/ConnectionMeteringTable'
import DirectoryServerDetail                        from './pages/Policies/DirectoryServer/DirectoryServerDetail/DirectoryServerDetail'
import DirectoryServerTable                         from './pages/Policies/DirectoryServer/DirectoryServerTable/DirectoryServerTable'
import EthernetPortProfile                          from './pages/Policies/EthernetPortProfile'
import AddFlexibleAuthentication                    from './pages/Policies/FlexibleAuthentication/AddFlexibleAuthentication'
import EditFlexibleAuthentication                   from './pages/Policies/FlexibleAuthentication/EditFlexibleAuthentication'
import FlexibleAuthenticationDetail                 from './pages/Policies/FlexibleAuthentication/FlexibleAuthenticationDetail'
import FlexibleAuthenticationTable                  from './pages/Policies/FlexibleAuthentication/FlexibleAuthenticationTable'
import AddEdgeHqosBandwidth                         from './pages/Policies/HqosBandwidth/Edge/AddHqosBandwidth'
import EditEdgeHqosBandwidth                        from './pages/Policies/HqosBandwidth/Edge/EditHqosBandwidth'
import EdgeHqosBandwidthDetail                      from './pages/Policies/HqosBandwidth/Edge/HqosBandwidthDetail'
import EdgeHqosBandwidthTable                       from './pages/Policies/HqosBandwidth/Edge/HqosBandwidthTable'
import IdentityProvider                             from './pages/Policies/IdentityProvider'
import IdentityProviderCreate                       from './pages/Policies/IdentityProvider/IdentityProviderCreate'
import IdentityProviderDetail                       from './pages/Policies/IdentityProvider/IdentityProviderDetail/IdentityProviderDetail'
import IpsecDetail                                  from './pages/Policies/Ipsec/IpsecDetail'
import IpsecTable                                   from './pages/Policies/Ipsec/IpsecTable'
import LbsServerProfileDetail                       from './pages/Policies/LbsServerProfile/LbsServerProfileDetail/LbsServerProfileDetail'
import LbsServerProfileTable                        from './pages/Policies/LbsServerProfile/LbsServerProfileTable/LbsServerProfileTable'
import MacRegistrationListDetails                   from './pages/Policies/MacRegistrationList/MacRegistrarionListDetails/MacRegistrarionListDetails'
import MacRegistrationListsTable                    from './pages/Policies/MacRegistrationList/MacRegistrarionListTable'
import MyPolicies                                   from './pages/Policies/MyPolicies'
import PortProfile                                  from './pages/Policies/PortProfile'
import CreatePortProfile                            from './pages/Policies/PortProfile/create'
import SwitchPortProfileDetail                      from './pages/Policies/PortProfile/PortProfileDetail/SwitchPortProfileDetail'
import SwitchPortProfileForm                        from './pages/Policies/PortProfile/PortProfileForm/SwitchPortProfileForm'
import SelectPolicyForm                             from './pages/Policies/SelectPolicyForm'
import SnmpAgentDetail                              from './pages/Policies/SnmpAgent/SnmpAgentDetail/SnmpAgentDetail'
import SnmpAgentForm                                from './pages/Policies/SnmpAgent/SnmpAgentForm/SnmpAgentForm'
import SnmpAgentTable                               from './pages/Policies/SnmpAgent/SnmpAgentTable/SnmpAgentTable'
import SoftGreDetail                                from './pages/Policies/SoftGre/SoftGreDetail'
import SoftGreTable                                 from './pages/Policies/SoftGre/SoftGreTable'
import { SwitchAccessControlSetDetail }             from './pages/Policies/SwitchAccessControl/SwitchAccessControlSetDetail'
import { SwitchAccessControlSetForm }               from './pages/Policies/SwitchAccessControl/SwitchAccessControlSetForm'
import { SwitchLayer2ACLForm }                      from './pages/Policies/SwitchAccessControl/SwitchLayer2/SwitchLayer2ACLForm'
import { SwitchLayer2Detail }                       from './pages/Policies/SwitchAccessControl/SwitchLayer2/SwitchLayer2Detail'
import SyslogTable                                  from './pages/Policies/Syslog/SyslogTable/SyslogTable'
import AddTunnelProfile                             from './pages/Policies/TunnelProfile/AddTunnelProfile'
import EditTunnelProfile                            from './pages/Policies/TunnelProfile/EditTunnelProfile'
import TunnelProfileDetail                          from './pages/Policies/TunnelProfile/TunnelProfileDetail'
import TunnelProfileTable                           from './pages/Policies/TunnelProfile/TunnelProfileTable'
import VLANPoolTable                                from './pages/Policies/VLANPool/VLANPoolTable/VLANPoolTable'
import { WifiOperatorDetailView }                   from './pages/Policies/WifiOperator/WifiOperatorDetail/WifiOperatorDetailView'
import WifiOperatorTable                            from './pages/Policies/WifiOperator/WifiOperatorTable/WifiOperatorTable'
import WorkflowDetails                              from './pages/Policies/Workflow/WorkflowDetail'
import WorkflowPageForm                             from './pages/Policies/Workflow/WorkflowPageForm'
import WorkflowTable                                from './pages/Policies/Workflow/WorkflowTable'
import DHCPTable                                    from './pages/Services/DHCP/DHCPTable/DHCPTable'
import AddDHCP                                      from './pages/Services/DHCP/Edge/AddDHCP'
import EdgeDHCPDetail                               from './pages/Services/DHCP/Edge/DHCPDetail'
import EdgeDhcpTable                                from './pages/Services/DHCP/Edge/DHCPTable'
import EditDhcp                                     from './pages/Services/DHCP/Edge/EditDHCP'
import DpskDetails                                  from './pages/Services/Dpsk/DpskDetail/DpskDetails'
import DpskTable                                    from './pages/Services/Dpsk/DpskTable/DpskTable'
import AddFirewall                                  from './pages/Services/EdgeFirewall/AddFirewall'
import EditFirewall                                 from './pages/Services/EdgeFirewall/EditFirewall'
import FirewallDetail                               from './pages/Services/EdgeFirewall/FirewallDetail'
import FirewallTable                                from './pages/Services/EdgeFirewall/FirewallTable'
import {
  AddEdgeSdLan,
  EdgeSdLanDetail,
  EdgeSdLanTable,
  EditEdgeSdLan
} from './pages/Services/EdgeSdLan'
import { EdgeTnmDetails }                    from './pages/Services/EdgeTnm/EdgeTnmDetails'
import { EdgeTnmServiceTable }               from './pages/Services/EdgeTnm/EdgeTnmServiceTable'
import AddEdgeMdnsProxy                      from './pages/Services/MdnsProxy/Edge/AddEdgeMdnsProxy'
import EdgeMdnsProxyDetails                  from './pages/Services/MdnsProxy/Edge/EdgeMdnsProxyDetails'
import { EdgeMdnsProxyTable }                from './pages/Services/MdnsProxy/Edge/EdgeMdnsProxyTable'
import EditEdgeMdnsProxy                     from './pages/Services/MdnsProxy/Edge/EditEdgeMdnsProxy'
import MdnsProxyDetail                       from './pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail'
import MdnsProxyForm                         from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import MdnsProxyTable                        from './pages/Services/MdnsProxy/MdnsProxyTable/MdnsProxyTable'
import MyServices                            from './pages/Services/MyServices'
import NetworkSegAuthDetail                  from './pages/Services/NetworkSegWebAuth/NetworkSegAuthDetail'
import NetworkSegAuthForm                    from './pages/Services/NetworkSegWebAuth/NetworkSegAuthForm'
import NetworkSegAuthTable                   from './pages/Services/NetworkSegWebAuth/NetworkSegAuthTable'
import AddPersonalIdentityNetwork            from './pages/Services/PersonalIdentityNetwork/AddPersonalIdentityNetwork'
import EditPersonalIdentityNetwork           from './pages/Services/PersonalIdentityNetwork/EditPersonalIdentityNetwork'
import PersonalIdentityNetworkDetail         from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkDetail'
import PersonalIdentityNetworkDetailEnhanced from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkDetailEnhanced'
import PersonalIdentityNetworkTable          from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkTable'
import PersonalIdentityNetworkTableEnhanced  from './pages/Services/PersonalIdentityNetwork/PersonalIdentityNetworkTableEnhanced'
import PortalServiceDetail                   from './pages/Services/Portal/PortalDetail'
import PortalTable                           from './pages/Services/Portal/PortalTable'
import ResidentPortalDetail                  from './pages/Services/ResidentPortal/ResidentPortalDetail/ResidentPortalDetail'
import ResidentPortalTable                   from './pages/Services/ResidentPortal/ResidentPortalTable/ResidentPortalTable'
import SelectServiceForm                     from './pages/Services/SelectServiceForm'
import ServiceCatalog                        from './pages/Services/ServiceCatalog'
import WifiCallingTable                      from './pages/Services/WifiCalling/WifiCallingTable/WifiCallingTable'
import Timeline                              from './pages/Timeline'
import PersonaPortal                         from './pages/Users/Persona'
import PersonaDetails                        from './pages/Users/Persona/PersonaDetails'
import PersonaGroupDetails                   from './pages/Users/Persona/PersonaGroupDetails'
import SwitchClientList                      from './pages/Users/Switch/ClientList'
import WifiClientDetails                     from './pages/Users/Wifi/ClientDetails'
import { WifiClientList, WirelessTabsEnum }  from './pages/Users/Wifi/ClientList'
import GuestManagerPage                      from './pages/Users/Wifi/GuestManagerPage'


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
      {useEdgeOltRoutes()}
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

      {useEdgeClusterRoutes()}

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

      <Route path='devices/iotController' element={<IotController />} />
      <Route
        path='devices/iotController/add'
        element={<IotControllerForm />} />
      <Route
        path='devices/iotController/:iotId/:action'
        element={<IotControllerForm />} />

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

const useEdgeOltRoutes = () => {
  const isEdgeOltReady = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)

  return isEdgeOltReady ? <>
    <Route path='devices/optical' element={<SwitchList tab={SwitchTabsEnum.OPTICAL} />} />
    <Route path='devices/optical/:oltId/details' element={<EdgeNokiaOltDetails />} />
  </> : null
}

const useEdgeClusterRoutes = () => {
  const isEdgeDualWanReady = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  return <>
    <Route path='devices/edge/cluster/:clusterId/edit/:activeTab'
      element={<AuthRoute scopes={[EdgeScopes.READ, EdgeScopes.UPDATE]}>
        <EditEdgeCluster />
      </AuthRoute>} />

    {isEdgeDualWanReady ? <>
      <Route path='devices/edge/cluster/:clusterId/details/:activeTab'
        element={<EdgeClusterDetails />} />
      <Route path='devices/edge/cluster/:clusterId/details/:activeTab/:activeSubTab'
        element={<EdgeClusterDetails />} />
    </> : null}

    <Route path='devices/edge/cluster/:clusterId/configure'
      element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
        <EdgeClusterConfigWizard />
      </AuthRoute>} />
    <Route path='devices/edge/cluster/:clusterId/configure/:settingType'
      element={<AuthRoute scopes={[EdgeScopes.UPDATE]}>
        <EdgeClusterConfigWizard />
      </AuthRoute>} />
  </>
}

const edgeDhcpRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_DHCP,
        oper: ServiceOperation.CREATE
      })}
      element={
        <ServiceAuthRoute serviceType={ServiceType.EDGE_DHCP} oper={ServiceOperation.CREATE}>
          <AddDHCP/>
        </ServiceAuthRoute>
      }
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
      element={
        <ServiceAuthRoute serviceType={ServiceType.EDGE_DHCP} oper={ServiceOperation.EDIT}>
          <EditDhcp />
        </ServiceAuthRoute>
      }
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
      element={
        <ServiceAuthRoute serviceType={ServiceType.EDGE_FIREWALL} oper={ServiceOperation.CREATE}>
          <AddFirewall />
        </ServiceAuthRoute>
      }
    />
    <Route
      path={getServiceRoutePath({
        type: ServiceType.EDGE_FIREWALL,
        oper: ServiceOperation.EDIT
      })}
      element={
        <ServiceAuthRoute serviceType={ServiceType.EDGE_FIREWALL} oper={ServiceOperation.EDIT}>
          <EditFirewall />
        </ServiceAuthRoute>
      }
    />
  </>
}

const useEdgePinRoutes = () => {
  const isEdgePinEnhancementReady = useIsEdgeFeatureReady(Features.EDGE_PIN_ENHANCE_TOGGLE)

  return <>
    <Route
      path={getServiceRoutePath({ type: ServiceType.PIN,
        oper: ServiceOperation.CREATE })}
      element={
        <ServiceAuthRoute serviceType={ServiceType.PIN} oper={ServiceOperation.CREATE}>
          <AddPersonalIdentityNetwork />
        </ServiceAuthRoute>
      }
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.PIN, oper: ServiceOperation.LIST })}
      element={isEdgePinEnhancementReady ? <PersonalIdentityNetworkTableEnhanced /> : <PersonalIdentityNetworkTable />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.PIN, oper: ServiceOperation.DETAIL })}
      element={isEdgePinEnhancementReady ? <PersonalIdentityNetworkDetailEnhanced /> : <PersonalIdentityNetworkDetail />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.PIN, oper: ServiceOperation.EDIT })}
      element={
        <ServiceAuthRoute serviceType={ServiceType.PIN} oper={ServiceOperation.EDIT}>
          <EditPersonalIdentityNetwork />
        </ServiceAuthRoute>
      }
    />
  </>
}

const edgeMdnsRoutes = () => {
  return <>
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY,
        oper: ServiceOperation.LIST })}
      element={<EdgeMdnsProxyTable />}
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY,
        oper: ServiceOperation.CREATE })}
      element={
        <ServiceAuthRoute serviceType={ServiceType.EDGE_MDNS_PROXY} oper={ServiceOperation.CREATE}>
          <AddEdgeMdnsProxy />
        </ServiceAuthRoute>
      }
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY,
        oper: ServiceOperation.EDIT })}
      element={
        <ServiceAuthRoute serviceType={ServiceType.EDGE_MDNS_PROXY} oper={ServiceOperation.EDIT}>
          <EditEdgeMdnsProxy />
        </ServiceAuthRoute>
      }
    />
    <Route
      path={getServiceRoutePath({ type: ServiceType.EDGE_MDNS_PROXY,
        oper: ServiceOperation.DETAIL })}
      element={<EdgeMdnsProxyDetails />}
    />
  </>
}

const edgeTnmRoutes = () => {
  return <><Route
    path={getServiceRoutePath({ type: ServiceType.EDGE_TNM_SERVICE,
      oper: ServiceOperation.LIST })}
    element={<EdgeTnmServiceTable />}
  />
  <Route
    path={getServiceRoutePath({ type: ServiceType.EDGE_TNM_SERVICE,
      oper: ServiceOperation.DETAIL })}
    element={<EdgeTnmDetails />}
  />
  </>
}

function ServiceRoutes () {
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeTnmServiceReady = useIsEdgeFeatureReady(Features.EDGE_THIRDPARTY_MGMT_TOGGLE)
  const pinRoutes = useEdgePinRoutes()

  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path='services'
        element={<TenantNavigate replace to={getServiceListRoutePath(true)} />}
      />
      <Route path={getServiceListRoutePath()} element={<MyServices />} />
      <Route
        path={getSelectServiceRoutePath()}
        element={getUserProfile().rbacOpsApiEnabled
          ? hasSomeServicesPermission(ServiceOperation.CREATE) ? <SelectServiceForm /> : goToNoPermission()
          : <AuthRoute requireCrossVenuesPermission={{ needGlobalPermission: true }} scopes={[WifiScopes.CREATE, EdgeScopes.CREATE]}>
            <SelectServiceForm />
          </AuthRoute>
        }/>
      <Route path={getServiceCatalogRoutePath()} element={<ServiceCatalog />} />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.CREATE })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.MDNS_PROXY} oper={ServiceOperation.CREATE}>
            <MdnsProxyForm />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.MDNS_PROXY, oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.MDNS_PROXY} oper={ServiceOperation.EDIT}>
            <MdnsProxyForm editMode={true} />
          </ServiceAuthRoute>
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
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.CREATE })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.WIFI_CALLING} oper={ServiceOperation.CREATE}>
            <WifiCallingForm />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.WIFI_CALLING} oper={ServiceOperation.EDIT}>
            <WifiCallingConfigureForm />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.DETAIL })}
        element={<WifiCallingDetailView />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WIFI_CALLING, oper: ServiceOperation.LIST })}
        element={<WifiCallingTable/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.CREATE })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.DHCP} oper={ServiceOperation.CREATE}>
            <DHCPForm/>
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DHCP, oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.DHCP} oper={ServiceOperation.EDIT}>
            <DHCPForm editMode={true}/>
          </ServiceAuthRoute>
        }
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
        element={
          <ServiceAuthRoute serviceType={ServiceType.DPSK} oper={ServiceOperation.CREATE}>
            <DpskForm />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.DPSK} oper={ServiceOperation.EDIT}>
            <DpskForm editMode={true} />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.DPSK, oper: ServiceOperation.DETAIL })}
        element={<DpskDetails />}
      />

      {(isEdgePinReady) && pinRoutes}

      <Route
        path={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,
          oper: ServiceOperation.CREATE })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.WEBAUTH_SWITCH} oper={ServiceOperation.CREATE}>
            <NetworkSegAuthForm />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.WEBAUTH_SWITCH,
          oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.WEBAUTH_SWITCH} oper={ServiceOperation.EDIT}>
            <NetworkSegAuthForm editMode={true} />
          </ServiceAuthRoute>
        }
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
        element={
          <ServiceAuthRoute serviceType={ServiceType.PORTAL} oper={ServiceOperation.CREATE}>
            <PortalForm/>
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.PORTAL, oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.PORTAL} oper={ServiceOperation.EDIT}>
            <PortalForm editMode={true}/>
          </ServiceAuthRoute>
        }
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
        element={
          <ServiceAuthRoute serviceType={ServiceType.RESIDENT_PORTAL} oper={ServiceOperation.CREATE}>
            <ResidentPortalForm />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.RESIDENT_PORTAL,
          oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.RESIDENT_PORTAL} oper={ServiceOperation.EDIT}>
            <ResidentPortalForm editMode={true} />
          </ServiceAuthRoute>
        }
      />

      {(isEdgeHaReady && isEdgeDhcpHaReady)
        && edgeDhcpRoutes()}

      {(isEdgeHaReady && isEdgeFirewallHaReady)
        && edgeFirewallRoutes()}


      {isEdgeMdnsReady && edgeMdnsRoutes()}

      {isEdgeTnmServiceReady && edgeTnmRoutes()}

      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.LIST })}
        element={<EdgeSdLanTable />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.CREATE })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.EDGE_SD_LAN} oper={ServiceOperation.CREATE}>
            <AddEdgeSdLan />
          </ServiceAuthRoute>
        }
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_SD_LAN,
          oper: ServiceOperation.EDIT })}
        element={
          <ServiceAuthRoute serviceType={ServiceType.EDGE_SD_LAN} oper={ServiceOperation.EDIT}>
            <EditEdgeSdLan />
          </ServiceAuthRoute>
        }
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
  const isWorkflowTierEnabled = useIsTierAllowed(Features.WORKFLOW_ONBOARD)
  const isWorkflowFFEnabled = useIsSplitOn(Features.WORKFLOW_TOGGLE)
  const isCertificateTemplateEnabled = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isSwitchFlexAuthEnabled = useIsSplitOn(Features.SWITCH_FLEXIBLE_AUTHENTICATION)
  const isDirectoryServerEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_DIRECTORY_SERVER_TOGGLE)
  const isSwitchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const isIpsecEnabled = useIsSplitOn(Features.WIFI_IPSEC_PSK_OVER_NETWORK_TOGGLE)
  const isCaptivePortalSsoSamlEnabled = useIsSplitOn(Features.WIFI_CAPTIVE_PORTAL_SSO_SAML_TOGGLE)
  const isSwitchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  return rootRoutes(
    <Route path=':tenantId/t'>
      <Route path='*' element={<PageNotFound />} />
      <Route path={getPolicyListRoutePath()} element={<MyPolicies />} />
      <Route path={getSelectPolicyRoutePath()}
        element={getUserProfile().rbacOpsApiEnabled
          ? hasSomePoliciesPermission(PolicyOperation.CREATE) ? <SelectPolicyForm /> : goToNoPermission()
          : <SelectPolicyForm />
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.ROGUE_AP_DETECTION} oper={PolicyOperation.CREATE}>
            <RogueAPDetectionForm edit={false}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.ROGUE_AP_DETECTION} oper={PolicyOperation.EDIT}>
            <RogueAPDetectionForm edit={true}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.DETAIL })}
        element={<RogueAPDetectionDetailView />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ROGUE_AP_DETECTION, oper: PolicyOperation.LIST })}
        element={<RogueAPDetectionTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.AAA} oper={PolicyOperation.CREATE}>
            <AAAForm edit={false}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.AAA} oper={PolicyOperation.EDIT}>
            <AAAForm edit={true}/>
          </PolicyAuthRoute>
        }
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
        element={
          <PolicyAuthRoute policyType={PolicyType.SYSLOG} oper={PolicyOperation.CREATE}>
            <SyslogForm edit={false}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.SYSLOG} oper={PolicyOperation.EDIT}>
            <SyslogForm edit={true}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST })}
        element={<SyslogTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.DETAIL })}
        element={<SyslogDetailView />}
      />
      {isCloudpathBetaEnabled ? <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.DETAIL })}
          element={<MacRegistrationListDetails />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })}
          element={<MacRegistrationListsTable />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.MAC_REGISTRATION_LIST} oper={PolicyOperation.CREATE}>
              <MacRegistrationListForm />
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.MAC_REGISTRATION_LIST} oper={PolicyOperation.EDIT}>
              <MacRegistrationListForm editMode={true}/>
            </PolicyAuthRoute>
          }
        />
      </> : <></> }
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.VLAN_POOL} oper={PolicyOperation.CREATE}>
            <VLANPoolForm edit={false}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.VLAN_POOL} oper={PolicyOperation.EDIT}>
            <VLANPoolForm edit={true}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.DETAIL })}
        element={<VLANPoolDetail/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.LIST })}
        element={<VLANPoolTable/>}
      />
      <Route
        path={getPolicyRoutePath(
          { type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.ACCESS_CONTROL} oper={PolicyOperation.CREATE}>
            <AccessControlForm editMode={false}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.ACCESS_CONTROL} oper={PolicyOperation.EDIT}>
            <AccessControlForm editMode={true}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath(
          { type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.DETAIL })}
        element={<AccessControlDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.LIST })}
        element={<AccessControlTable />}
      />
      {isSwitchMacAclEnabled && <>
        <Route
          path='policies/accessControls/create'
          element={
            // eslint-disable-next-line max-len
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.ACCESS_CONTROL, PolicyOperation.CREATE)}>
              <CreateAccessControl />
            </AuthRoute>
          }
        />
        <Route
          path='policies/accessControl/:activeTab/'
          element={<AccessControl />}
        />
        <Route
          path='policies/accessControl/:activeTab/:activeSubTab'
          element={<AccessControl />}
        />
        <Route
          path='policies/accessControl/switch/add'
          element={
            <AuthRoute scopes={[SwitchScopes.CREATE]}>
              <SwitchAccessControlSetForm editMode={false} />
            </AuthRoute>
          }
        />
        <Route
          path='policies/accessControl/switch/:accessControlId/edit'
          element={
            <AuthRoute scopes={[SwitchScopes.UPDATE]}>
              <SwitchAccessControlSetForm editMode={true} />
            </AuthRoute>
          }
        />
        <Route
          path='policies/accessControl/switch/:accessControlId/:activeTab'
          element={<SwitchAccessControlSetDetail />}
        />
        <Route
          path='policies/accessControl/switch/layer2/add'
          element={
            <AuthRoute scopes={[SwitchScopes.CREATE]}>
              <SwitchLayer2ACLForm editMode={false} />
            </AuthRoute>
          }
        />
        <Route
          path='policies/accessControl/switch/layer2/:accessControlId/edit'
          element={
            <AuthRoute scopes={[SwitchScopes.UPDATE]}>
              <SwitchLayer2ACLForm editMode={true} />
            </AuthRoute>
          }
        />
        <Route
          path='policies/accessControl/switch/layer2/:accessControlId/:activeTab'
          element={<SwitchLayer2Detail />}
        />
      </>}
      <Route
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.CLIENT_ISOLATION} oper={PolicyOperation.CREATE}>
            <ClientIsolationForm editMode={false}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.CLIENT_ISOLATION} oper={PolicyOperation.EDIT}>
            <ClientIsolationForm editMode={true}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.LIST })}
        element={<ClientIsolationTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.CLIENT_ISOLATION, oper: PolicyOperation.DETAIL })}
        element={<ClientIsolationDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.LIST })}
        element={<WifiOperatorTable />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.WIFI_OPERATOR} oper={PolicyOperation.CREATE}>
            <WifiOperatorForm editMode={false} />
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.EDIT })}
        element={
          <PolicyAuthRoute policyType={PolicyType.WIFI_OPERATOR} oper={PolicyOperation.EDIT}>
            <WifiOperatorForm editMode={true}/>
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.WIFI_OPERATOR, oper: PolicyOperation.DETAIL })}
        element={<WifiOperatorDetailView />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]}>
            <IdentityProviderForm editMode={false} />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]}>
            <IdentityProviderForm editMode={true} />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.LIST })}
        element={<IdentityProvider currentTabType={IdentityProviderTabType.Hotspot20} />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.IDENTITY_PROVIDER, oper: PolicyOperation.DETAIL })}
        element={<IdentityProviderDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.CREATE })}
        element={
          <AuthRoute scopes={[WifiScopes.CREATE]} unsupportedTiers={[AccountTier.CORE]}>
            <LbsServerProfileForm editMode={false} />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.EDIT })}
        element={
          <AuthRoute scopes={[WifiScopes.UPDATE]} unsupportedTiers={[AccountTier.CORE]}>
            <LbsServerProfileForm editMode={true} />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.LIST })}
        element={
          <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
            <LbsServerProfileTable />
          </AuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.LBS_SERVER_PROFILE, oper: PolicyOperation.DETAIL })}
        element={
          <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
            <LbsServerProfileDetail />
          </AuthRoute>}
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
        element={
          <PolicyAuthRoute policyType={PolicyType.TUNNEL_PROFILE} oper={PolicyOperation.CREATE}>
            <AddTunnelProfile />
          </PolicyAuthRoute>
        }
      />
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
        element={
          <PolicyAuthRoute policyType={PolicyType.TUNNEL_PROFILE} oper={PolicyOperation.EDIT}>
            <EditTunnelProfile />
          </PolicyAuthRoute>
        }
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.HQOS_BANDWIDTH, oper: PolicyOperation.CREATE })}
        element={<AddEdgeHqosBandwidth />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.HQOS_BANDWIDTH, oper: PolicyOperation.EDIT })}
        element={<EditEdgeHqosBandwidth />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.HQOS_BANDWIDTH, oper: PolicyOperation.DETAIL })}
        element={<EdgeHqosBandwidthDetail />}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.HQOS_BANDWIDTH, oper: PolicyOperation.LIST })}
        element={<EdgeHqosBandwidthTable />}
      />
      {isConnectionMeteringEnabled && <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.LIST })}
          element={<ConnectionMeteringTable />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.DETAIL })}
          element={<ConnectionMeteringDetail/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute
              policyType={PolicyType.CONNECTION_METERING}
              oper={PolicyOperation.CREATE}
              children={<ConnectionMeteringPageForm mode={ConnectionMeteringFormMode.CREATE} />}
            />
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CONNECTION_METERING, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute
              policyType={PolicyType.CONNECTION_METERING}
              oper={PolicyOperation.EDIT}
              children={<ConnectionMeteringPageForm mode={ConnectionMeteringFormMode.EDIT} />}
            />
          }
        />
      </>}
      {isCloudpathBetaEnabled && <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.RADIUS_ATTRIBUTE_GROUP}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.RADIUS_ATTRIBUTE_GROUP} oper={PolicyOperation.CREATE}>
              <RadiusAttributeGroupForm />
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.RADIUS_ATTRIBUTE_GROUP} oper={PolicyOperation.EDIT}>
              <RadiusAttributeGroupForm editMode={true}/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.RADIUS_ATTRIBUTE_GROUP, oper: PolicyOperation.DETAIL })}
          element={<RadiusAttributeGroupDetail />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.ADAPTIVE_POLICY} oper={PolicyOperation.CREATE}>
              <AdaptivePolicyForm/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getAdaptivePolicyDetailRoutePath(PolicyOperation.EDIT)}
          element={
            <PolicyAuthRoute policyType={PolicyType.ADAPTIVE_POLICY} oper={PolicyOperation.EDIT}>
              <AdaptivePolicyForm editMode={true}/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getAdaptivePolicyDetailRoutePath(PolicyOperation.DETAIL)}
          element={<AdaptivePolicyDetail/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.ADAPTIVE_POLICY_SET} oper={PolicyOperation.CREATE}>
              <AdaptivePolicySetForm/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.ADAPTIVE_POLICY_SET} oper={PolicyOperation.EDIT}>
              <AdaptivePolicySetForm editMode={true}/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.DETAIL })}
          element={<AdaptivePolicySetDetail/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ADAPTIVE_POLICY_SET, oper: PolicyOperation.LIST })}
          element={<AdaptivePolicyList tabKey={AdaptivePolicyTabKey.ADAPTIVE_POLICY_SET}/>}
        /> </>
      }
      {isWorkflowFFEnabled && isWorkflowTierEnabled &&
      <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.WORKFLOW, oper: PolicyOperation.LIST })}
          element={
            <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
              <WorkflowTable/>
            </AuthRoute>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.WORKFLOW, oper: PolicyOperation.DETAIL })}
          element={
            <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
              <WorkflowDetails />
            </AuthRoute>} />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.WORKFLOW, oper: PolicyOperation.CREATE })}
          element={
            <AuthRoute unsupportedTiers={[AccountTier.CORE]}>
              <PolicyAuthRoute policyType={PolicyType.WORKFLOW} oper={PolicyOperation.CREATE}>
                <WorkflowPageForm/>
              </PolicyAuthRoute>
            </AuthRoute>
          } />
      </>
      }
      {isCertificateTemplateEnabled && <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.LIST })}
          element={<CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_TEMPLATE}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.LIST })}
          element={<CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE_AUTHORITY}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.LIST })}
          element={<CertificateTemplateList tabKey={CertificateCategoryType.CERTIFICATE}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.SERVER_CERTIFICATES,
            oper: PolicyOperation.LIST })}
          element={<CertificateTemplateList tabKey={CertificateCategoryType.SERVER_CERTIFICATES}/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.CERTIFICATE_TEMPLATE} oper={PolicyOperation.CREATE}>
              <CertificateTemplateForm editMode={false}/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.CERTIFICATE_TEMPLATE} oper={PolicyOperation.EDIT}>
              <CertificateTemplateForm editMode={true}/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.CERTIFICATE_AUTHORITY} oper={PolicyOperation.CREATE}>
              <CertificateAuthorityForm/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.CERTIFICATE} oper={PolicyOperation.CREATE}>
              <CertificateForm/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.DETAIL })}
          element={<CertificateTemplateDetail/>}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.SERVER_CERTIFICATES, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.SERVER_CERTIFICATES} oper={PolicyOperation.CREATE}>
              <ServerClientCertificateForm/>
            </PolicyAuthRoute>
          }
        />
      </>
      }
      {isSwitchFlexAuthEnabled && <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.FLEX_AUTH, oper: PolicyOperation.LIST })}
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.FLEX_AUTH, PolicyOperation.LIST)}>
              <FlexibleAuthenticationTable />
            </AuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.FLEX_AUTH ,
            oper: PolicyOperation.CREATE
          })}
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.FLEX_AUTH, PolicyOperation.CREATE)}>
              <AddFlexibleAuthentication />
            </AuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.FLEX_AUTH ,
            oper: PolicyOperation.EDIT
          })}
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.FLEX_AUTH, PolicyOperation.EDIT)}>
              <EditFlexibleAuthentication />
            </AuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.FLEX_AUTH, oper: PolicyOperation.DETAIL
          })}
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.FLEX_AUTH, PolicyOperation.DETAIL)}>
              <FlexibleAuthenticationDetail />
            </AuthRoute>
          }
        />
      </>
      }
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SOFTGRE, oper: PolicyOperation.CREATE })}
        element={
          <PolicyAuthRoute policyType={PolicyType.SOFTGRE} oper={PolicyOperation.CREATE}>
            <SoftGreForm editMode={false} />
          </PolicyAuthRoute>
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
          <PolicyAuthRoute policyType={PolicyType.SOFTGRE} oper={PolicyOperation.EDIT}>
            <SoftGreForm editMode={true} />
          </PolicyAuthRoute>
        }
      />
      {/* </>} */}
      {<>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.LIST })}
          element={<EthernetPortProfile />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.ETHERNET_PORT_PROFILE} oper={PolicyOperation.CREATE}>
              <AddEthernetPortProfile />
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.ETHERNET_PORT_PROFILE} oper={PolicyOperation.EDIT}>
              <EditEthernetPortProfile />
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.ETHERNET_PORT_PROFILE, oper: PolicyOperation.DETAIL })}
          element={<EthernetPortProfileDetail />}
        />
      </>
      }
      {isSwitchPortProfileEnabled && <>
        <Route
          path='policies/portProfile/create'
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.CREATE)}>
              <CreatePortProfile />
            </AuthRoute>
          }
        />
        <Route
          path='policies/portProfile/:activeTab/'
          element={<PortProfile />}
        />
        <Route
          path='policies/portProfile/:activeTab/:activeSubTab'
          element={<PortProfile />}
        />
        <Route
          path='policies/portProfile/switch/profiles/add'
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.CREATE)}>
              <SwitchPortProfileForm />
            </AuthRoute>
          }
        />
        <Route
          path='policies/portProfile/switch/profiles/:portProfileId/edit'
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.EDIT)}>
              <SwitchPortProfileForm />
            </AuthRoute>
          }
        />
        <Route
          path='policies/portProfile/switch/profiles/:portProfileId/detail'
          element={
            <AuthRoute scopes={getScopeKeyByPolicy(PolicyType.SWITCH_PORT_PROFILE, PolicyOperation.DETAIL)}>
              <SwitchPortProfileDetail />
            </AuthRoute>
          }
        />
      </>
      }
      {isDirectoryServerEnabled && <>
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.DIRECTORY_SERVER,
            oper: PolicyOperation.LIST })}
          element={<DirectoryServerTable />}
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.DIRECTORY_SERVER,
            oper: PolicyOperation.DETAIL })}
          element={<DirectoryServerDetail />}
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.DIRECTORY_SERVER,
            oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.DIRECTORY_SERVER} oper={PolicyOperation.CREATE}>
              <DirectoryServerForm editMode={false} />
            </PolicyAuthRoute>
          } />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.DIRECTORY_SERVER,
            oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.DIRECTORY_SERVER} oper={PolicyOperation.CREATE}>
              <DirectoryServerForm editMode={true} />
            </PolicyAuthRoute>
          } />
      </>
      }
      {isIpsecEnabled && <>
        <Route
          path={getPolicyRoutePath({ type: PolicyType.IPSEC, oper: PolicyOperation.CREATE })}
          element={
            <PolicyAuthRoute policyType={PolicyType.IPSEC} oper={PolicyOperation.CREATE}>
              <IpsecForm editMode={false} />
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.IPSEC, oper: PolicyOperation.LIST })}
          element={<IpsecTable />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.IPSEC, oper: PolicyOperation.DETAIL })}
          element={<IpsecDetail />}
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.IPSEC, oper: PolicyOperation.EDIT })}
          element={
            <PolicyAuthRoute policyType={PolicyType.IPSEC} oper={PolicyOperation.EDIT}>
              <IpsecForm editMode={true} />
            </PolicyAuthRoute>
          }
        />
      </>
      },
      {isCaptivePortalSsoSamlEnabled &&<>
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.SAML_IDP,
            oper: PolicyOperation.LIST
          })}
          element={
            <PolicyAuthRoute policyType={PolicyType.SAML_IDP} oper={PolicyOperation.LIST}>
              <IdentityProvider currentTabType={IdentityProviderTabType.SAML} />
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({ type: PolicyType.SAML_IDP, oper: PolicyOperation.CREATE })}
          element={
            <AuthRoute scopes={[WifiScopes.CREATE]}>
              <IdentityProviderCreate/>
            </AuthRoute>
          }
        />
        <Route
          path={'policies/samlIdp/add'}
          element={
            <PolicyAuthRoute policyType={PolicyType.SAML_IDP} oper={PolicyOperation.CREATE}>
              <AddSamlIdp/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.SAML_IDP ,
            oper: PolicyOperation.EDIT
          })}
          element={
            <PolicyAuthRoute policyType={PolicyType.SAML_IDP} oper={PolicyOperation.EDIT}>
              <EditSamlIdp/>
            </PolicyAuthRoute>
          }
        />
        <Route
          path={getPolicyRoutePath({
            type: PolicyType.SAML_IDP ,
            oper: PolicyOperation.DETAIL
          })}
          element={<SamlIdpDetail/>}
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
            path='users/identity-management/identity-group/create'
            element={
              <AuthRoute rbacOpsIds={[getOpsApi(PersonaUrls.addPersonaGroup)]}>
                <IdentityGroupForm />
              </AuthRoute>}
          />
          <Route
            path='users/identity-management/identity-group/:personaGroupId'
            element={<PersonaGroupDetails/>}
          />
          <Route
            path='users/identity-management/identity-group/:personaGroupId/edit'
            element={
              <AuthRoute rbacOpsIds={[getOpsApi(PersonaUrls.updatePersonaGroup)]}>
                <IdentityGroupForm editMode={true}/>
              </AuthRoute>}
          />
          <Route
            path='users/identity-management/identity-group/identity/create'
            element={
              <AuthRoute rbacOpsIds={[getOpsApi(PersonaUrls.addPersona)]}>
                <IdentityForm />
              </AuthRoute>}
          />
          <Route
            path='users/identity-management/identity-group/:personaGroupId/identity/create'
            element={
              <AuthRoute rbacOpsIds={[getOpsApi(PersonaUrls.addPersona)]}>
                <IdentityForm />
              </AuthRoute>}
          />
          <Route
            path='users/identity-management/identity-group/:personaGroupId/identity/:personaId'
          >
            <Route index element={<Navigate replace to='./overview' />} />
            <Route path='edit'
              element={
                <AuthRoute rbacOpsIds={[getOpsApi(PersonaUrls.updatePersona)]}>
                  <IdentityForm editMode={true} />
                </AuthRoute>} />
            <Route path=':activeTab' element={<PersonaDetails />} />
          </Route>
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
