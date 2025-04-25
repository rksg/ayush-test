import { RolesEnum } from '@acx-ui/types'
import { getIntl }   from '@acx-ui/utils'

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

export function buildUnifiedServices (
  list: Array<Omit<UnifiedService, 'route' | 'label' | 'description' | 'breadcrumb'>>,
  isNewServiceCatalogEnabled: boolean
): Array<UnifiedService> {
  return list.map(item => ({
    label: getLabel(item),
    description: getDescription(item),
    route: getUnifiedServiceRoute(item, 'list'),
    breadcrumb: generateUnifiedServiceListBreadCrumb(item, isNewServiceCatalogEnabled),
    ...item
  }))
}

function getLabel (svc: UnifiedServiceTypeSet): string {
  const { $t } = getIntl()
  let messageDescriptor

  if (svc.sourceType === UnifiedServiceSourceType.SERVICE) {
    messageDescriptor = serviceTypeLabelMapping[svc.type as ServiceType]
  } else {
    messageDescriptor = policyTypeLabelMapping[svc.type as PolicyType]
  }

  return messageDescriptor ? $t(messageDescriptor) : ''
}

function getDescription (svc: UnifiedServiceTypeSet): string {
  const { $t } = getIntl()
  let messageDescriptor

  if (svc.sourceType === UnifiedServiceSourceType.SERVICE) {
    messageDescriptor = serviceTypeDescMapping[svc.type as ServiceType]
  } else {
    messageDescriptor = policyTypeDescMapping[svc.type as PolicyType]
  }

  return messageDescriptor ? $t(messageDescriptor) : ''
}

// This function is not intended to be called directly in most cases.
// It serves as a shared utility for hooks related to Services and Policies,
// such as usePolicyListBreadcrumb and useServiceListBreadcrumb.
export function generateUnifiedServicesBreadcrumb (from?: LocationExtended['state']['from']) {
  const servicesCatalogPath = getServiceCatalogRoutePath(true)
  const isFromCatalog = !!from?.pathname.includes(servicesCatalogPath)

  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Network Control' }) },
    isFromCatalog
      ? {
        text: $t({ defaultMessage: 'Services Catalog' }),
        link: servicesCatalogPath
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
