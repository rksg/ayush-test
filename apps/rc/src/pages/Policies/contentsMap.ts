import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  PolicyTechnology,
  PolicyType,
  RogueRuleType,
  Layer3ProtocolType,
  OsVendorEnum,
  DeviceTypeEnum,
  ApplicationAclType,
  ApplicationRuleType
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
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy' })
}
export const policyTypeDescMapping: Record<PolicyType, MessageDescriptor> = {
  [PolicyType.AAA]: defineMessage({ defaultMessage: 'AAA description (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.ACCESS_CONTROL]: defineMessage({ defaultMessage: 'Access Control description (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.CLIENT_ISOLATION]: defineMessage({ defaultMessage: 'Client Isolation description (TBD)' }),
  // eslint-disable-next-line max-len
  [PolicyType.ROGUE_AP_DETECTION]: defineMessage({ defaultMessage: 'Rogue AP Detection description (TBD)' }),
  [PolicyType.SYSLOG]: defineMessage({ defaultMessage: 'Syslog description (TBD)' }),
  [PolicyType.VLAN_POOL]: defineMessage({ defaultMessage: 'VLAN Pool description (TBD)' }),
  [PolicyType.MAC_REGISTRATION_LIST]: defineMessage({ defaultMessage: 'MAC Registration (TBD)' }),
  [PolicyType.LAYER_2_POLICY]: defineMessage({ defaultMessage: 'Layer 2 Policy (TBD)' }),
  [PolicyType.LAYER_3_POLICY]: defineMessage({ defaultMessage: 'Layer 3 Policy (TBD)' }),
  [PolicyType.APPLICATION_POLICY]: defineMessage({ defaultMessage: 'Application Policy (TBD)' }),
  [PolicyType.DEVICE_POLICY]: defineMessage({ defaultMessage: 'Device Policy (TBD)' })
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




