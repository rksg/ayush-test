import { generatePath } from '@acx-ui/react-router-dom'

import { PolicyType } from '../../types'

export enum MacRegistrationDetailsTabKey {
  OVERVIEW = 'overview',
  MAC_REGISTRATIONS = 'macRegistrations'
}

export enum PolicyOperation {
  CREATE,
  EDIT,
  DETAIL,
  LIST
}

interface PolicyRoutePathProps {
  type: PolicyType;
  oper: PolicyOperation;
}

interface PolicyDetailsLinkProps extends PolicyRoutePathProps {
  oper: Exclude<PolicyOperation, PolicyOperation.CREATE>;
  policyId: string;
  activeTab?: MacRegistrationDetailsTabKey; // Union the other policies tab keys if needed
}

const operationPathMapping: Record<PolicyOperation, string> = {
  [PolicyOperation.CREATE]: 'create',
  [PolicyOperation.EDIT]: ':policyId/edit',
  [PolicyOperation.DETAIL]: ':policyId/detail',
  [PolicyOperation.LIST]: 'list'
}

const typePathMapping: Record<PolicyType, string> = {
  [PolicyType.AAA]: 'aaa',
  [PolicyType.ACCESS_CONTROL]: 'accessControl',
  [PolicyType.CLIENT_ISOLATION]: 'clientIsolation',
  [PolicyType.ROGUE_AP_DETECTION]: 'rogueAp',
  [PolicyType.SYSLOG]: 'syslog',
  [PolicyType.VLAN_POOL]: 'vlanPool',
  [PolicyType.MAC_REGISTRATION_LIST]: 'macRegistrationList',
  [PolicyType.LAYER_2_POLICY]: 'layer2Policy',
  [PolicyType.LAYER_3_POLICY]: 'layer3Policy',
  [PolicyType.APPLICATION_POLICY]: 'applicationPolicy',
  [PolicyType.DEVICE_POLICY]: 'devicePolicy',
  [PolicyType.SNMP_AGENT]: 'snmpAgent',
  [PolicyType.ADAPTIVE_POLICY]: 'adaptivePolicy',
  [PolicyType.ADAPTIVE_POLICY_SET]: 'adaptivePolicySet',
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: 'radiusAttributeGroup',
  [PolicyType.TUNNEL_PROFILE]: 'tunnelProfile',
  [PolicyType.CONNECTION_METERING]: 'connectionMetering'
}

export function getPolicyRoutePath (props: PolicyRoutePathProps): string {
  const { type, oper } = props
  const paths = ['policies']

  paths.push(typePathMapping[type])
  paths.push(operationPathMapping[oper])
  if (hasTab(props)) {
    paths.push(':activeTab')
  }

  return paths.join('/')
}

export function getPolicyDetailsLink (props: PolicyDetailsLinkProps): string {
  const { type, oper, policyId, activeTab } = props

  if (hasTab({ type, oper })) {
    return generatePath(getPolicyRoutePath({ type, oper }), { policyId, activeTab })
  }

  return generatePath(getPolicyRoutePath({ type, oper }), { policyId })
}

export function getPolicyListRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'policies'
}

export function getSelectPolicyRoutePath (prefixSlash = false): string {
  return (prefixSlash ? '/' : '') + 'policies/select'
}

function hasTab ({ type, oper }: PolicyRoutePathProps): boolean {
  if (type === PolicyType.MAC_REGISTRATION_LIST && oper === PolicyOperation.DETAIL) {
    return true
  }
  return false
}

// eslint-disable-next-line max-len
export function getAdaptivePolicyDetailRoutePath (oper: PolicyOperation): string {
  const paths = ['policies']
  paths.push(typePathMapping[PolicyType.ADAPTIVE_POLICY])
  paths.push(':templateId')
  paths.push(operationPathMapping[oper])
  return paths.join('/')
}

// eslint-disable-next-line max-len
export function getAdaptivePolicyDetailLink (props: { policyId: string, templateId: string, oper: Exclude<PolicyOperation, PolicyOperation.CREATE> }): string {
  const { policyId, templateId, oper } = props
  return generatePath(getAdaptivePolicyDetailRoutePath(oper), { policyId, templateId })
}
