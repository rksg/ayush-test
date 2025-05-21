import { MessageDescriptor } from 'react-intl'

import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { RolesEnum }                                              from '@acx-ui/types'
import { getIntl }                                                from '@acx-ui/utils'

import { LocationExtended }                                                         from '../../common'
import { ServiceOperation, ServiceType }                                            from '../../constants'
import { PolicyOperation, PolicyType, policyTypeDescMapping }                       from '../../types'
import { generatePolicyListBreadcrumb, getPolicyRoutePath, policyTypeLabelMapping } from '../policy'
import {
  generateServiceListBreadcrumb,
  getServiceCatalogRoutePath,
  getServiceListRoutePath,
  getServiceRoutePath, hasPolicyPermission, hasServicePermission, hasSomePoliciesPermission,
  hasSomeServicesPermission, isPolicyCardEnabled, isServiceCardEnabled, serviceTypeDescMapping,
  serviceTypeLabelMapping
} from '../service'

import { UnifiedService, UnifiedServiceSourceType } from './constants'

type UnifiedServiceTypeSet = Pick<UnifiedService, 'type' | 'sourceType'>

export type BuildUnifiedServicesIncomingType =
  Omit<UnifiedService<MessageDescriptor>, 'label' | 'route' | 'description'>

export function buildUnifiedServices (
  list: Array<BuildUnifiedServicesIncomingType>,
  isNewServiceCatalogEnabled: boolean
): Array<UnifiedService> {

  return list.map(item => ({
    label: translateDescriptor(getLabelDescriptor(item)),
    route: getUnifiedServiceRoute(item, 'list'),
    description: translateDescriptor(getDescriptionDescriptor(item)),
    breadcrumb: generateUnifiedServiceListBreadCrumb(item, isNewServiceCatalogEnabled),
    ...item,
    searchKeywords: item.searchKeywords?.map(keyword => translateDescriptor(keyword))
  }))
}

function getMessageDescriptor (
  svc: UnifiedServiceTypeSet,
  serviceMapping: Record<string, MessageDescriptor>,
  policyMapping: Record<string, MessageDescriptor>
): MessageDescriptor | null {
  if (svc.sourceType === UnifiedServiceSourceType.SERVICE) {
    return serviceMapping[svc.type as ServiceType] ?? null
  } else {
    return policyMapping[svc.type as PolicyType] ?? null
  }
}

function getLabelDescriptor (svc: UnifiedServiceTypeSet): MessageDescriptor | null {
  return getMessageDescriptor(svc, serviceTypeLabelMapping, policyTypeLabelMapping)
}

function getDescriptionDescriptor (svc: UnifiedServiceTypeSet): MessageDescriptor | null {
  return getMessageDescriptor(svc, serviceTypeDescMapping, policyTypeDescMapping)
}

function translateDescriptor (descriptor: MessageDescriptor | null): string {
  const { $t } = getIntl()
  return descriptor ? $t(descriptor) : ''
}

// This function is not intended to be called directly in most cases.
// It serves as a shared utility for hooks related to Services and Policies,
// such as usePolicyListBreadcrumb and useServiceListBreadcrumb.
export function generateUnifiedServicesBreadcrumb (from?: LocationExtended['state']['from']) {
  const serviceCatalogPath = getServiceCatalogRoutePath(true)
  const isFromCatalog = !!from?.pathname.includes(serviceCatalogPath)

  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Network Control' }) },
    isFromCatalog
      ? {
        text: $t({ defaultMessage: 'Service Catalog' }),
        link: serviceCatalogPath
      }
      : {
        text: $t({ defaultMessage: 'My Services' }),
        link: getServiceListRoutePath(true)
      }
  ]
}

function generateUnifiedServiceListBreadCrumb (
  svc: UnifiedServiceTypeSet,
  isNewServiceCatalogEnabled: boolean
): { text: string, link?: string }[] {
  switch (svc.sourceType) {
    case UnifiedServiceSourceType.SERVICE:
      return generateServiceListBreadcrumb(svc.type as ServiceType, isNewServiceCatalogEnabled)
    case UnifiedServiceSourceType.POLICY:
      return generatePolicyListBreadcrumb(svc.type as PolicyType, isNewServiceCatalogEnabled)
  }
}

export function getUnifiedServiceRoute (
  svc: UnifiedServiceTypeSet,
  oper: 'list' | 'create'
): string {
  switch (svc.sourceType) {
    case UnifiedServiceSourceType.SERVICE:
      return getServiceRoutePath({
        type: svc.type as ServiceType,
        oper: oper === 'list' ? ServiceOperation.LIST : ServiceOperation.CREATE
      })
    case UnifiedServiceSourceType.POLICY:
      return getPolicyRoutePath({
        type: svc.type as PolicyType,
        oper: oper === 'list' ? PolicyOperation.LIST : PolicyOperation.CREATE
      })
  }
}

export function hasUnifiedServiceCreatePermission (svc: UnifiedServiceTypeSet): boolean {
  switch (svc.sourceType) {
    case UnifiedServiceSourceType.SERVICE:
      return hasServicePermission({
        type: svc.type as ServiceType,
        oper: ServiceOperation.CREATE,
        roles: [RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR]
      })
    case UnifiedServiceSourceType.POLICY:
      return hasPolicyPermission({
        type: svc.type as PolicyType,
        oper: PolicyOperation.CREATE
      })
  }
}

export function canCreateAnyUnifiedService (): boolean {
  return hasSomeServicesPermission(ServiceOperation.CREATE)
  || hasSomePoliciesPermission(PolicyOperation.CREATE)
}

// eslint-disable-next-line max-len
export function isUnifiedServiceAvailable (svc: UnifiedServiceTypeSet & { disabled?: boolean }): boolean {
  switch (svc.sourceType) {
    case UnifiedServiceSourceType.SERVICE:
      return isServiceCardEnabled({
        type: svc.type as ServiceType,
        disabled: svc.disabled
      }, ServiceOperation.LIST)
    case UnifiedServiceSourceType.POLICY:
      return isPolicyCardEnabled({
        type: svc.type as PolicyType,
        disabled: svc.disabled
      }, PolicyOperation.LIST)
  }
}

export function useIsNewServicesCatalogEnabled (): boolean {
  const isTierAllowed = useIsTierAllowed(TierFeatures.SERVICE_CATALOG_UPDATED)
  const isFFEanbled = useIsSplitOn(Features.NEW_SERVICE_CATALOG)

  return isTierAllowed && isFFEanbled
}
