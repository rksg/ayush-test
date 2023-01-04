import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  QosPriorityEnum,
  ServiceAdminState,
  ServiceStatus,
  ServiceTechnology,
  ServiceType
} from '@acx-ui/rc/utils'

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'DHCP' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage({ defaultMessage: 'Network Segmentation' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Network Segmentation Auth Page for Switch' })
}
export const serviceTypeDescMapping: Record<ServiceType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Provides "portal" for guest access. Includes hotspot access (Passpoint, OpenRoaming)' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  // eslint-disable-next-line max-len
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Provides voice calling service over WiFi' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'Provides mDNS service' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'RUCKUS Dynamic Pre Shared Key Service' }),
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage(
    { defaultMessage: 'Controls network traffic by different segments' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Network Segmentation Auth Page for Switch Description' })
}
export const serviceTechnologyLabelMapping: Record<ServiceTechnology, MessageDescriptor> = {
  [ServiceTechnology.WIFI]: defineMessage({ defaultMessage: 'Wi-Fi' }),
  [ServiceTechnology.SWITCH]: defineMessage({ defaultMessage: 'Switch' })
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
