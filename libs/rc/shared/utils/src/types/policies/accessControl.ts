import { defineMessage, MessageDescriptor } from 'react-intl'

import { ProtocolEnum }   from '../../models'
import { DeviceTypeEnum } from '../../models/DeviceTypeEnum'
import { OsVendorEnum }   from '../../models/OsVendorEnum'

export interface l2AclPolicyInfoType {
  id: string,
  macAddresses: string[],
  description?: string,
  name: string,
  access: string
}

export interface l3AclPolicyInfoType {
  id: string,
  l3Rules: L3Rule[],
  description?: string,
  name: string,
  defaultAccess: string
}

export interface AclOptionType {
  key: string,
  value: string
}

export interface EnhancedAccessControlInfoType {
  id: string,
  name: string,
  l2AclPolicyName: string,
  l2AclPolicyId: string,
  l3AclPolicyName: string,
  l3AclPolicyId: string,
  devicePolicyName: string,
  devicePolicyId: string,
  applicationPolicyName: string,
  applicationPolicyId: string,
  clientRateUpLinkLimit: number,
  clientRateDownLinkLimit: number,
  networkIds: string[]
}

export interface AccessControlInfoType {
  id: string,
  name: string,
  description?: string,
  devicePolicy?: {
    id: string,
    enabled: boolean
  },
  l2AclPolicy?: {
    id: string,
    enabled: boolean
  },
  l3AclPolicy?: {
    id: string,
    enabled: boolean
  },
  applicationPolicy?: {
    id: string,
    enabled: boolean
  },
  rateLimiting?: {
    uplinkLimit: number,
    downlinkLimit: number,
    enabled: boolean
  },
  networkIds?: string[]
}

export interface appPolicyInfoType {
  id: string,
  rules: AppRule[],
  description?: string,
  name: string,
  tenantId: string
}

export interface devicePolicyInfoType {
  id: string,
  rules: DeviceRule[],
  description?: string,
  name: string,
  defaultAccess: string,
  tenantId: string
}

export interface DeviceRule {
  action: AccessStatus,
  deviceType: string,
  name: string,
  osVendor: string,
  vlan?: number
  uploadRateLimit?: number,
  downloadRateLimit?: number
}

export interface L3Rule {
  id: string
  access: 'ALLOW' | 'BLOCK',
  description: string,
  destination: {
    enableIpSubnet: boolean,
    subnet?: string,
    ip?: string,
    port: string
  },
  priority: number,
  source: {
    subnet?: string,
    ip?: string,
    enableIpSubnet: boolean
  },
  protocol?: string
}

export interface AppRule {
  protocol?: string
  netmask?: string
  destinationIp?: string
  destinationPort?: number
  portMapping?: ApplicationPortMappingType
  accessControl: string,
  applicationId: number,
  applicationName: string,
  application: string,
  category: string,
  categoryId: number,
  id: string,
  name: string,
  priority: number,
  ruleType: string,
  uplink?: number,
  downlink?: number,
  upLinkMarkingType?: string,
  markingPriority?: string,
  downLinkMarkingType? : string
}

export interface AvcCategory {
  catId: number,
  catName: string,
  appNames: string[]
}

export interface AvcApp {
  appName: string,
  avcAppAndCatId: {
    catId: number,
    appId: number
  }
}

export interface AclEmbeddedObject {
  l2AclPolicyId?: string,
  l3AclPolicyId?: string,
  devicePolicyId?: string,
  applicationPolicyId?: string,
  uplinkLimit?: number,
  downlinkLimit?: number
}

export enum Layer3ProtocolType {
  ANYPROTOCOL = 'ANYPROTOCOL',
  L3ProtocolEnum_TCP = 'L3ProtocolEnum_TCP',
  L3ProtocolEnum_UDP = 'L3ProtocolEnum_UDP',
  L3ProtocolEnum_UDPLITE = 'L3ProtocolEnum_UDPLITE',
  L3ProtocolEnum_ICMP_ICMPV4 = 'L3ProtocolEnum_ICMP_ICMPV4',
  L3ProtocolEnum_IGMP = 'L3ProtocolEnum_IGMP',
  L3ProtocolEnum_ESP = 'L3ProtocolEnum_ESP',
  L3ProtocolEnum_AH = 'L3ProtocolEnum_AH',
  L3ProtocolEnum_SCTP = 'L3ProtocolEnum_SCTP'
}

export enum AccessStatus {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK'
}

export enum ApplicationAclType {
  DENY = 'DENY',
  QOS = 'QOS',
  RATE_LIMIT = 'RATE_LIMIT'
}

export enum ApplicationRuleType {
  SIGNATURE = 'SIGNATURE',
  USER_DEFINED = 'USER_DEFINED'
}

export enum ApplicationPortMappingType {
  IP_WITH_PORT = 'IP_WITH_PORT',
  PORT_ONLY = 'PORT_ONLY'
}

export enum EnabledStatus {
  ON = 'ON',
  OFF = 'OFF'
}

export const layer3ProtocolLabelMapping: Record<Layer3ProtocolType, MessageDescriptor> = {
  [Layer3ProtocolType.ANYPROTOCOL]: defineMessage({ defaultMessage: 'Any Protocol' }),
  [Layer3ProtocolType.L3ProtocolEnum_TCP]: defineMessage({ defaultMessage: 'TCP' }),
  [Layer3ProtocolType.L3ProtocolEnum_UDP]: defineMessage({ defaultMessage: 'UDP' }),
  [Layer3ProtocolType.L3ProtocolEnum_UDPLITE]: defineMessage({ defaultMessage: 'UDPLITE' }),
  [Layer3ProtocolType.L3ProtocolEnum_ICMP_ICMPV4]: defineMessage({
    defaultMessage: 'ICMP(ICMPV4)'
  }),
  [Layer3ProtocolType.L3ProtocolEnum_IGMP]: defineMessage({ defaultMessage: 'IGMP' }),
  [Layer3ProtocolType.L3ProtocolEnum_ESP]: defineMessage({ defaultMessage: 'ESP' }),
  [Layer3ProtocolType.L3ProtocolEnum_AH]: defineMessage({ defaultMessage: 'AH' }),
  [Layer3ProtocolType.L3ProtocolEnum_SCTP]: defineMessage({ defaultMessage: 'SCTP' })
}

export const osVenderLabelMapping: Record<OsVendorEnum, MessageDescriptor> = {
  [OsVendorEnum.All]: defineMessage({ defaultMessage: 'All' }),
  [OsVendorEnum.Windows]: defineMessage({ defaultMessage: 'Windows' }),
  [OsVendorEnum.MacOs]: defineMessage({ defaultMessage: 'macOS' }),
  [OsVendorEnum.ChromeOs]: defineMessage({ defaultMessage: 'ChromeOs' }),
  [OsVendorEnum.Linux]: defineMessage({ defaultMessage: 'Linux' }),
  [OsVendorEnum.Ubuntu]: defineMessage({ defaultMessage: 'Ubuntu' }),
  [OsVendorEnum.Ios]: defineMessage({ defaultMessage: 'iOS' }),
  [OsVendorEnum.Android]: defineMessage({ defaultMessage: 'Android' }),
  [OsVendorEnum.BlackBerry]: defineMessage({ defaultMessage: 'BlackBerry' }),
  [OsVendorEnum.AmazonKindle]: defineMessage({ defaultMessage: 'Amazon Kindle' }),
  [OsVendorEnum.CiscoIpPhone]: defineMessage({ defaultMessage: 'Cisco' }),
  [OsVendorEnum.AvayaIpPhone]: defineMessage({ defaultMessage: 'Avaya' }),
  [OsVendorEnum.LinksysPapVoip]: defineMessage({ defaultMessage: 'LinksysPapVoip' }),
  [OsVendorEnum.NortelIpPhone]: defineMessage({ defaultMessage: 'Nortel' }),
  [OsVendorEnum.Xbox360]: defineMessage({ defaultMessage: 'Xbox 360' }),
  [OsVendorEnum.PlayStation2]: defineMessage({ defaultMessage: 'PlayStation2' }),
  [OsVendorEnum.GameCube]: defineMessage({ defaultMessage: 'GameCube' }),
  [OsVendorEnum.Wii]: defineMessage({ defaultMessage: 'Wii' }),
  [OsVendorEnum.PlayStation3]: defineMessage({ defaultMessage: 'PlayStation3' }),
  [OsVendorEnum.PlayStation]: defineMessage({ defaultMessage: 'PlayStation' }),
  [OsVendorEnum.Xbox]: defineMessage({ defaultMessage: 'Xbox' }),
  [OsVendorEnum.Nintendo]: defineMessage({ defaultMessage: 'Nintendo' }),
  [OsVendorEnum.HpPrinter]: defineMessage({ defaultMessage: 'HP' }),
  [OsVendorEnum.CanonPrinter]: defineMessage({ defaultMessage: 'Canon' }),
  [OsVendorEnum.XeroxPrinter]: defineMessage({ defaultMessage: 'Xerox' }),
  [OsVendorEnum.DellPrinter]: defineMessage({ defaultMessage: 'Dell' }),
  [OsVendorEnum.BrotherPrinter]: defineMessage({ defaultMessage: 'Brother' }),
  [OsVendorEnum.EpsonPrinter]: defineMessage({ defaultMessage: 'Epson' }),
  [OsVendorEnum.NestCamera]: defineMessage({ defaultMessage: 'Nest Camera' }),
  [OsVendorEnum.NestThermostat]: defineMessage({ defaultMessage: 'Nest Thermostat' }),
  [OsVendorEnum.WemoSmartSwitch]: defineMessage({ defaultMessage: 'Wemo Smart Switch' }),
  [OsVendorEnum.WifiSmartPlug]: defineMessage({ defaultMessage: 'Wi-Fi Smart Plug' }),
  [OsVendorEnum.SonyPlayer]: defineMessage({ defaultMessage: 'SonyPlayer' }),
  [OsVendorEnum.PanasonicG20Tv]: defineMessage({ defaultMessage: 'PanasonicG20Tv' }),
  [OsVendorEnum.SamsungSmartTv]: defineMessage({ defaultMessage: 'SamsungSmartTv' }),
  [OsVendorEnum.AppleTv]: defineMessage({ defaultMessage: 'AppleTv' }),
  [OsVendorEnum.LibratoneSpeakers]: defineMessage({ defaultMessage: 'LibratoneSpeakers' }),
  [OsVendorEnum.BoseSpeakers]: defineMessage({ defaultMessage: 'BoseSpeakers' }),
  [OsVendorEnum.SonosSpeakers]: defineMessage({ defaultMessage: 'SonosSpeakers' }),
  [OsVendorEnum.RokuStreamingStick]: defineMessage({ defaultMessage: 'RokuStreamingStick' }),
  [OsVendorEnum.TelenetCpe]: defineMessage({ defaultMessage: 'TelenetCpe' })
}

export const deviceTypeLabelMapping: Record<DeviceTypeEnum, MessageDescriptor> = {
  [DeviceTypeEnum.Laptop]: defineMessage({ defaultMessage: 'Laptop' }),
  [DeviceTypeEnum.Smartphone]: defineMessage({ defaultMessage: 'Smartphone' }),
  [DeviceTypeEnum.Tablet]: defineMessage({ defaultMessage: 'Tablet' }),
  [DeviceTypeEnum.Voip]: defineMessage({ defaultMessage: 'VoIP' }),
  [DeviceTypeEnum.Gaming]: defineMessage({ defaultMessage: 'Gaming' }),
  [DeviceTypeEnum.Printer]: defineMessage({ defaultMessage: 'Printer' }),
  [DeviceTypeEnum.IotDevice]: defineMessage({ defaultMessage: 'Iot Device' }),
  [DeviceTypeEnum.HomeAvEquipment]: defineMessage({ defaultMessage: 'HomeAvEquipment' }),
  [DeviceTypeEnum.WdsDevice]: defineMessage({ defaultMessage: 'WdsDevice' })
}


export const AppAclLabelMapping: Record<ApplicationAclType, MessageDescriptor> = {
  [ApplicationAclType.DENY]: defineMessage({ defaultMessage: 'Block Applications' }),
  [ApplicationAclType.RATE_LIMIT]: defineMessage({ defaultMessage: 'Rate Limit' }),
  [ApplicationAclType.QOS]: defineMessage({ defaultMessage: 'QoS' })
}

export const AppRuleLabelMapping: Record<ApplicationRuleType, MessageDescriptor> = {
  [ApplicationRuleType.SIGNATURE]: defineMessage({ defaultMessage: 'System defined' }),
  [ApplicationRuleType.USER_DEFINED]: defineMessage({ defaultMessage: 'User defined' })
}

export const protocolLabelMapping: Record<ProtocolEnum, MessageDescriptor> = {
  [ProtocolEnum.TCP]: defineMessage({ defaultMessage: 'TCP' }),
  [ProtocolEnum.UDP]: defineMessage({ defaultMessage: 'UDP' })
}
