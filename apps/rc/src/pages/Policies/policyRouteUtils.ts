import { PolicyType }   from '@acx-ui/rc/utils'
import { generatePath } from '@acx-ui/react-router-dom'

export enum PolicyOperation {
  CREATE,
  EDIT,
  DETAIL
}

export interface PolicyRoutePathProps {
  type: PolicyType;
  oper: PolicyOperation;
}

export interface PolicyDetailsLinkProps extends PolicyRoutePathProps {
  oper: Exclude<PolicyOperation, PolicyOperation.CREATE>;
  policyId: string;
}

const operationPathMapping: Record<PolicyOperation, string> = {
  [PolicyOperation.CREATE]: 'create',
  [PolicyOperation.EDIT]: ':policyId/edit',
  [PolicyOperation.DETAIL]: ':policyId/detail'
}

const typePathMapping: Record<PolicyType, string> = {
  [PolicyType.AAA]: 'aaa',
  [PolicyType.ACCESS_CONTROL]: 'accessControl',
  [PolicyType.CLIENT_ISOLATION]: 'clientIsolation',
  [PolicyType.ROGUE_AP_DETECTION]: 'rougeAp',
  [PolicyType.SYSLOG]: 'syslog',
  [PolicyType.VLAN_POOL]: 'vlanPool'
}

export function getPolicyRoutePath ({ type, oper }: PolicyRoutePathProps): string {
  return 'policies/' + typePathMapping[type] + '/' + operationPathMapping[oper]
}

export function getPolicyDetailsLink ({ type, oper, policyId }: PolicyDetailsLinkProps): string {
  return generatePath(getPolicyRoutePath({ type, oper }), { policyId })
}

export function getPolicyListRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'policies'
}

export function getSelectPolicyRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'policies/select'
}
