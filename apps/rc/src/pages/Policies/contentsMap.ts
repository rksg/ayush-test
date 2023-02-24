import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  PolicyTechnology,
  PolicyType,
  RogueRuleType,
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
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'AAA Server' }),
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control' }),
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation' }),
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog Server' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pools' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' })
}
export const policyTypeDescMapping: Record<PolicyType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'Create a RADIUS server profile for AAA on wireless devices' }),
  // eslint-disable-next-line max-len
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Create L2-L7 access policies for device access to wireless networks' }),
  // eslint-disable-next-line max-len
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Segregate layer 2 network traffic from all clients, create exception policies for allow-lists and block-lists' }),
  // eslint-disable-next-line max-len
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Create WIDS policies for rogue wireless device detection' }),
  // eslint-disable-next-line max-len
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Configure syslog to an external server for offline reporting' }),
  // eslint-disable-next-line max-len
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'Create multiple VLANs in a pool to serve clients' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration (TBD)' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy (TBD)' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy (TBD)' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy (TBD)' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy (TBD)' }),
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy (TBD)' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Set(TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'Radius Attribute group (TBD)' })
}
export const policyTechnologyLabelMapping: Record<PolicyTechnology, MessageDescriptor> = {
  [PolicyTechnology.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [PolicyTechnology.SWITCH]: defineMessage({ defaultMessage: 'Switch' })
}
export const rogueRuleLabelMapping: Record<RogueRuleType, MessageDescriptor> = {
  [RogueRuleType.AD_HOC_RULE]: defineMessage({ defaultMessage: 'Ad Hoc' }),
  [RogueRuleType.CTS_ABUSE_RULE]: defineMessage({ defaultMessage: 'CTS Abuse' }),
  [RogueRuleType.DEAUTH_FLOOD_RULE]: defineMessage({ defaultMessage: 'Deauth Flood' }),
  [RogueRuleType.DISASSOC_FLOOD_RULE]: defineMessage({ defaultMessage: 'Disassoc Flood' }),
  [RogueRuleType.EXCESSIVE_POWER_RULE]: defineMessage({ defaultMessage: 'Excessive Power' }),
  [RogueRuleType.LOW_SNR_RULE]: defineMessage({ defaultMessage: 'Low SNR' }),
  [RogueRuleType.CUSTOM_SNR_RULE]: defineMessage({ defaultMessage: 'Low SNR' }),
  [RogueRuleType.MAC_OUI_RULE]: defineMessage({ defaultMessage: 'MAC OUI' }),
  [RogueRuleType.CUSTOM_MAC_OUI_RULE]: defineMessage({ defaultMessage: 'MAC OUI' }),
  [RogueRuleType.MAC_SPOOFING_RULE]: defineMessage({ defaultMessage: 'MAC Spoofing' }),
  [RogueRuleType.NULL_SSID_RULE]: defineMessage({ defaultMessage: 'Null SSID' }),
  [RogueRuleType.RTS_ABUSE_RULE]: defineMessage({ defaultMessage: 'RTS Abuse' }),
  [RogueRuleType.SAME_NETWORK_RULE]: defineMessage({ defaultMessage: 'Same Network' }),
  [RogueRuleType.SSID_RULE]: defineMessage({ defaultMessage: 'SSID' }),
  [RogueRuleType.CUSTOM_SSID_RULE]: defineMessage({ defaultMessage: 'SSID' }),
  [RogueRuleType.SSID_SPOOFING_RULE]: defineMessage({ defaultMessage: 'SSID Spoofing' })
}

export const layer3ProtocolLabelMapping: Record<Layer3ProtocolType, MessageDescriptor> = {
  [Layer3ProtocolType.ANYPROTOCOL]: defineMessage({ defaultMessage: 'Any Protocol' }),
  [Layer3ProtocolType.TCP]: defineMessage({ defaultMessage: 'TCP' }),
  [Layer3ProtocolType.UDP]: defineMessage({ defaultMessage: 'UDP' }),
  [Layer3ProtocolType.UDPLITE]: defineMessage({ defaultMessage: 'UDPLITE' }),
  [Layer3ProtocolType.ICMP]: defineMessage({ defaultMessage: 'ICMP(ICMPV4)' }),
  [Layer3ProtocolType.IGMP]: defineMessage({ defaultMessage: 'IGMP' }),
  [Layer3ProtocolType.ESP]: defineMessage({ defaultMessage: 'ESP' }),
  [Layer3ProtocolType.AH]: defineMessage({ defaultMessage: 'AH' }),
  [Layer3ProtocolType.SCTP]: defineMessage({ defaultMessage: 'SCTP' })
}

export const osVenderLabelMapping: Record<OsVendorEnum, MessageDescriptor> = {
  [OsVendorEnum.All]: defineMessage({ defaultMessage: 'All' }),
  [OsVendorEnum.Windows]: defineMessage({ defaultMessage: 'Windows' }),
  [OsVendorEnum.MacOs]: defineMessage({ defaultMessage: 'MacOs' }),
  [OsVendorEnum.ChromeOs]: defineMessage({ defaultMessage: 'ChromeOs' }),
  [OsVendorEnum.Linux]: defineMessage({ defaultMessage: 'Linux' }),
  [OsVendorEnum.Ubuntu]: defineMessage({ defaultMessage: 'Ubuntu' }),
  [OsVendorEnum.Ios]: defineMessage({ defaultMessage: 'Ios' }),
  [OsVendorEnum.Android]: defineMessage({ defaultMessage: 'Android' }),
  [OsVendorEnum.BlackBerry]: defineMessage({ defaultMessage: 'BlackBerry' }),
  [OsVendorEnum.AmazonKindle]: defineMessage({ defaultMessage: 'AmazonKindle' }),
  [OsVendorEnum.CiscoIpPhone]: defineMessage({ defaultMessage: 'CiscoIpPhone' }),
  [OsVendorEnum.AvayaIpPhone]: defineMessage({ defaultMessage: 'AvayaIpPhone' }),
  [OsVendorEnum.LinksysPapVoip]: defineMessage({ defaultMessage: 'LinksysPapVoip' }),
  [OsVendorEnum.NortelIpPhone]: defineMessage({ defaultMessage: 'NortelIpPhone' }),
  [OsVendorEnum.Xbox360]: defineMessage({ defaultMessage: 'Xbox360' }),
  [OsVendorEnum.PlayStation2]: defineMessage({ defaultMessage: 'PlayStation2' }),
  [OsVendorEnum.GameCube]: defineMessage({ defaultMessage: 'GameCube' }),
  [OsVendorEnum.Wii]: defineMessage({ defaultMessage: 'Wii' }),
  [OsVendorEnum.PlayStation3]: defineMessage({ defaultMessage: 'PlayStation3' }),
  [OsVendorEnum.Xbox]: defineMessage({ defaultMessage: 'Xbox' }),
  [OsVendorEnum.Nintendo]: defineMessage({ defaultMessage: 'Nintendo' }),
  [OsVendorEnum.HpPrinter]: defineMessage({ defaultMessage: 'HpPrinter' }),
  [OsVendorEnum.CanonPrinter]: defineMessage({ defaultMessage: 'CanonPrinter' }),
  [OsVendorEnum.XeroxPrinter]: defineMessage({ defaultMessage: 'XeroxPrinter' }),
  [OsVendorEnum.DellPrinter]: defineMessage({ defaultMessage: 'DellPrinter' }),
  [OsVendorEnum.BrotherPrinter]: defineMessage({ defaultMessage: 'BrotherPrinter' }),
  [OsVendorEnum.EpsonPrinter]: defineMessage({ defaultMessage: 'EpsonPrinter' }),
  [OsVendorEnum.NestCamera]: defineMessage({ defaultMessage: 'NestCamera' }),
  [OsVendorEnum.NestThermostat]: defineMessage({ defaultMessage: 'NestThermostat' }),
  [OsVendorEnum.WemoSmartSwitch]: defineMessage({ defaultMessage: 'WemoSmartSwitch' }),
  [OsVendorEnum.WifiSmartPlug]: defineMessage({ defaultMessage: 'WifiSmartPlug' }),
  [OsVendorEnum.SonyPlayer]: defineMessage({ defaultMessage: 'SonyPlayer' }),
  [OsVendorEnum.PanasonicG20Tv]: defineMessage({ defaultMessage: 'PanasonicG20Tv' }),
  [OsVendorEnum.SamsungSmartTv]: defineMessage({ defaultMessage: 'SamsungSmartTv' }),
  [OsVendorEnum.AppleTv]: defineMessage({ defaultMessage: 'AppleTv' }),
  [OsVendorEnum.LibratoneSpeakers]: defineMessage({ defaultMessage: 'LibratoneSpeakers' }),
  [OsVendorEnum.BoseSpeakers]: defineMessage({ defaultMessage: 'BoseSpeakers' }),
  [OsVendorEnum.SonosSpeakers]: defineMessage({ defaultMessage: 'SonosSpeakers' }),
  [OsVendorEnum.RokuStreamingStick]: defineMessage({ defaultMessage: 'RokuStreamingStick' }),
  [OsVendorEnum.TelnetCpe]: defineMessage({ defaultMessage: 'TelnetCpe' })
}

export const deviceTypeLabelMapping: Record<DeviceTypeEnum, MessageDescriptor> = {
  [DeviceTypeEnum.Laptop]: defineMessage({ defaultMessage: 'Laptop' }),
  [DeviceTypeEnum.Smartphone]: defineMessage({ defaultMessage: 'Smartphone' }),
  [DeviceTypeEnum.Tablet]: defineMessage({ defaultMessage: 'Tablet' }),
  [DeviceTypeEnum.Voip]: defineMessage({ defaultMessage: 'Voip' }),
  [DeviceTypeEnum.Gaming]: defineMessage({ defaultMessage: 'Gaming' }),
  [DeviceTypeEnum.Printer]: defineMessage({ defaultMessage: 'Printer' }),
  [DeviceTypeEnum.IotDevice]: defineMessage({ defaultMessage: 'IotDevice' }),
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
  [OperatorType.DOES_NOT_EXIST]: defineMessage({ defaultMessage: 'Add or Replace (Single)' })
}

