import { generatePath } from '@acx-ui/react-router-dom'

import { ServiceType } from '../../constants'

export enum DpskDetailsTabKey {
  OVERVIEW = 'overview',
  PASSPHRASE_MGMT = 'passphraseMgmt'
}


export enum ServiceOperation {
  CREATE,
  EDIT,
  DETAIL,
  LIST
}

interface ServiceRoutePathProps {
  type: ServiceType;
  oper: ServiceOperation;
}

interface ServiceDetailsLinkProps extends ServiceRoutePathProps {
  oper: Exclude<ServiceOperation, ServiceOperation.CREATE>;
  serviceId: string;
  activeTab?: DpskDetailsTabKey; // Union the other services tab keys if needed
}

const operationPathMapping: Record<ServiceOperation, string> = {
  [ServiceOperation.CREATE]: 'create',
  [ServiceOperation.EDIT]: ':serviceId/edit',
  [ServiceOperation.DETAIL]: ':serviceId/detail',
  [ServiceOperation.LIST]: 'list'
}

const typePathMapping: Record<ServiceType, string> = {
  [ServiceType.PORTAL]: 'portal',
  [ServiceType.DHCP]: 'dhcp',
  [ServiceType.EDGE_DHCP]: 'edgeDhcp',
  [ServiceType.EDGE_FIREWALL]: 'edgeFirewall',
  [ServiceType.WIFI_CALLING]: 'wifiCalling',
  [ServiceType.MDNS_PROXY]: 'mdnsProxy',
  [ServiceType.DPSK]: 'dpsk',
  [ServiceType.NETWORK_SEGMENTATION]: 'networkSegmentation',
  [ServiceType.WEBAUTH_SWITCH]: 'webAuth',
  [ServiceType.RESIDENT_PORTAL]: 'residentPortal'
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

  paths.push(typePathMapping[type])
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
