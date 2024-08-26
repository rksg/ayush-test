import { ReactElement } from 'react'

import { RolesEnum, ScopeKeys }                                               from '@acx-ui/types'
import { AuthRoute, filterByAccess, hasCrossVenuesPermission, hasPermission } from '@acx-ui/user'

import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { hasDpskAccess }                                                                    from './dpskUtils'
import { policyOperScopeMap, policyTypeScopeMap, serviceOperScopeMap, serviceTypeScopeMap } from './servicePolicyAbacContentsMap'
import { ServiceOperation }                                                                 from './serviceRouteUtils'

export function filterServicePolicyByAccess <Item> (items: Item[]): Item[] {
  if (!hasCrossVenuesPermission({ needGlobalPermission: true })) return []
  return filterByAccess(items)
}

export function isServiceCardEnabled (
  cardItem: { type: ServiceType, disabled?: boolean },
  oper: ServiceOperation
): boolean {
  return !cardItem.disabled && !!hasServicePermission({ serviceType: cardItem.type, oper })
}

export function isServiceCardSetEnabled (
  set: { items: { type: ServiceType, disabled?: boolean }[] },
  oper: ServiceOperation
): boolean {
  return set.items.some(item => isServiceCardEnabled(item, oper))
}

export function getScopeKeyByService (serviceType: ServiceType, oper: ServiceOperation): ScopeKeys {
  const operScope = serviceOperScopeMap[oper]

  if ([ServiceType.EDGE_SD_LAN, ServiceType.EDGE_SD_LAN_P2].includes(serviceType) &&
    [ServiceOperation.CREATE, ServiceOperation.EDIT, ServiceOperation.DELETE].includes(oper)) {

    return ['edge-' + operScope] as ScopeKeys
  }

  const targetScope = serviceTypeScopeMap[serviceType]
  return targetScope.map(scope => scope + '-' + operScope as ScopeKeys[number])
}

// eslint-disable-next-line max-len
export function hasServicePermission (props: { serviceType: ServiceType, oper: ServiceOperation, roles?: RolesEnum[] }) {
  const { serviceType, oper, roles } = props
  const serviceScopeKeys = getScopeKeyByService(serviceType, oper)

  if ([ServiceOperation.LIST, ServiceOperation.DETAIL].includes(oper)) {
    return hasPermission({ scopes: serviceScopeKeys, roles })
  }

  if (serviceType === ServiceType.DPSK) return hasDpskAccess()

  // eslint-disable-next-line max-len
  return hasCrossVenuesPermission({ needGlobalPermission: true }) && hasPermission({ scopes: serviceScopeKeys, roles })
}

export function ServiceAuthRoute (props: {
  serviceType: ServiceType,
  oper: ServiceOperation,
  children: ReactElement
}) {
  const { serviceType, oper, children } = props
  const scopeKeys = getScopeKeyByService(serviceType, oper)

  return <AuthRoute
    requireCrossVenuesPermission={{ needGlobalPermission: true }}
    scopes={scopeKeys}
    children={children}
  />
}

export function isPolicyCardEnabled (
  cardItem: { type: PolicyType, disabled?: boolean },
  oper: PolicyOperation
): boolean {
  return !cardItem.disabled && !!hasPolicyPermission({ policyType: cardItem.type, oper })
}

// eslint-disable-next-line max-len
export function getScopeKeyByPolicy (policyType: PolicyType, oper: PolicyOperation): ScopeKeys {
  const operScope = policyOperScopeMap[oper]

  const targetScope = policyTypeScopeMap[policyType]

  return targetScope.map(scope => scope + '-' + operScope as ScopeKeys[number])
}

// eslint-disable-next-line max-len
export function hasPolicyPermission (props: { policyType: PolicyType, oper: PolicyOperation, roles?: RolesEnum[] }) {
  const { policyType, oper, roles } = props
  const policyScopeKeys = getScopeKeyByPolicy(policyType, oper)

  if ([PolicyOperation.LIST, PolicyOperation.DETAIL].includes(oper) || !policyScopeKeys) {
    return hasPermission({ scopes: policyScopeKeys, roles })
  }

  // eslint-disable-next-line max-len
  return hasCrossVenuesPermission({ needGlobalPermission: true }) && hasPermission({ scopes: policyScopeKeys, roles })
}

export function PolicyAuthRoute (props: {
  policyType: PolicyType,
  oper: PolicyOperation,
  children: ReactElement
}) {
  const { policyType, oper, children } = props
  const scopeKeys = getScopeKeyByPolicy(policyType, oper)

  return <AuthRoute
    requireCrossVenuesPermission={{ needGlobalPermission: true }}
    scopes={scopeKeys}
    children={children}
  />
}
