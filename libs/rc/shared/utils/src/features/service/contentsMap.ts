import { defineMessage, MessageDescriptor } from 'react-intl'

import { QosPriorityEnum, ServiceAdminState, ServiceStatus, ServiceType } from '../../constants'
import { PassphraseFormatEnum }                                           from '../../models/PassphraseFormatEnum'
import { PolicyDefaultAccess }                                            from '../../types'


export const passphraseFormatDescription: Record<PassphraseFormatEnum, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [PassphraseFormatEnum.MOST_SECURED]: defineMessage({ defaultMessage: 'Letters, numbers and symbols can be used' }),
  // eslint-disable-next-line max-len
  [PassphraseFormatEnum.KEYBOARD_FRIENDLY]: defineMessage({ defaultMessage: 'Only letters and numbers can be used' }),
  [PassphraseFormatEnum.NUMBERS_ONLY]: defineMessage({ defaultMessage: 'Only numbers can be used' })
}

export const defaultAccessLabelMapping: Record<PolicyDefaultAccess, MessageDescriptor> = {
  [PolicyDefaultAccess.ACCEPT]: defineMessage({ defaultMessage: 'ACCEPT' }),
  [PolicyDefaultAccess.REJECT]: defineMessage({ defaultMessage: 'REJECT' })
}

export const serviceTypeLabelMapping: Record<ServiceType, MessageDescriptor> = {
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Guest Portal' }),
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'DHCP for Wi-Fi' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'DHCP for RUCKUS Edge' }),
  [ServiceType.EDGE_FIREWALL]: defineMessage({ defaultMessage: 'Firewall' }),
  [ServiceType.EDGE_SD_LAN]: defineMessage({
    defaultMessage: 'SD-LAN' }),
  [ServiceType.EDGE_SD_LAN_P2]: defineMessage({
    defaultMessage: 'SD-LAN P2' }),
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Wi-Fi Calling' }),
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy' }),
  [ServiceType.EDGE_MDNS_PROXY]: defineMessage({ defaultMessage: 'mDNS Proxy for RUCKUS Edge' }),
  [ServiceType.EDGE_TNM_SERVICE]: defineMessage(
    { defaultMessage: 'Thirdparty Network Management' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'DPSK' }),
  [ServiceType.PIN]: defineMessage(
    { defaultMessage: 'Personal Identity Network' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'PIN Portal for Switch' }),
  [ServiceType.RESIDENT_PORTAL]: defineMessage({ defaultMessage: 'Resident Portal' }),
  [ServiceType.EDGE_OLT]: defineMessage(
    { defaultMessage: 'NOKIA GPON Services' }),
  [ServiceType.PORTAL_PROFILE]: defineMessage({ defaultMessage: 'Portal' }),
  [ServiceType.DHCP_CONSOLIDATION]: defineMessage({ defaultMessage: 'DHCP' })
}
export const serviceTypeDescMapping: Record<ServiceType, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [ServiceType.PORTAL]: defineMessage({ defaultMessage: 'Create a web authentication guest portal for end user connectivity' }),
  // eslint-disable-next-line max-len
  [ServiceType.DHCP]: defineMessage({ defaultMessage: 'Provide client DHCP address assignments from RUCKUS Access Points' }),
  [ServiceType.EDGE_DHCP]: defineMessage({ defaultMessage: 'Provides IP address to end devices' }),
  // eslint-disable-next-line max-len
  [ServiceType.DHCP_CONSOLIDATION]: defineMessage({ defaultMessage: 'Provide client DHCP address assignments from Access Points or RUCKUS Edge' }),
  // eslint-disable-next-line max-len
  [ServiceType.EDGE_FIREWALL]: defineMessage({ defaultMessage: 'Provides DDoS and ACL to protect your devices' }),
  [ServiceType.EDGE_SD_LAN]: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'Simplify network management with centralized control, enhanced automation, and improved programmability for local networks.' }),
  [ServiceType.EDGE_SD_LAN_P2]: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'Simplify network management with centralized control, enhanced automation, and improved programmability for local networks.' }),
  // eslint-disable-next-line max-len
  [ServiceType.WIFI_CALLING]: defineMessage({ defaultMessage: 'Identify clients using Wi-Fi calling and provide enhanced QoS' }),
  // eslint-disable-next-line max-len
  [ServiceType.MDNS_PROXY]: defineMessage({ defaultMessage: 'Proxy multicast DNS for discovery of layer 2 services' }),
  // eslint-disable-next-line max-len
  [ServiceType.EDGE_MDNS_PROXY]: defineMessage({ defaultMessage: 'Proxy multicast DNS for discovery of layer 2 services' }),
  [ServiceType.EDGE_TNM_SERVICE]: defineMessage(
    { defaultMessage: 'Manages and monitors thirdparty networks via Zabbix' }),
  [ServiceType.DPSK]: defineMessage({ defaultMessage: 'RUCKUS Dynamic Pre Shared Key Service' }),
  [ServiceType.PIN]: defineMessage(
    { defaultMessage: 'Controls network traffic by different segments' }),
  [ServiceType.WEBAUTH_SWITCH]: defineMessage(
    { defaultMessage: 'Templates of PIN (Personal Identity Network) Portal for Switch' }),
  [ServiceType.RESIDENT_PORTAL]: defineMessage(
    { defaultMessage: 'Resident portal for property management' }),
  [ServiceType.EDGE_OLT]: defineMessage(
    { defaultMessage: 'Nokia OLT-ONT network management' }),
  [ServiceType.PORTAL_PROFILE]: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'Create a web authentication portal for guest end-user connectivity or a portal for PIN service.' })
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
