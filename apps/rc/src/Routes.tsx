import { PageNotFound }                                                                                        from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                                            from '@acx-ui/feature-toggle'
import { RogueAPDetectionDetailView, RogueAPDetectionForm, RogueAPDetectionTable, ConnectionMeteringFormMode } from '@acx-ui/rc/components'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  getSelectServiceRoutePath,
  getServiceCatalogRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath,
  PolicyOperation,
  PolicyType,
  ServiceOperation,
  ServiceType,
  getAdaptivePolicyDetailRoutePath
} from '@acx-ui/rc/utils'
import { Navigate, rootRoutes, Route, TenantNavigate } from '@acx-ui/react-router-dom'
import { Provider }                                    from '@acx-ui/store'

import Edges                                        from './pages/Devices/Edge'
import AddEdge                                      from './pages/Devices/Edge/AddEdge'
import EdgeDetails                                  from './pages/Devices/Edge/EdgeDetails'
import EditEdge                                     from './pages/Devices/Edge/EdgeDetails/EditEdge'
import { SwitchList, SwitchTabsEnum }               from './pages/Devices/Switch'
import { StackForm }                                from './pages/Devices/Switch/StackForm'
import SwitchDetails                                from './pages/Devices/Switch/SwitchDetails'
import { SwitchClientDetailsPage }                  from './pages/Devices/Switch/SwitchDetails/SwitchClientsTab/SwitchClientDetailsPage'
import { SwitchForm }                               from './pages/Devices/Switch/SwitchForm'
import { AccessPointList, WifiTabsEnum }            from './pages/Devices/Wifi'
import ApDetails                                    from './pages/Devices/Wifi/ApDetails'
import { ApEdit }                                   from './pages/Devices/Wifi/ApEdit'
import { ApForm }                                   from './pages/Devices/Wifi/ApForm'
import { ApGroupForm }                              from './pages/Devices/Wifi/ApGroupForm'
import Wired                                        from './pages/Networks/wired'
import CliTemplateForm                              from './pages/Networks/wired/onDemandCli/CliTemplateForm'
import CliProfileForm                               from './pages/Networks/wired/profiles/CliProfileForm'
import { ConfigurationProfileForm }                 from './pages/Networks/wired/profiles/ConfigurationProfileForm'
import { NetworksList, NetworkTabsEnum }            from './pages/Networks/wireless'
import NetworkDetails                               from './pages/Networks/wireless/NetworkDetails/NetworkDetails'
import NetworkForm                                  from './pages/Networks/wireless/NetworkForm/NetworkForm'
import AAAPolicyDetail                              from './pages/Policies/AAA/AAADetail'
import AAAForm                                      from './pages/Policies/AAA/AAAForm/AAAForm'
import AAATable                                     from './pages/Policies/AAA/AAATable/AAATable'
import AccessControlDetail                          from './pages/Policies/AccessControl/AccessControlDetail'
import AccessControlForm                            from './pages/Policies/AccessControl/AccessControlForm/AccessControlForm'
import AccessControlTable                           from './pages/Policies/AccessControl/AccessControlTable/AccessControlTable'
import AdaptivePolicyList, { AdaptivePolicyTabKey } from './pages/Policies/AdaptivePolicy'
import AdaptivePolicyDetail                         from './pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyDetail/AdaptivePolicyDetail'
import AdaptivePolicyForm                           from './pages/Policies/AdaptivePolicy/AdaptivePolicy/AdaptivePolicyForm/AdaptivePolicyForm'
import AdaptivePolicySetDetail                      from './pages/Policies/AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetDetail/AdaptivePolicySetDetail'
import AdaptivePolicySetForm                        from './pages/Policies/AdaptivePolicy/AdaptivePolicySet/AdaptivePolicySetFom/AdaptivePolicySetForm'
import RadiusAttributeGroupDetail
  // eslint-disable-next-line max-len
  from './pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupDetail/RadiusAttributeGroupDetail'
import RadiusAttributeGroupForm
  // eslint-disable-next-line max-len
  from './pages/Policies/AdaptivePolicy/RadiusAttributeGroup/RadiusAttributeGroupForm/RadiusAttributeGroupForm'
import ClientIsolationDetail                from './pages/Policies/ClientIsolation/ClientIsolationDetail/ClientIsolationDetail'
import ClientIsolationForm                  from './pages/Policies/ClientIsolation/ClientIsolationForm/ClientIsolationForm'
import ClientIsolationTable                 from './pages/Policies/ClientIsolation/ClientIsolationTable/ClientIsolationTable'
import ConnectionMeteringDetail             from './pages/Policies/ConnectionMetering/ConnectionMeteringDetail'
import ConnectionMeteringPageForm           from './pages/Policies/ConnectionMetering/ConnectionMeteringPageForm'
import ConnectionMeteringTable              from './pages/Policies/ConnectionMetering/ConnectionMeteringTable'
import MacRegistrationListDetails           from './pages/Policies/MacRegistrationList/MacRegistrarionListDetails/MacRegistrarionListDetails'
import MacRegistrationListsTable            from './pages/Policies/MacRegistrationList/MacRegistrarionListTable'
import MacRegistrationListForm              from './pages/Policies/MacRegistrationList/MacRegistrationListForm/MacRegistrationListForm'
import MyPolicies                           from './pages/Policies/MyPolicies'
import SelectPolicyForm                     from './pages/Policies/SelectPolicyForm'
import SnmpAgentDetail                      from './pages/Policies/SnmpAgent/SnmpAgentDetail/SnmpAgentDetail'
import SnmpAgentForm                        from './pages/Policies/SnmpAgent/SnmpAgentForm/SnmpAgentForm'
import SnmpAgentTable                       from './pages/Policies/SnmpAgent/SnmpAgentTable/SnmpAgentTable'
import SyslogDetailView                     from './pages/Policies/Syslog/SyslogDetail/SyslogDetailView'
import SyslogForm                           from './pages/Policies/Syslog/SyslogForm/SyslogForm'
import SyslogTable                          from './pages/Policies/Syslog/SyslogTable/SyslogTable'
import AddTunnelProfile                     from './pages/Policies/TunnelProfile/AddTunnelProfile'
import EditTunnelProfile                    from './pages/Policies/TunnelProfile/EditTunnelProfile'
import TunnelProfileDetail                  from './pages/Policies/TunnelProfile/TunnelProfileDetail'
import TunnelProfileTable                   from './pages/Policies/TunnelProfile/TunnelProfileTable'
import VLANPoolDetail                       from './pages/Policies/VLANPool/VLANPoolDetail'
import VLANPoolForm                         from './pages/Policies/VLANPool/VLANPoolForm/VLANPoolForm'
import VLANPoolTable                        from './pages/Policies/VLANPool/VLANPoolTable/VLANPoolTable'
import DHCPDetail                           from './pages/Services/DHCP/DHCPDetail'
import DHCPForm                             from './pages/Services/DHCP/DHCPForm/DHCPForm'
import DHCPTable                            from './pages/Services/DHCP/DHCPTable/DHCPTable'
import AddDHCP                              from './pages/Services/DHCP/Edge/AddDHCP'
import EdgeDHCPDetail                       from './pages/Services/DHCP/Edge/DHCPDetail'
import EdgeDhcpTable                        from './pages/Services/DHCP/Edge/DHCPTable'
import EditDhcp                             from './pages/Services/DHCP/Edge/EditDHCP'
import DpskDetails                          from './pages/Services/Dpsk/DpskDetail/DpskDetails'
import DpskForm                             from './pages/Services/Dpsk/DpskForm/DpskForm'
import DpskTable                            from './pages/Services/Dpsk/DpskTable/DpskTable'
import AddFirewall                          from './pages/Services/EdgeFirewall/AddFirewall'
import EditFirewall                         from './pages/Services/EdgeFirewall/EditFirewall'
import FirewallDetail                       from './pages/Services/EdgeFirewall/FirewallDetail'
import FirewallTable                        from './pages/Services/EdgeFirewall/FirewallTable'
import MdnsProxyDetail                      from './pages/Services/MdnsProxy/MdnsProxyDetail/MdnsProxyDetail'
import MdnsProxyForm                        from './pages/Services/MdnsProxy/MdnsProxyForm/MdnsProxyForm'
import MdnsProxyTable                       from './pages/Services/MdnsProxy/MdnsProxyTable/MdnsProxyTable'
import MyServices                           from './pages/Services/MyServices'
import AddNetworkSegmentation               from './pages/Services/NetworkSegmentation/AddNetworkSegmentation'
import EditNetworkSegmentation              from './pages/Services/NetworkSegmentation/EditNetworkSegmentation'
import NetworkSegmentationDetail            from './pages/Services/NetworkSegmentation/NetworkSegmentationDetail'
import NetworkSegmentationTable             from './pages/Services/NetworkSegmentation/NetworkSegmentationTable'
import NetworkSegAuthDetail                 from './pages/Services/NetworkSegWebAuth/NetworkSegAuthDetail'
import NetworkSegAuthForm                   from './pages/Services/NetworkSegWebAuth/NetworkSegAuthForm'
import NetworkSegAuthTable                  from './pages/Services/NetworkSegWebAuth/NetworkSegAuthTable'
import PortalServiceDetail                  from './pages/Services/Portal/PortalDetail'
import PortalForm                           from './pages/Services/Portal/PortalForm/PortalForm'
import PortalTable                          from './pages/Services/Portal/PortalTable'
import ResidentPortalDetail                 from './pages/Services/ResidentPortal/ResidentPortalDetail/ResidentPortalDetail'
import ResidentPortalForm                   from './pages/Services/ResidentPortal/ResidentPortalForm/ResidentPortalForm'
import ResidentPortalTable                  from './pages/Services/ResidentPortal/ResidentPortalTable/ResidentPortalTable'
import SelectServiceForm                    from './pages/Services/SelectServiceForm'
import ServiceCatalog                       from './pages/Services/ServiceCatalog'
import WifiCallingDetailView                from './pages/Services/WifiCalling/WifiCallingDetail/WifiCallingDetailView'
import WifiCallingConfigureForm             from './pages/Services/WifiCalling/WifiCallingForm/WifiCallingConfigureForm'
import WifiCallingForm                      from './pages/Services/WifiCalling/WifiCallingForm/WifiCallingForm'
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
      <Route path='devices/apgroups/:apGroupId/:action' element={<ApGroupForm />} />
      <Route path='devices/apgroups/:action' element={<ApGroupForm />} />
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
      <Route path='devices/edge/add' element={<AddEdge />} />
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
      <Route path='devices/switch' element={<SwitchList tab={SwitchTabsEnum.LIST} />} />
      <Route path='devices/switch/reports/wired'
        element={<SwitchList tab={SwitchTabsEnum.WIRED_REPORT} />} />
      <Route path='devices/switch/:action' element={<SwitchForm />} />
      <Route path='devices/switch/:switchId/:serialNumber/:action' element={<SwitchForm />} />
      <Route path='devices/switch/stack/:action' element={<StackForm />} />
      <Route path='devices/switch/stack/:venueId/:stackList/:action' element={<StackForm />} />
      <Route path='devices/switch/:switchId/:serialNumber/stack/:action' element={<StackForm />} />
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
      <Route path='networks/wired/:configType/add' element={<CliTemplateForm />} />
      <Route
        path='networks/wired/:configType/:templateId/:action'
        element={<CliTemplateForm />}
      />
      <Route
        path='networks/wireless/:networkId/:action'
        element={<NetworkForm />}
      />
      <Route path='networks/wired' element={<Wired />} />
      <Route path='networks/wired/:activeTab' element={<Wired />} />
      <Route
        path='networks/wired/profiles/add'
        element={<ConfigurationProfileForm />}
      />
      <Route
        path='networks/wired/profiles/regular/:profileId/:action'
        element={<ConfigurationProfileForm />}
      />
      <Route path='networks/wired/:configType/cli/add' element={<CliProfileForm />} />
      <Route
        path='networks/wired/:configType/cli/:profileId/:action'
        element={<CliProfileForm />}
      />
    </Route>
  )
}

function ServiceRoutes () {
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
        path={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.CREATE })}
        element={<AddDHCP/>}
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
      <Route
        path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.CREATE })}
        element={<AddNetworkSegmentation />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.LIST })}
        element={<NetworkSegmentationTable />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.DETAIL })}
        element={<NetworkSegmentationDetail />}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.NETWORK_SEGMENTATION,
          oper: ServiceOperation.EDIT })}
        element={<EditNetworkSegmentation />}
      />
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
        path={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.LIST })}
        element={<EdgeDhcpTable/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.DETAIL })}
        element={<EdgeDHCPDetail/>}
      />
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_DHCP, oper: ServiceOperation.EDIT })}
        element={<EditDhcp />}
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
      <Route
        path={getServiceRoutePath({ type: ServiceType.EDGE_FIREWALL, oper: ServiceOperation.LIST })}
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
          type: ServiceType.EDGE_FIREWALL, oper: ServiceOperation.CREATE })}
        element={<AddFirewall />}
      />
      <Route
        path={getServiceRoutePath({
          type: ServiceType.EDGE_FIREWALL, oper: ServiceOperation.EDIT })}
        element={<EditFirewall />}
      />
    </Route>
  )
}

function PolicyRoutes () {
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isConnectionMeteringEnabled = useIsSplitOn(Features.CONNECTION_METERING)

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
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.CREATE })}
        element={<AAAForm edit={false}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.EDIT })}
        element={<AAAForm edit={true}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.DETAIL })}
        element={<AAAPolicyDetail/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.AAA, oper: PolicyOperation.LIST })}
        element={<AAATable />}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.CREATE })}
        element={<SyslogForm edit={false}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.EDIT })}
        element={<SyslogForm edit={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.LIST })}
        element={<SyslogTable />} />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.SYSLOG, oper: PolicyOperation.DETAIL })}
        element={<SyslogDetailView />}
      />
      {isCloudpathBetaEnabled ? <>
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.DETAIL })}
          element={<MacRegistrationListDetails />} />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.LIST })}
          element={<MacRegistrationListsTable />} />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.CREATE })}
          element={<MacRegistrationListForm />} />
        <Route
        // eslint-disable-next-line max-len
          path={getPolicyRoutePath({ type: PolicyType.MAC_REGISTRATION_LIST, oper: PolicyOperation.EDIT })}
          element={<MacRegistrationListForm editMode={true} />}
        /> </> : <></> }
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.CREATE })}
        element={<VLANPoolForm edit={false}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.VLAN_POOL, oper: PolicyOperation.EDIT })}
        element={<VLANPoolForm edit={true}/>}
      />
      <Route
        // eslint-disable-next-line max-len
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
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.ACCESS_CONTROL, oper: PolicyOperation.EDIT })}
        element={<AccessControlForm editMode={true}/>}
      />
      <Route
        // eslint-disable-next-line max-len
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
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.CREATE })}
        element={<SnmpAgentForm editMode={false}/>}
      />
      <Route
        // eslint-disable-next-line max-len
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.EDIT })}
        element={<SnmpAgentForm editMode={true}/>}
      />
      <Route
        path={getPolicyRoutePath({ type: PolicyType.SNMP_AGENT, oper: PolicyOperation.LIST })}
        element={<SnmpAgentTable />}
      />
      <Route
        // eslint-disable-next-line max-len
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
      <Route path='users/switch/clients' element={<SwitchClientList />} />
      <Route path='users/switch/clients/:clientId' element={<SwitchClientDetailsPage />} />
      {(isCloudpathBetaEnabled)
        ? <><Route
          path='users/persona-management'
          element={<TenantNavigate replace to='/users/persona-management/persona-group'/>}/><Route
          path='users/persona-management/:activeTab'
          element={<PersonaPortal/>}/><Route
          path='users/persona-management/persona-group/:personaGroupId'
          element={<PersonaGroupDetails/>}/><Route
          path='users/persona-management/persona-group/:personaGroupId/persona/:personaId'
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
