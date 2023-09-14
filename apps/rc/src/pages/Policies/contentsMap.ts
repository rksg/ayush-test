/* eslint-disable max-len */
import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  PolicyTechnology,
  PolicyType,
  Layer3ProtocolType,
  FacilityEnum,
  FlowLevelEnum,
  ProtocolEnum,
  OsVendorEnum,
  DeviceTypeEnum,
  ApplicationAclType,
  ApplicationRuleType, OperatorType
} from '@acx-ui/rc/utils'

export const policyTypeLabelMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'RADIUS Server' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog Server' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pools' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration List' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy' }),
  [PolicyType.SNMP_AGENT]: defineMessage({ defaultMessage: 'SNMP Agent' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy' }),
  // eslint-disable-next-line max-len
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group' }),
  // eslint-disable-next-line max-len
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set(TBD)' }),
  [PolicyType.TUNNEL_PROFILE]: defineMessage({ defaultMessage: 'Tunnel Profile' }),
  [PolicyType.CONNECTION_METERING]: defineMessage({ defaultMessage: 'Data Usage Metering' })
}
export const policyTypeDescMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'Create a RADIUS server profile for AAA on wireless devices' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Create L2-L7 access policies for device access to wireless networks' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Segregate layer 2 network traffic from all clients, create exception policies for allow-lists and block-lists' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Create WIDS policies for rogue wireless device detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Configure syslog to an external server for offline reporting' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'Create multiple VLANs in a pool to serve clients' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'Create MAC address lists to enable device access to wireless networks' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy (TBD)' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy (TBD)' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy (TBD)' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy (TBD)' }),
  [PolicyType.SNMP_AGENT]: defineMessage({ defaultMessage: 'Provides external notification to network administrators' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy (TBD)' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set(TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.CONNECTION_METERING]: defineMessage({ defaultMessage: 'Provides data rate and data consumption control' }),
  [PolicyType.TUNNEL_PROFILE]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Create adaptive policies for user and device connectivity on wired or wireless networks' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set' }),
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group' })
}
export const policyTechnologyLabelMapping: Record<PolicyTechnology, MessageDescriptor> = {
  [PolicyTechnology.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [PolicyTechnology.SWITCH]: defineMessage({ defaultMessage: 'Switch' })
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

export const facilityLabelMapping: Record<FacilityEnum, MessageDescriptor> = {
  [FacilityEnum.KEEP_ORIGINAL]: defineMessage({ defaultMessage: 'Keep Original' }),
  [FacilityEnum.LOCAL0]: defineMessage({ defaultMessage: '0' }),
  [FacilityEnum.LOCAL1]: defineMessage({ defaultMessage: '1' }),
  [FacilityEnum.LOCAL2]: defineMessage({ defaultMessage: '2' }),
  [FacilityEnum.LOCAL3]: defineMessage({ defaultMessage: '3' }),
  [FacilityEnum.LOCAL4]: defineMessage({ defaultMessage: '4' }),
  [FacilityEnum.LOCAL5]: defineMessage({ defaultMessage: '5' }),
  [FacilityEnum.LOCAL6]: defineMessage({ defaultMessage: '6' }),
  [FacilityEnum.LOCAL7]: defineMessage({ defaultMessage: '7' })
}

export const flowLevelLabelMapping: Record<FlowLevelEnum, MessageDescriptor> = {
  [FlowLevelEnum.GENERAL_LOGS]: defineMessage({ defaultMessage: 'General Logs' }),
  [FlowLevelEnum.CLIENT_FLOW]: defineMessage({ defaultMessage: 'Client Flow' }),
  [FlowLevelEnum.ALL]: defineMessage({ defaultMessage: 'All Logs' })
}
export const AttributeOperationLabelMapping: Record<OperatorType, MessageDescriptor> = {
  [OperatorType.ADD]: defineMessage({ defaultMessage: 'Add (Multiple)' }),
  [OperatorType.ADD_REPLACE]: defineMessage({ defaultMessage: 'Add or Replace (Single)' }),
  [OperatorType.DOES_NOT_EXIST]: defineMessage({ defaultMessage: 'Add if it Doesn\'t Exist' })
}
