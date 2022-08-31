import { defineMessage, MessageDescriptor } from 'react-intl'

import { ServiceAdminState, ServiceStatus, ServiceTechnology, ServiceType } from '@acx-ui/rc/utils'

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP_WIFI]: defineMessage({ defaultMessage: 'DHCP for Wi-Fi' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' })
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
