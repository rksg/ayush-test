import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  NetworkTypeEnum,
  QosPriorityEnum,
  ServiceAdminState,
  ServiceStatus,
  ServiceType
} from '@acx-ui/rc/utils'

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'DHCP for Wi-Fi' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'DHCP for SmartEdge' }),
  [ServiceType.EDGE_FIREWALL]: defineMessage({ defaultMessage: 'Firewall' }),
  [ServiceType.EDGE_SD_LAN]: defineMessage({
    defaultMessage: 'SD-LAN' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage(
    { defaultMessage: 'Personal Identity Network' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Personal Identity Network Auth Page for Switch' }),
  [ServiceType.RESIDENT_PORTAL]: defineMessage({ defaultMessage: 'Resident Portal' })
}
export const serviceTypeDescMapping: Record<ServiceType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Create a web authentication guest portal for end user connectivity' }),
  // eslint-disable-next-line max-len
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'Provide client DHCP address assignments from RUCKUS Access Points' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  // eslint-disable-next-line max-len
  [ServiceType.EDGE_FIREWALL]: defineMessage({ defaultMessage: 'Provides DDoS and ACL to protect your devices' }),
  [ServiceType.EDGE_SD_LAN]: defineMessage({
    defaultMessage: 'SD-LAN' }),
  // eslint-disable-next-line max-len
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Identify clients using Wi-Fi calling and provide enhanced QoS' }),
  // eslint-disable-next-line max-len
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'Proxy multicast DNS for discovery of layer 2 services' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'RUCKUS Dynamic Pre Shared Key Service' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage(
    { defaultMessage: 'Controls network traffic by different segments' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Templates of Personal Identity Network Auth Page for Switch' }),
  [ServiceType.RESIDENT_PORTAL]: defineMessage(
    { defaultMessage: 'Resident portal for property management' })
}
export const serviceStatusLabelMapping: Record<ServiceStatus, MessageDescriptor> = {
  [ServiceStatus.UP]: defineMessage({ defaultMessage: 'Up' }),
  [ServiceStatus.DOWN]: defineMessage({ defaultMessage: 'Down' })
}
export const serviceAdminStateLabelMapping: Record<ServiceAdminState, MessageDescriptor> = {
  [ServiceAdminState.ENABLED]: defineMessage({ defaultMessage: 'Enabled' }),
  [ServiceAdminState.DISABLED]: defineMessage({ defaultMessage: 'Disabled' })
}

// eslint-disable-next-line max-len
export const wifiCallingQosPriorityLabelMapping: Record<QosPriorityEnum, MessageDescriptor> = {
  [QosPriorityEnum.WIFICALLING_PRI_VOICE]: defineMessage({ defaultMessage: 'Voice' }),
  [QosPriorityEnum.WIFICALLING_PRI_VIDEO]: defineMessage({ defaultMessage: 'Video' }),
  [QosPriorityEnum.WIFICALLING_PRI_BE]: defineMessage({ defaultMessage: 'Best Effort' }),
  [QosPriorityEnum.WIFICALLING_PRI_BG]: defineMessage({ defaultMessage: 'Background' })
}

export const networkTypes: Record<NetworkTypeEnum, MessageDescriptor> = {
  [NetworkTypeEnum.OPEN]: defineMessage({ defaultMessage: 'Open Network' }),
  [NetworkTypeEnum.PSK]: defineMessage({ defaultMessage: 'Passphrase (PSK/SAE)' }),
  [NetworkTypeEnum.DPSK]: defineMessage({ defaultMessage: 'Dynamic Pre-Shared Key (DPSK)' }),
  [NetworkTypeEnum.AAA]: defineMessage({ defaultMessage: 'Enterprise AAA (802.1X)' }),
  [NetworkTypeEnum.CAPTIVEPORTAL]: defineMessage({ defaultMessage: 'Captive Portal' })
}
