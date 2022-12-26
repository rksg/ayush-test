import { generatePath } from '@acx-ui/react-router-dom'

import { ServiceType } from '../../constants'

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
  [ServiceType.WIFI_CALLING]: 'wifiCalling',
  [ServiceType.MDNS_PROXY]: 'mdnsProxy',
  [ServiceType.DPSK]: 'dpsk',
  [ServiceType.NETWORK_SEGMENTATION]: 'networkSegmentation'
}

export function getServiceRoutePath ({ type, oper }: ServiceRoutePathProps): string {
  return 'services/' + typePathMapping[type] + '/' + operationPathMapping[oper]
}

export function getServiceDetailsLink ({ type, oper, serviceId }: ServiceDetailsLinkProps): string {
  return generatePath(getServiceRoutePath({ type, oper }), { serviceId })
}

export function getServiceListRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'services'
}

export function getSelectServiceRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'services/select'
}
