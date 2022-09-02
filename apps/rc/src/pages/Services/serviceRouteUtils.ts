import { ServiceType } from '@acx-ui/rc/utils'

export enum ServiceOperation {
  CREATE,
  EDIT,
  DETAIL
}

export interface ServiceRoutePathProps {
  type: ServiceType;
  oper: ServiceOperation;
}

export interface ServiceDetailsLinkProps extends ServiceRoutePathProps {
  oper: Exclude<ServiceOperation, ServiceOperation.CREATE>;
  serviceId: string;
}

const operationPathMapping: Record<ServiceOperation, string> = {
  [ServiceOperation.CREATE]: 'create',
  [ServiceOperation.EDIT]: ':serviceId/edit',
  [ServiceOperation.DETAIL]: ':serviceId/detail'
}

const typePathMapping: Record<ServiceType, string> = {
  [ServiceType.PORTAL]: 'portal',
  [ServiceType.DHCP]: 'dhcp',
  [ServiceType.WIFI_CALLING]: 'wifiCalling',
  [ServiceType.MDNS_PROXY]: 'mdnsProxy',
  [ServiceType.DPSK]: 'dpsk'
}

export function getServiceRoutePath ({ type, oper }: ServiceRoutePathProps): string {
  return 'services/' + typePathMapping[type] + '/' + operationPathMapping[oper]
}

export function getServiceDetailsLink ({ type, oper, serviceId }: ServiceDetailsLinkProps): string {
  return getServiceRoutePath({ type, oper }).replace(/:serviceId/, serviceId)
}
