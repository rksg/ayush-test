import { defineMessage, MessageDescriptor } from 'react-intl'

import {
  BridgeServiceEnum,
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
  [ServiceType.NETWORK_SEGMENTATION]: defineMessage({ defaultMessage: 'Network Segmentation' })
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
    { defaultMessage: 'Controls network traffic by different segments' })
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
export const mdnsProxyForwardingRuleTypeLabelMapping: Record<BridgeServiceEnum, MessageDescriptor> = {
  [BridgeServiceEnum.AIRDISK]: defineMessage({ defaultMessage: 'AirDisk' }),
  [BridgeServiceEnum.AIRPLAY]: defineMessage({ defaultMessage: 'AirPlay' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.AIRPORT_MANAGEMENT]: defineMessage({ defaultMessage: 'Airport Management' }),
  [BridgeServiceEnum.AIRPRINT]: defineMessage({ defaultMessage: 'AirPrint' }),
  [BridgeServiceEnum.AIRTUNES]: defineMessage({ defaultMessage: 'AirTunes' }),
  [BridgeServiceEnum.APPLETV]: defineMessage({ defaultMessage: 'Apple TV' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.APPLE_FILE_SHARING]: defineMessage({ defaultMessage: 'Apple File Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.APPLE_MOBILE_DEVICES]: defineMessage({ defaultMessage: 'Apple Mobile Devices' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.GOOGLE_CHROMECAST]: defineMessage({ defaultMessage: 'Google Chromecast' }),
  [BridgeServiceEnum.ICLOUD_SYNC]: defineMessage({ defaultMessage: 'iCloud Sync' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.ITUNES_REMOTE]: defineMessage({ defaultMessage: 'iTunes Remote' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.ITUNES_SHARING]: defineMessage({ defaultMessage: 'iTunes Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.OPEN_DIRECTORY_MASTER]: defineMessage({ defaultMessage: 'Open Directory Master' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.OPTICAL_DISK_SHARING]: defineMessage({ defaultMessage: 'Optical Disk Sharing' }),
  [BridgeServiceEnum.OTHER]: defineMessage({ defaultMessage: 'Other' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.SCREEN_SHARING]: defineMessage({ defaultMessage: 'Screen Sharing' }),
  // eslint-disable-next-line max-len
  [BridgeServiceEnum.SECURE_FILE_SHARING]: defineMessage({ defaultMessage: 'Secure File Sharing' }),
  [BridgeServiceEnum.SECURE_SHELL]: defineMessage({ defaultMessage: 'Secure Shell' }),
  [BridgeServiceEnum.WWW_HTTP]: defineMessage({ defaultMessage: 'WWW HTTP' }),
  [BridgeServiceEnum.WWW_HTTPS]: defineMessage({ defaultMessage: 'WWW HTTPs' }),
  [BridgeServiceEnum.XGRID]: defineMessage({ defaultMessage: 'Xgrid' })
}
