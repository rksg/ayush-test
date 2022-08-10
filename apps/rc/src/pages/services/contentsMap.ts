import { ServiceAdminState, ServiceStatus, ServiceTechnology, ServiceType } from '@acx-ui/rc/utils'

export const serviceTypeLabelMapping: { [key in ServiceType]: string } = {
  [ServiceType.PORTAL]: 'Portal',
  [ServiceType.DHCP_WIFI]: 'DHCP for Wi-Fi',
  [ServiceType.WIFI_CALLING]: 'Wi-Fi Calling',
  [ServiceType.MDNS_PROXY]: 'mDNS Proxy',
  [ServiceType.DPSK]: 'DPSK'
}
export const serviceTechnologyabelMapping: { [key in ServiceTechnology]: string } = {
  [ServiceTechnology.WIFI]: 'Wi-Fi',
  [ServiceTechnology.SWITCH]: 'Switch'
}
export const serviceStatusLabelMapping: { [key in ServiceStatus]: string } = {
  [ServiceStatus.UP]: 'Up',
  [ServiceStatus.DOWN]: 'Down'
}
export const serviceAdminStateLabelMapping: { [key in ServiceAdminState]: string } = {
  [ServiceAdminState.ENABLED]: 'Enabled',
  [ServiceAdminState.DISABLED]: 'Disabled'
}
