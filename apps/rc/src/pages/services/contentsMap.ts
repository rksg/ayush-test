import { defineMessage, MessageDescriptor } from 'react-intl'

import { ServiceAdminState, ServiceStatus, ServiceTechnology, ServiceType } from '@acx-ui/rc/utils'

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP_WIFI]: defineMessage({ defaultMessage: 'DHCP for Wi-Fi' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' })
}
export const serviceTypeDescMapping: Record<ServiceType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Provides "portal" for guest access. Includes hotspot access (Passpoint, OpenRoaming)' }),
  [ServiceType.DHCP_WIFI]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  // eslint-disable-next-line max-len
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Provides voice calling service over WiFi' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'Provides mDNS service' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'RUCKUS Dynamic Pre Shared Key Service' })
}
export const serviceTechnologyabelMapping: Record<ServiceTechnology, MessageDescriptor> = {
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
