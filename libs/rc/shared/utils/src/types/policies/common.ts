/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import { CertificateAcceptType } from './certificateTemplate'

export enum PolicyType {
  ACCESS_CONTROL = 'Access Control',
  SWITCH_ACCESS_CONTROL = 'Switch Access Control',
  VLAN_POOL = 'VLAN Pools',
  ROGUE_AP_DETECTION = 'Rogue AP Detection',
  SYSLOG = 'Syslog',
  AAA = 'RADIUS Server',
  CLIENT_ISOLATION = 'Client Isolation',
  IDENTITY_PROVIDER = 'Identity Provider',
  MAC_REGISTRATION_LIST = 'MAC Registration List',
  LAYER_2_POLICY = 'Layer 2 Policy',
  LAYER_3_POLICY = 'Layer 3 Policy',
  APPLICATION_POLICY = 'Application Policy',
  DEVICE_POLICY = 'Device Policy',
  SNMP_AGENT = 'SNMP Agent',
  ADAPTIVE_POLICY = 'Adaptive Policy',
  RADIUS_ATTRIBUTE_GROUP = 'RADIUS Attribute Group',
  ADAPTIVE_POLICY_SET = 'Adaptive Policy Set',
  TUNNEL_PROFILE = 'Tunnel Profile',
  CONNECTION_METERING = 'Data Usage Metering',
  WIFI_OPERATOR = 'Wi-Fi Operator',
  LBS_SERVER_PROFILE = 'Location Based Service Server',
  CERTIFICATE_TEMPLATE = 'Certificate Template',
  CERTIFICATE_AUTHORITY = 'Certificate Authority',
  CERTIFICATE = 'Certificate',
  SERVER_CERTIFICATES = 'Server Certificates',
  ETHERNET_PORT_PROFILE = 'Ethernet Port Profile',
  WORKFLOW = 'Workflow',
  HQOS_BANDWIDTH = 'HQoS Bandwidth',
  FLEX_AUTH = 'Authentication',
  SOFTGRE = 'SoftGRE',
  DIRECTORY_SERVER = 'Directory Server',
  PORT_PROFILE = 'Port Profile',
  SWITCH_PORT_PROFILE = 'Switch Port Profile'
}

export enum PolicyOperation {
  CREATE,
  EDIT,
  DELETE,
  DETAIL,
  LIST
}

export enum PolicyTechnology {
  WIFI = 'WI-FI',
  SWITCH = 'SWITCH'
}

export interface Policy {
  id: string
  name: string
  type: PolicyType
  technology: PolicyTechnology
  scope: number
  tags: string[]
}

export const policyTypeDescMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'Create a RADIUS server profile for AAA on wireless devices' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Create L2-L7 access policies for device access to wireless networks' }),
  [PolicyType.SWITCH_ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Create L2 access policies for device access to switch networks' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Segregate layer 2 network traffic from all clients, create exception policies for allow-lists and block-lists' }),
  [PolicyType.IDENTITY_PROVIDER]: defineMessage({ defaultMessage: 'Provides network services and operates the AAA infrastructure required to authenticate subscribers' }),
  [PolicyType.WIFI_OPERATOR]: defineMessage({ defaultMessage: 'Deploys and operates an access network consisting of publicly accessible or guest access Passpoint APs' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Create WIDS policies for rogue wireless device detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Configure syslog to an external server for offline reporting' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'Create multiple VLANs in a pool to serve clients' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'Create MAC address lists to enable device access to wireless networks' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy (TBD)' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy (TBD)' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy (TBD)' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy (TBD)' }),
  [PolicyType.SNMP_AGENT]: defineMessage({ defaultMessage: 'Provides external notification to network administrators' }),
  [PolicyType.CONNECTION_METERING]: defineMessage({ defaultMessage: 'Provides data rate and data consumption control' }),
  [PolicyType.TUNNEL_PROFILE]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Create adaptive policies for user and device connectivity on wired or wireless networks' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set' }),
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group' }),
  [PolicyType.LBS_SERVER_PROFILE]: defineMessage({ defaultMessage: 'Create your own Location Based Service profile with RUCKUS One Pre Engine - RSSI client data from the access points in your <venueSingular></venueSingular>' }),
  [PolicyType.CERTIFICATE_TEMPLATE]: defineMessage({ defaultMessage: 'Create certificates to establish secure communication and verify the identity of entities in a network' }),
  [PolicyType.CERTIFICATE_AUTHORITY]: defineMessage({ defaultMessage: 'Certificate Authority' }),
  [PolicyType.CERTIFICATE]: defineMessage({ defaultMessage: 'Certificate' }),
  [PolicyType.WORKFLOW]: defineMessage({ defaultMessage: 'A customizable onboarding process that provides more control over who is granted network access' }),
  [PolicyType.HQOS_BANDWIDTH]: defineMessage({ defaultMessage: 'HQoS Bandwidth' }),
  [PolicyType.SOFTGRE]: defineMessage({ defaultMessage: 'Tunnel the traffic to a SoftGRE gateway' }),
  [PolicyType.ETHERNET_PORT_PROFILE]: defineMessage({ defaultMessage: 'An Ethernet port profile is a configuration that specifies how a network port functions and behaves.' }),
  [PolicyType.FLEX_AUTH]: defineMessage({ defaultMessage: 'Define 802.1x and MAC-AUTH settings for switch clients. These profiles can be applied at the switch port(s) level.' }),
  [PolicyType.SERVER_CERTIFICATES]: defineMessage({ defaultMessage: 'Server Certificates' }),
  [PolicyType.DIRECTORY_SERVER]: defineMessage({ defaultMessage: 'Create an Active Directory or LDAP server for network access on a captive portal' }),
  [PolicyType.PORT_PROFILE]: defineMessage({ defaultMessage: 'A port profile is a configuration that specifies how a port functions and behaves.' }),
  [PolicyType.SWITCH_PORT_PROFILE]: defineMessage({ defaultMessage: 'A port profile is a configuration that specifies how a port functions and behaves.' })
}

export const downloadCertExtension: Record<CertificateAcceptType, String> = {
  [CertificateAcceptType.PEM]: 'pem',
  [CertificateAcceptType.DER]: 'der',
  [CertificateAcceptType.PKCS7]: 'p7b',
  [CertificateAcceptType.PKCS8]: 'key',
  [CertificateAcceptType.PKCS12]: 'p12',
  [CertificateAcceptType.PKCS1]: 'key'
}

export interface ProfileLanVenueActivations {
  venueId: string
  apModel: string
  apSerialNumbers?: string[],
  portId: number
}

export interface ProfileLanApActivations {
  venueId: string
  apSerialNumber: string,
  portId: number
}
