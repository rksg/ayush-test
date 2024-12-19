import { ReactElement } from 'react'

import { RolesEnum, ScopeKeys }                                                                           from '@acx-ui/types'
import { AuthRoute, filterByAccess, goToNoPermission, hasCrossVenuesPermission, hasPermission, hasRoles } from '@acx-ui/user'

import { ServiceType }     from '../../constants'
import { PolicyType }      from '../../types'
import { PolicyOperation } from '../policy'

import { getPolicyAllowedOperation, getServiceAllowedOperation } from './allowedOperationUtils'
import {
  policyOperScopeMap, policyTypeScopeMap, serviceOperScopeMap, serviceTypeScopeMap,
  SvcPcyAllowedScope, SvcPcyAllowedType, SvcPcyScopeMap,
  SvcPcyAllowedOper, SvcPcyOperMap
} from './servicePolicyAbacContentsMap'
import { ServiceOperation } from './serviceRouteUtils'

export function filterByAccessForServicePolicyMutation <Item> (items: Item[]): Item[] {
  if (!hasCrossVenuesPermission({ needGlobalPermission: true })) return []
  return filterByAccess(items)
}

export function hasDpskAccess () {
  return hasCrossVenuesPermission()
    && hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR, RolesEnum.DPSK_ADMIN])
}

export function isServiceCardEnabled (
  cardItem: { type: ServiceType, disabled?: boolean },
  oper: ServiceOperation
): boolean {
  return isCardEnabled<ServiceType, ServiceOperation>(cardItem, oper, hasServicePermission)
}

export function isServiceCardSetEnabled (
  set: { items: { type: ServiceType, disabled?: boolean }[] },
  oper: ServiceOperation
): boolean {
  return set.items.some(item => isServiceCardEnabled(item, oper))
}

export function getScopeKeyByService (type: ServiceType, oper: ServiceOperation): ScopeKeys {
  return getScopeKey<ServiceType, ServiceOperation>({
    type,
    oper,
    operScopeMap: serviceOperScopeMap,
    typeScopeMap: serviceTypeScopeMap
  })
}

// eslint-disable-next-line max-len
export function hasServicePermission (props: { type: ServiceType, oper: ServiceOperation, roles?: RolesEnum[] }) {
  const specialCheckFn = () => props.type === ServiceType.DPSK && !!hasDpskAccess()
  return hasGenericPermission({
    ...props,
    getScopeKeyFn: getScopeKeyByService,
    getAllowedOperation: getServiceAllowedOperation,
    specialCheckFn
  })
}

export function ServiceAuthRoute (props: {
  serviceType: ServiceType,
  oper: ServiceOperation,
  children: ReactElement
}) {
  const { serviceType, oper, children } = props

  if ([ServiceOperation.DETAIL, ServiceOperation.LIST].includes(oper)) {
    return <AuthRoute
      scopes={getScopeKeyByService(serviceType, oper)}
      children={children}
    />
  }

  if (serviceType === ServiceType.DPSK) {
    return hasDpskAccess() ? children : goToNoPermission()
  }

  return <AuthRoute
    requireCrossVenuesPermission={{ needGlobalPermission: true }}
    children={children}
  />
}

export function isPolicyCardEnabled (
  cardItem: { type: PolicyType, disabled?: boolean },
  oper: PolicyOperation
): boolean {
  return isCardEnabled<PolicyType, PolicyOperation>(cardItem, oper, hasPolicyPermission)
}

export function getScopeKeyByPolicy (type: PolicyType, oper: PolicyOperation): ScopeKeys {
  return getScopeKey<PolicyType, PolicyOperation>({
    type,
    oper,
    operScopeMap: policyOperScopeMap,
    typeScopeMap: policyTypeScopeMap
  })
}

export function hasPolicyPermission (props: { type: PolicyType, oper: PolicyOperation }) {
  return hasGenericPermission({
    ...props,
    getScopeKeyFn: getScopeKeyByPolicy,
    getAllowedOperation: getPolicyAllowedOperation
  })
}

export function PolicyAuthRoute (props: {
  policyType: PolicyType,
  oper: PolicyOperation,
  children: ReactElement
}) {
  const { policyType, oper, children } = props

  if ([PolicyOperation.LIST, PolicyOperation.DETAIL].includes(oper)) {
    return <AuthRoute
      scopes={getScopeKeyByPolicy(policyType, oper)}
      children={children}
    />
  }

  return <AuthRoute
    requireCrossVenuesPermission={{ needGlobalPermission: true }}
    children={children}
  />
}

function isCardEnabled<T, U> (
  cardItem: { type: T, disabled?: boolean },
  oper: U,
  hasPermission: (props: { type: T, oper: U }) => boolean | undefined
): boolean {
  return !cardItem.disabled && !!hasPermission({ type: cardItem.type, oper })
}

interface GetScopeKeyProps<T extends SvcPcyAllowedType, U extends SvcPcyAllowedOper> {
  type: T,
  oper: U,
  typeScopeMap: SvcPcyScopeMap<T>,
  operScopeMap: SvcPcyOperMap<U>,
  defaultScope?: SvcPcyAllowedScope
}

function getScopeKey<T extends SvcPcyAllowedType, U extends SvcPcyAllowedOper> (
  props: GetScopeKeyProps<T, U>
): ScopeKeys {
  const { type, oper, typeScopeMap, operScopeMap, defaultScope = ['wifi'] } = props
  const operScope = operScopeMap[oper]

  const specialCaseResult = getSpecialScopeKey(props)

  if (specialCaseResult) return specialCaseResult

  const targetScope = (typeScopeMap[type] || defaultScope) as SvcPcyAllowedScope
  return targetScope.map(scope => (scope + '-' + operScope) as ScopeKeys[number])
}

function getSpecialScopeKey<T extends SvcPcyAllowedType, U extends SvcPcyAllowedOper> (
  props: GetScopeKeyProps<T, U>
): ScopeKeys | null {
  const { type, oper, operScopeMap } = props

  switch (type) {
    case ServiceType.EDGE_SD_LAN:
    case ServiceType.EDGE_SD_LAN_P2:
      // eslint-disable-next-line max-len
      if (oper === ServiceOperation.CREATE || oper === ServiceOperation.EDIT || oper === ServiceOperation.DELETE) {
        return ['edge-' + operScopeMap[oper]] as ScopeKeys
      }
      return null
    case ServiceType.PIN:
      // eslint-disable-next-line max-len
      if (oper === ServiceOperation.CREATE || oper === ServiceOperation.EDIT || oper === ServiceOperation.DELETE) {
        return ['edge-' + operScopeMap[oper], 'switch-' + operScopeMap[oper]] as ScopeKeys
      }
  }
  return null
}

type hasGenericPermissionProps<T extends SvcPcyAllowedType, U extends SvcPcyAllowedOper> = {
  type: T
  oper: U
  roles?: RolesEnum[],
  getScopeKeyFn: (type: T, oper: U) => ScopeKeys,
  getAllowedOperation: (type: T, oper: U) => string | undefined,
  specialCheckFn?: () => boolean
}

function hasGenericPermission<T extends SvcPcyAllowedType, U extends SvcPcyAllowedOper> (
  props: hasGenericPermissionProps<T, U>
): boolean {
  const { type, oper, roles, getScopeKeyFn, specialCheckFn, getAllowedOperation } = props

  // TODO: Implement isAllowedOperationCheckEnabled
  const isAllowedOperationCheckEnabled = true
  if (isAllowedOperationCheckEnabled) {
    return hasPermission({ allowedOperations: getAllowedOperation(type, oper) })
  }

  const scopeKeys = getScopeKeyFn(type, oper)

  // eslint-disable-next-line max-len
  if ([ServiceOperation.LIST, ServiceOperation.DETAIL, PolicyOperation.LIST, PolicyOperation.DETAIL].includes(oper as unknown as SvcPcyAllowedOper)) {
    return true // Always allow users to access the view page
  }

  if (specialCheckFn && specialCheckFn()) {
    return true
  }

  // eslint-disable-next-line max-len
  return !!hasCrossVenuesPermission({ needGlobalPermission: true }) && hasPermission({ scopes: scopeKeys, roles })
}
