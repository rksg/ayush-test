import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  MdnsProxyForwardingRuleTypeEnum,
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
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' })
}
export const serviceTypeDescMapping: Record<ServiceType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Provides "portal" for guest access. Includes hotspot access (Passpoint, OpenRoaming)' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  // eslint-disable-next-line max-len
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Provides voice calling service over WiFi' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'Provides mDNS service' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'RUCKUS Dynamic Pre Shared Key Service' })
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
export const mdnsProxyForwardingRuleTypeLabelMapping: Record<MdnsProxyForwardingRuleTypeEnum, MessageDescriptor> = {
  [MdnsProxyForwardingRuleTypeEnum.AIRDISK]: defineMessage({ defaultMessage: 'AirDisk' }),
  [MdnsProxyForwardingRuleTypeEnum.AIRPLAY]: defineMessage({ defaultMessage: 'AirPlay' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.AIRPORT_MANAGEMENT]: defineMessage({ defaultMessage: 'Airport Management' }),
  [MdnsProxyForwardingRuleTypeEnum.AIRPRINT]: defineMessage({ defaultMessage: 'AirPrint' }),
  [MdnsProxyForwardingRuleTypeEnum.AIRTUNES]: defineMessage({ defaultMessage: 'AirTunes' }),
  [MdnsProxyForwardingRuleTypeEnum.APPLETV]: defineMessage({ defaultMessage: 'Apple TV' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.APPLE_FILE_SHARING]: defineMessage({ defaultMessage: 'Apple File Sharing' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.APPLE_MOBILE_DEVICES]: defineMessage({ defaultMessage: 'Apple Mobile Devices' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.GOOGLE_CHROMECAST]: defineMessage({ defaultMessage: 'Google Chromecast' }),
  [MdnsProxyForwardingRuleTypeEnum.ICLOUD_SYNC]: defineMessage({ defaultMessage: 'iCloud Sync' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.ITUNES_REMOTE]: defineMessage({ defaultMessage: 'iTunes Remote' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.ITUNES_SHARING]: defineMessage({ defaultMessage: 'iTunes Sharing' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.OPEN_DIRECTORY_MASTER]: defineMessage({ defaultMessage: 'Open Directory Master' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.OPTICAL_DISK_SHARING]: defineMessage({ defaultMessage: 'Optical Disk Sharing' }),
  [MdnsProxyForwardingRuleTypeEnum.OTHER]: defineMessage({ defaultMessage: 'Other' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.SCREEN_SHARING]: defineMessage({ defaultMessage: 'Screen Sharing' }),
  // eslint-disable-next-line max-len
  [MdnsProxyForwardingRuleTypeEnum.SECURE_FILE_SHARING]: defineMessage({ defaultMessage: 'Secure File Sharing' }),
  [MdnsProxyForwardingRuleTypeEnum.SECURE_SHELL]: defineMessage({ defaultMessage: 'Secure Shell' }),
  [MdnsProxyForwardingRuleTypeEnum.WWW_HTTP]: defineMessage({ defaultMessage: 'WWW HTTP' }),
  [MdnsProxyForwardingRuleTypeEnum.WWW_HTTPS]: defineMessage({ defaultMessage: 'WWW HTTPs' }),
  [MdnsProxyForwardingRuleTypeEnum.XGRID]: defineMessage({ defaultMessage: 'Xgrid' })
}
