import { RbacOpsIds } from '@acx-ui/types'
import { getOpsApi }  from '@acx-ui/utils'

import { ServiceOperation, ServiceType } from '../../constants'
import { PolicyOperation, PolicyType }   from '../../types'
import {
  ApSnmpRbacUrls,
  CertificateUrls,
  DirectoryServerUrls,
  EdgeDhcpUrls,
  EdgeHqosProfilesUrls,
  EdgeMdnsProxyUrls,
  EdgePinUrls,
  EdgeSdLanUrls,
  EthernetPortProfileUrls,
  IdentityProviderUrls,
  IpsecUrls,
  LbsServerProfileUrls,
  MacRegListUrlsInfo,
  PropertyUrlsInfo,
  RadiusAttributeGroupUrlsInfo,
  RulesManagementUrlsInfo,
  SoftGreUrls,
  SwitchUrlsInfo,
  TunnelProfileUrls,
  WifiOperatorUrls
} from '../../urls'

import { SvcPcyAllowedOper, SvcPcyAllowedType } from './servicePolicyAbacContentsMap'

export type AllowedOperationMap<T extends SvcPcyAllowedType, O extends SvcPcyAllowedOper> =
  Partial<Record<T, Partial<Record<O, RbacOpsIds>>>>

export const serviceAllowedOperationMap = {
  [ServiceType.WIFI_CALLING]: {
    [ServiceOperation.CREATE]: ['POST:/wifiCallingServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/wifiCallingServiceProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/wifiCallingServiceProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/wifiCallingServiceProfiles/query']
  },
  [ServiceType.DHCP]: {
    [ServiceOperation.CREATE]: ['POST:/dhcpConfigServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/dhcpConfigServiceProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/dhcpConfigServiceProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/dhcpConfigServiceProfiles/query']
  },
  [ServiceType.MDNS_PROXY]: {
    [ServiceOperation.CREATE]: ['POST:/multicastDnsProxyProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/multicastDnsProxyProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/multicastDnsProxyProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/multicastDnsProxyProfiles/query']
  },
  [ServiceType.DPSK]: {
    [ServiceOperation.CREATE]: ['POST:/dpskServices'],
    [ServiceOperation.EDIT]: ['PUT:/dpskServices/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/dpskServices/{id}'],
    [ServiceOperation.LIST]: ['GET:/dpskServices']
  },
  [ServiceType.PORTAL]: {
    [ServiceOperation.CREATE]: ['POST:/portalServiceProfiles'],
    [ServiceOperation.EDIT]: ['PUT:/portalServiceProfiles/{id}'],
    [ServiceOperation.DELETE]: ['DELETE:/portalServiceProfiles/{id}'],
    [ServiceOperation.LIST]: ['POST:/portalServiceProfiles/query']
  },
  [ServiceType.EDGE_SD_LAN]: {
    [ServiceOperation.CREATE]: [getOpsApi(EdgeSdLanUrls.addEdgeSdLan)],
    [ServiceOperation.EDIT]: [getOpsApi(EdgeSdLanUrls.updateEdgeSdLan)],
    [ServiceOperation.DELETE]: [getOpsApi(EdgeSdLanUrls.deleteEdgeSdLan)],
    [ServiceOperation.LIST]: [getOpsApi(EdgeSdLanUrls.getEdgeSdLanViewDataList)]
  },
  [ServiceType.EDGE_MDNS_PROXY]: {
    [ServiceOperation.CREATE]: [getOpsApi(EdgeMdnsProxyUrls.addEdgeMdnsProxy)],
    [ServiceOperation.EDIT]: [getOpsApi(EdgeMdnsProxyUrls.updateEdgeMdnsProxy)],
    [ServiceOperation.DELETE]: [getOpsApi(EdgeMdnsProxyUrls.deleteEdgeMdnsProxy)],
    // eslint-disable-next-line max-len
    [ServiceOperation.LIST]: [getOpsApi(EdgeMdnsProxyUrls.getEdgeMdnsProxyViewDataList)]
  },
  [ServiceType.EDGE_DHCP]: {
    [ServiceOperation.CREATE]: [getOpsApi(EdgeDhcpUrls.addDhcpService)],
    [ServiceOperation.EDIT]: [getOpsApi(EdgeDhcpUrls.updateDhcpService)],
    [ServiceOperation.DELETE]: [getOpsApi(EdgeDhcpUrls.deleteDhcpService)],
    [ServiceOperation.LIST]: [getOpsApi(EdgeDhcpUrls.getDhcpStats)]
  },
  [ServiceType.PIN]: {
    [ServiceOperation.CREATE]: [getOpsApi(EdgePinUrls.createEdgePin)],
    [ServiceOperation.EDIT]: [getOpsApi(EdgePinUrls.updateEdgePin)],
    [ServiceOperation.DELETE]: [getOpsApi(EdgePinUrls.deleteEdgePin)],
    [ServiceOperation.LIST]: [getOpsApi(EdgePinUrls.getEdgePinStatsList)]
  },
  [ServiceType.WEBAUTH_SWITCH]: {
    [PolicyOperation.CREATE]: [getOpsApi(EdgePinUrls.addWebAuthTemplate)],
    [PolicyOperation.EDIT]: [getOpsApi(EdgePinUrls.updateWebAuthTemplate)],
    [PolicyOperation.DELETE]: [getOpsApi(EdgePinUrls.deleteWebAuthTemplate)],
    [PolicyOperation.LIST]: [getOpsApi(EdgePinUrls.getWebAuthTemplateList)]
  },
  [ServiceType.PORTAL_PROFILE]: { // include PORTAL & WEBAUTH_SWITCH
    [PolicyOperation.CREATE]: [
      'POST:/portalServiceProfiles',
      getOpsApi(EdgePinUrls.addWebAuthTemplate)],
    [PolicyOperation.EDIT]: [
      'PUT:/portalServiceProfiles/{id}',
      getOpsApi(EdgePinUrls.updateWebAuthTemplate)],
    [PolicyOperation.DELETE]: [
      'DELETE:/portalServiceProfiles/{id}',
      getOpsApi(EdgePinUrls.deleteWebAuthTemplate)],
    [PolicyOperation.LIST]: [
      'POST:/portalServiceProfiles/query',
      getOpsApi(EdgePinUrls.getWebAuthTemplateList)]
  },
  [ServiceType.RESIDENT_PORTAL]: {
    [ServiceOperation.CREATE]: [getOpsApi(PropertyUrlsInfo.addResidentPortal)],
    [ServiceOperation.EDIT]: [getOpsApi(PropertyUrlsInfo.patchResidentPortal)],
    [ServiceOperation.DELETE]: [getOpsApi(PropertyUrlsInfo.deleteResidentPortals)],
    [ServiceOperation.LIST]: [getOpsApi(PropertyUrlsInfo.getResidentPortalsQuery)]
  }
}

export const policyAllowedOperationMap = {
  [PolicyType.AAA]: {
    [PolicyOperation.CREATE]: ['POST:/radiusServerProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/radiusServerProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/radiusServerProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/radiusServerProfiles/query']
  },
  [PolicyType.CLIENT_ISOLATION]: {
    [PolicyOperation.CREATE]: ['POST:/clientIsolationProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/clientIsolationProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/clientIsolationProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/clientIsolationProfiles/query']
  },
  [PolicyType.ROGUE_AP_DETECTION]: {
    [PolicyOperation.CREATE]: ['POST:/roguePolicies'],
    [PolicyOperation.EDIT]: ['PUT:/roguePolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/roguePolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/roguePolicies/query']
  },
  [PolicyType.SYSLOG]: {
    [PolicyOperation.CREATE]: ['POST:/syslogServerProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/syslogServerProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/syslogServerProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/syslogServerProfiles/query']
  },
  [PolicyType.VLAN_POOL]: {
    [PolicyOperation.CREATE]: ['POST:/vlanPoolProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/vlanPoolProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/vlanPoolProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/vlanPoolProfiles/query']
  },
  [PolicyType.ACCESS_CONTROL]: {
    [PolicyOperation.CREATE]: ['POST:/accessControlProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/accessControlProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/accessControlProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/accessControlProfiles/query']
  },
  [PolicyType.SWITCH_ACCESS_CONTROL]: {
    [PolicyOperation.CREATE]: ['POST:/switchAccessControlProfiles'],
    [PolicyOperation.EDIT]: ['PUT:/switchAccessControlProfiles/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/switchAccessControlProfiles/{id}'],
    [PolicyOperation.LIST]: ['POST:/switchAccessControlProfiles/query']
  },
  [PolicyType.LAYER_2_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/l2AclPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/l2AclPolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/l2AclPolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/l2AclPolicies/query']
  },
  [PolicyType.LAYER_3_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/l3AclPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/l3AclPolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/l3AclPolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/l3AclPolicies/query']
  },
  [PolicyType.DEVICE_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/devicePolicies'],
    [PolicyOperation.EDIT]: ['PUT:/devicePolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/devicePolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/devicePolicies/query']
  },
  [PolicyType.APPLICATION_POLICY]: {
    [PolicyOperation.CREATE]: ['POST:/applicationPolicies'],
    [PolicyOperation.EDIT]: ['PUT:/applicationPolicies/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/applicationPolicies/{id}'],
    [PolicyOperation.LIST]: ['POST:/applicationPolicies/query']
  },
  [PolicyType.FLEX_AUTH]: {
    [PolicyOperation.CREATE]: [getOpsApi(SwitchUrlsInfo.addFlexAuthenticationProfile)],
    [PolicyOperation.EDIT]: [getOpsApi(SwitchUrlsInfo.updateFlexAuthenticationProfile)],
    [PolicyOperation.DELETE]: [getOpsApi(SwitchUrlsInfo.deleteFlexAuthenticationProfile)],
    [PolicyOperation.LIST]: [getOpsApi(SwitchUrlsInfo.getFlexAuthenticationProfiles)]
  },
  [PolicyType.WORKFLOW]: {
    [PolicyOperation.CREATE]: ['POST:/workflows'],
    [PolicyOperation.EDIT]: ['PATCH:/workflows/{id}'],
    [PolicyOperation.DELETE]: ['DELETE:/workflows/{id}'],
    [PolicyOperation.LIST]: ['POST:/workflows/query']
  },
  [PolicyType.TUNNEL_PROFILE]: {
    [PolicyOperation.CREATE]: [getOpsApi(TunnelProfileUrls.createTunnelProfile)],
    [PolicyOperation.EDIT]: [getOpsApi(TunnelProfileUrls.updateTunnelProfile)],
    [PolicyOperation.DELETE]: [getOpsApi(TunnelProfileUrls.deleteTunnelProfile)],
    [PolicyOperation.LIST]: [getOpsApi(TunnelProfileUrls.getTunnelProfileViewDataList)]
  },
  [PolicyType.HQOS_BANDWIDTH]: {
    [PolicyOperation.CREATE]: [getOpsApi(EdgeHqosProfilesUrls.addEdgeHqosProfile)],
    [PolicyOperation.EDIT]: [getOpsApi(EdgeHqosProfilesUrls.updateEdgeHqosProfile)],
    [PolicyOperation.DELETE]: [getOpsApi(EdgeHqosProfilesUrls.deleteEdgeHqosProfile)],
    [PolicyOperation.LIST]: [getOpsApi(EdgeHqosProfilesUrls.getEdgeHqosProfileViewDataList)]
  },
  [PolicyType.SNMP_AGENT]: {
    [PolicyOperation.CREATE]: [getOpsApi(ApSnmpRbacUrls.addApSnmpPolicy)],
    [PolicyOperation.EDIT]: [getOpsApi(ApSnmpRbacUrls.updateApSnmpPolicy)],
    [PolicyOperation.DELETE]: [getOpsApi(ApSnmpRbacUrls.deleteApSnmpPolicy)],
    [PolicyOperation.LIST]: [getOpsApi(ApSnmpRbacUrls.getApSnmpFromViewModel)]
  },
  [PolicyType.WIFI_OPERATOR]: {
    [PolicyOperation.CREATE]: [getOpsApi(WifiOperatorUrls.addWifiOperator)],
    [PolicyOperation.EDIT]: [getOpsApi(WifiOperatorUrls.updateWifiOperator)],
    [PolicyOperation.DELETE]: [getOpsApi(WifiOperatorUrls.deleteWifiOperator)],
    [PolicyOperation.LIST]: [getOpsApi(WifiOperatorUrls.getWifiOperatorList)]
  },
  [PolicyType.IDENTITY_PROVIDER]: {
    [PolicyOperation.CREATE]: [getOpsApi(IdentityProviderUrls.addIdentityProvider)],
    [PolicyOperation.EDIT]: [getOpsApi(IdentityProviderUrls.updateIdentityProvider)],
    [PolicyOperation.DELETE]: [getOpsApi(IdentityProviderUrls.deleteIdentityProvider)],
    [PolicyOperation.LIST]: [getOpsApi(IdentityProviderUrls.getIdentityProviderList)]
  },
  [PolicyType.LBS_SERVER_PROFILE]: {
    [PolicyOperation.CREATE]: [getOpsApi(LbsServerProfileUrls.addLbsServerProfile)],
    [PolicyOperation.EDIT]: [getOpsApi(LbsServerProfileUrls.updateLbsServerProfile)],
    [PolicyOperation.DELETE]: [getOpsApi(LbsServerProfileUrls.deleteLbsServerProfile)],
    [PolicyOperation.LIST]: [getOpsApi(LbsServerProfileUrls.getLbsServerProfileList)]
  },
  [PolicyType.ETHERNET_PORT_PROFILE]: {
    [PolicyOperation.CREATE]: [getOpsApi(EthernetPortProfileUrls.createEthernetPortProfile)],
    [PolicyOperation.EDIT]: [getOpsApi(EthernetPortProfileUrls.updateEthernetPortProfile)],
    [PolicyOperation.DELETE]: [getOpsApi(EthernetPortProfileUrls.deleteEthernetPortProfile)],
    [PolicyOperation.LIST]: [getOpsApi(EthernetPortProfileUrls.getEthernetPortProfileViewDataList)]
  },
  [PolicyType.SWITCH_PORT_PROFILE]: {
    [PolicyOperation.CREATE]: [getOpsApi(SwitchUrlsInfo.addSwitchPortProfile)],
    [PolicyOperation.EDIT]: [getOpsApi(SwitchUrlsInfo.editSwitchPortProfile)],
    [PolicyOperation.DELETE]: [getOpsApi(SwitchUrlsInfo.deleteSwitchPortProfile)],
    [PolicyOperation.LIST]: [getOpsApi(SwitchUrlsInfo.getSwitchPortProfilesList)]
  },
  [PolicyType.PORT_PROFILE]: { // include ETHERNET_PORT_PROFILE & SWITCH_PORT_PROFILE
    [PolicyOperation.CREATE]: [
      getOpsApi(EthernetPortProfileUrls.createEthernetPortProfile),
      getOpsApi(SwitchUrlsInfo.addSwitchPortProfile)],
    [PolicyOperation.EDIT]: [
      getOpsApi(EthernetPortProfileUrls.updateEthernetPortProfile),
      getOpsApi(SwitchUrlsInfo.editSwitchPortProfile)],
    [PolicyOperation.DELETE]: [
      getOpsApi(EthernetPortProfileUrls.deleteEthernetPortProfile),
      getOpsApi(SwitchUrlsInfo.deleteSwitchPortProfile)],
    [PolicyOperation.LIST]: [
      getOpsApi(EthernetPortProfileUrls.getEthernetPortProfileViewDataList),
      getOpsApi(SwitchUrlsInfo.getSwitchPortProfilesList)]
  },
  [PolicyType.SOFTGRE]: {
    [PolicyOperation.CREATE]: [getOpsApi(SoftGreUrls.createSoftGre)],
    [PolicyOperation.EDIT]: [getOpsApi(SoftGreUrls.updateSoftGre)],
    [PolicyOperation.DELETE]: [getOpsApi(SoftGreUrls.deleteSoftGre)],
    [PolicyOperation.LIST]: [getOpsApi(SoftGreUrls.getSoftGreViewDataList)]
  },
  [PolicyType.IPSEC]: {
    [PolicyOperation.CREATE]: [getOpsApi(IpsecUrls.createIpsec)],
    [PolicyOperation.EDIT]: [getOpsApi(IpsecUrls.updateIpsec)],
    [PolicyOperation.DELETE]: [getOpsApi(IpsecUrls.deleteIpsec)],
    [PolicyOperation.LIST]: [getOpsApi(IpsecUrls.getIpsecViewDataList)]
  },
  [PolicyType.DIRECTORY_SERVER]: {
    [PolicyOperation.CREATE]: [getOpsApi(DirectoryServerUrls.createDirectoryServer)],
    [PolicyOperation.EDIT]: [getOpsApi(DirectoryServerUrls.updateDirectoryServer)],
    [PolicyOperation.DELETE]: [getOpsApi(DirectoryServerUrls.deleteDirectoryServer)],
    [PolicyOperation.LIST]: [getOpsApi(DirectoryServerUrls.getDirectoryServerViewDataList)]
  },
  [PolicyType.MAC_REGISTRATION_LIST]: {
    [PolicyOperation.CREATE]: [getOpsApi(MacRegListUrlsInfo.createMacRegistrationPool)],
    [PolicyOperation.EDIT]: [getOpsApi(MacRegListUrlsInfo.updateMacRegistrationPool)],
    [PolicyOperation.DELETE]: [getOpsApi(MacRegListUrlsInfo.deleteMacRegistrationPool)],
    [PolicyOperation.LIST]: [getOpsApi(MacRegListUrlsInfo.getMacRegistrationPools)]
  },
  [PolicyType.CERTIFICATE_TEMPLATE]: {
    [PolicyOperation.CREATE]: [getOpsApi(CertificateUrls.addCertificateTemplate)],
    [PolicyOperation.EDIT]: [getOpsApi(CertificateUrls.editCertificateTemplate)],
    [PolicyOperation.DELETE]: [getOpsApi(CertificateUrls.deleteCertificateTemplate)],
    [PolicyOperation.LIST]: [getOpsApi(CertificateUrls.getCertificateTemplates)]
  },
  [PolicyType.CERTIFICATE_AUTHORITY]: {
    /* eslint-disable max-len */
    [PolicyOperation.CREATE]: [getOpsApi(CertificateUrls.addCA), getOpsApi(CertificateUrls.addSubCA), getOpsApi(CertificateUrls.uploadCAPrivateKey)],
    [PolicyOperation.EDIT]: [getOpsApi(CertificateUrls.editCA)],
    /* eslint-disable max-len */
    [PolicyOperation.DELETE]: [getOpsApi(CertificateUrls.deleteCA), getOpsApi(CertificateUrls.deleteCAPrivateKey)],
    [PolicyOperation.LIST]: [getOpsApi(CertificateUrls.getCAs), getOpsApi(CertificateUrls.getSubCAs)]
  },
  [PolicyType.CERTIFICATE]: {
    /* eslint-disable max-len */
    [PolicyOperation.CREATE]: [getOpsApi(CertificateUrls.generateCertificate), getOpsApi(CertificateUrls.generateCertificatesToIdentity), getOpsApi(CertificateUrls.uploadCertificate), getOpsApi(CertificateUrls.generateClientServerCertificate)],
    /* eslint-disable max-len */
    [PolicyOperation.EDIT]: [getOpsApi(CertificateUrls.editCertificate), getOpsApi(CertificateUrls.updateServerCertificate)],
    [PolicyOperation.DELETE]: [],
    [PolicyOperation.LIST]: [getOpsApi(CertificateUrls.getCertificateList)]
  },
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: {
    [PolicyOperation.CREATE]: [getOpsApi(RadiusAttributeGroupUrlsInfo.createAttributeGroup)],
    [PolicyOperation.EDIT]: [getOpsApi(RadiusAttributeGroupUrlsInfo.updateAttributeGroup)],
    [PolicyOperation.DELETE]: [getOpsApi(RadiusAttributeGroupUrlsInfo.deleteAttributeGroup)],
    [PolicyOperation.LIST]: [getOpsApi(RadiusAttributeGroupUrlsInfo.getAttributeGroupsWithQuery)]
  },
  [PolicyType.ADAPTIVE_POLICY]: {
    [PolicyOperation.CREATE]: [[getOpsApi(RulesManagementUrlsInfo.createPolicy),
      getOpsApi(RulesManagementUrlsInfo.addConditions)]],
    [PolicyOperation.EDIT]: [[getOpsApi(RulesManagementUrlsInfo.updatePolicy),
      getOpsApi(RulesManagementUrlsInfo.addConditions),
      getOpsApi(RulesManagementUrlsInfo.deleteConditions),
      getOpsApi(RulesManagementUrlsInfo.updateConditions)]],
    [PolicyOperation.DELETE]: [getOpsApi(RulesManagementUrlsInfo.deletePolicy)],
    [PolicyOperation.LIST]: [getOpsApi(RulesManagementUrlsInfo.getPoliciesByQuery)]
  },
  [PolicyType.ADAPTIVE_POLICY_SET]: {
    [PolicyOperation.CREATE]: [[getOpsApi(RulesManagementUrlsInfo.createPolicySet),
      getOpsApi(RulesManagementUrlsInfo.assignPolicyPriority)
    ]],
    [PolicyOperation.EDIT]: [[getOpsApi(RulesManagementUrlsInfo.updatePolicySet),
      getOpsApi(RulesManagementUrlsInfo.assignPolicyPriority),
      getOpsApi(RulesManagementUrlsInfo.removePrioritizedAssignment)
    ]],
    [PolicyOperation.DELETE]: [getOpsApi(RulesManagementUrlsInfo.deletePolicySet)],
    [PolicyOperation.LIST]: [getOpsApi(RulesManagementUrlsInfo.getPolicySetsByQuery)]
  }
}
