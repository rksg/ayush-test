import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  QosPriorityEnum,
  ServiceAdminState,
  ServiceStatus,
  ServiceType
} from '@acx-ui/rc/utils'

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'DHCP for Wi-Fi' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'DHCP for SmartEdge' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage({ defaultMessage: 'Network Segmentation' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Network Segmentation Auth Page for Switch' })
}
export const serviceTypeDescMapping: Record<ServiceType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Create a web authentication guest portal for end user connectivity' }),
  // eslint-disable-next-line max-len
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'Provide client DHCP address assignments from RUCKUS Access Points' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  // eslint-disable-next-line max-len
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Identify clients using Wi-Fi calling and provide enhanced QoS' }),
  // eslint-disable-next-line max-len
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'Proxy multicast DNS for discovery of layer 2 services' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'RUCKUS Dynamic Pre Shared Key Service' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage(
    { defaultMessage: 'Controls network traffic by different segments' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Templates of Network Segmentation Auth Page for Switch' })
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
