import { generatePath } from '@acx-ui/react-router-dom'

import { ServiceOperation, ServiceType } from '../../constants'
import { DpskDetailsTabKey, PolicyType } from '../../types'
import { policyTypePathMapping }         from '../policy'

export interface ServiceRoutePathProps {
  type: ServiceType;
  oper: ServiceOperation;
}

export interface ServiceDetailsLinkProps extends ServiceRoutePathProps {
  oper: Exclude<ServiceOperation, ServiceOperation.CREATE>;
  serviceId: string;
  activeTab?: DpskDetailsTabKey; // Union the other services tab keys if needed
}

const operationPathMapping: Record<ServiceOperation, string> = {
  [ServiceOperation.CREATE]: 'create',
  [ServiceOperation.EDIT]: ':serviceId/edit',
  [ServiceOperation.DETAIL]: ':serviceId/detail',
  [ServiceOperation.LIST]: 'list',
  [ServiceOperation.DELETE]: ''
}

const serviceTypePathMapping: Record<ServiceType, string> = {
  [ServiceType.PORTAL]: 'portal',
  [ServiceType.DHCP]: 'dhcp',
  [ServiceType.EDGE_DHCP]: 'edgeDhcp',
  [ServiceType.EDGE_FIREWALL]: 'edgeFirewall',
  [ServiceType.EDGE_SD_LAN]: 'edgeSdLan',
  [ServiceType.EDGE_SD_LAN_P2]: 'edgeSdLanP2', // temporary type before SD-LAN GA2 dev done.
  [ServiceType.WIFI_CALLING]: 'wifiCalling',
  [ServiceType.MDNS_PROXY]: 'mdnsProxy',
  [ServiceType.EDGE_MDNS_PROXY]: 'edgeMdnsProxy',
  [ServiceType.EDGE_TNM_SERVICE]: 'edgeTnmService',
  [ServiceType.DPSK]: 'dpsk',
  [ServiceType.PIN]: 'personalIdentityNetwork',
  [ServiceType.WEBAUTH_SWITCH]: 'webAuth',
  [ServiceType.RESIDENT_PORTAL]: 'residentPortal',
  [ServiceType.EDGE_OLT]: 'optical', // temporary type before PoC done.
  [ServiceType.PORTAL_PROFILE]: 'portalProfile',
  [ServiceType.MDNS_PROXY_CONSOLIDATION]: 'mdnsProxyConsolidation'
}

function hasTab ({ type, oper }: ServiceRoutePathProps): boolean {
  if (type === ServiceType.DPSK && oper === ServiceOperation.DETAIL) {
    return true
  }
  return false
}

// Ex: services/{type}/:serviceId/detail/:activeTab
export function getServiceRoutePath (props: ServiceRoutePathProps): string {
  const { type, oper } = props
  const paths = ['services']

  paths.push(serviceTypePathMapping[type])
  paths.push(operationPathMapping[oper])
  if (hasTab(props)) {
    paths.push(':activeTab')
  }

  return paths.join('/')
}

export function getServiceDetailsLink (props: ServiceDetailsLinkProps): string {
  const { type, oper, serviceId, activeTab } = props

  if (hasTab({ type, oper })) {
    return generatePath(getServiceRoutePath({ type, oper }), { serviceId, activeTab })
  }

  return generatePath(getServiceRoutePath({ type, oper }), { serviceId })
}

export function getServiceListRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'services/list'
}

export function getSelectServiceRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'services/select'
}

export function getServiceCatalogRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'services/catalog'
}

export function dpskAdminRoutePathKeeper (currentPath: string): boolean {
  const dpskAllowedPaths = [
    serviceTypePathMapping[ServiceType.DPSK],
    policyTypePathMapping[PolicyType.ADAPTIVE_POLICY_SET],
    policyTypePathMapping[PolicyType.ADAPTIVE_POLICY],
    policyTypePathMapping[PolicyType.RADIUS_ATTRIBUTE_GROUP]
  ]
  const paths = currentPath.split('/')

  return dpskAllowedPaths.some(p => paths.includes(p))
}
