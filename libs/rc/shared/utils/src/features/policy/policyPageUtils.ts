import { MessageDescriptor, defineMessage, useIntl } from 'react-intl'

import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { Path, useLocation, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                        from '@acx-ui/types'
import { hasRoles }                         from '@acx-ui/user'
import { getIntl }                          from '@acx-ui/utils'

import { LocationExtended }                                    from '../../common/redirect.utils'
import { generateConfigTemplateBreadcrumb, useConfigTemplate } from '../../configTemplate'
import { generatePageHeaderTitle }                             from '../../pages'
import { PolicyType, PolicyOperation }                         from '../../types'
import { generateDpskManagementBreadcrumb }                    from '../service/servicePageUtils'
import { generateUnifiedServicesBreadcrumb }                   from '../unifiedServices'

import { policyTypeLabelMapping }                     from './contentsMap'
import { getPolicyListRoutePath, getPolicyRoutePath } from './policyRouteUtils'

export function usePolicyPageHeaderTitle (isEdit: boolean, policyType: PolicyType) {
  const { isTemplate } = useConfigTemplate()
  const { $t } = useIntl()
  return generatePageHeaderTitle({
    isEdit,
    isTemplate,
    instanceLabel: $t(policyTypeLabelMapping[policyType])
  })
}

/**
 * Get the breadcrumb for the specific policy list page.
 *
 * @param type The type of policy.
 *
 * @returns The breadcrumb for the policy list page.
 */
export function usePolicyListBreadcrumb (type: PolicyType): { text: string, link?: string }[] {
  const { isTemplate } = useConfigTemplate()
  const isNewServiceCatalogEnabled = useIsSplitOn(Features.NEW_SERVICE_CATALOG)
  const from = (useLocation() as LocationExtended)?.state?.from

  return isTemplate
    ? generateConfigTemplateBreadcrumb()
    : generatePolicyListBreadcrumb(type, isNewServiceCatalogEnabled, from)
}

/**
 * Get the breadcrumb for the policies page.
 *
 * @returns The breadcrumb for the policies page.
 */
export function usePoliciesBreadcrumb (): { text: string, link?: string }[] {
  const isNewServiceCatalogEnabled = useIsSplitOn(Features.NEW_SERVICE_CATALOG)
  const from = (useLocation() as LocationExtended)?.state?.from

  return generatePoliciesBreadcrumb(isNewServiceCatalogEnabled, from)
}

export function usePolicyPreviousPath (type: PolicyType, oper: PolicyOperation): Path | string {
  const fallbackPath = useTenantLink(getPolicyRoutePath({ type, oper }), 't')
  const location = useLocation()

  return (location as LocationExtended)?.state?.from?.pathname ?? fallbackPath
}

// eslint-disable-next-line max-len
type AdaptivePolicyRelatedTypes = PolicyType.ADAPTIVE_POLICY | PolicyType.ADAPTIVE_POLICY_SET | PolicyType.RADIUS_ATTRIBUTE_GROUP
export const adaptivePolicyListLabelMap: Record<AdaptivePolicyRelatedTypes, MessageDescriptor> = {
  [PolicyType.ADAPTIVE_POLICY]: defineMessage({ defaultMessage: 'Adaptive Policy' }),
  [PolicyType.ADAPTIVE_POLICY_SET]: defineMessage({ defaultMessage: 'Adaptive Policy Sets' }),
  [PolicyType.RADIUS_ATTRIBUTE_GROUP]: defineMessage({ defaultMessage: 'RADIUS Attribute Groups' })
}

// eslint-disable-next-line max-len
export function useAdaptivePolicyBreadcrumb (type?: AdaptivePolicyRelatedTypes): { text: string, link?: string }[] {
  const { $t } = getIntl()
  const isDPSKAdmin = hasRoles([RolesEnum.DPSK_ADMIN])
  const policiesBreadcrumb = usePoliciesBreadcrumb()
  const result = isDPSKAdmin ? generateDpskManagementBreadcrumb() : policiesBreadcrumb

  if (type) {
    result.push({
      text: $t(adaptivePolicyListLabelMap[type]),
      link: getPolicyRoutePath({ type, oper: PolicyOperation.LIST })
    })
  }

  return result
}

function generatePoliciesBreadcrumb (
  isNewServiceCatalogEnabled = false,
  from?: LocationExtended['state']['from']
) {
  if (isNewServiceCatalogEnabled) return generateUnifiedServicesBreadcrumb(from)

  const { $t } = getIntl()
  return [
    { text: $t({ defaultMessage: 'Network Control' }) },
    {
      text: $t({ defaultMessage: 'Policies & Profiles' }),
      link: getPolicyListRoutePath(true)
    }
  ]
}


export function generatePolicyListBreadcrumb (
  type: PolicyType,
  isNewServiceCatalogEnabled = false,
  from?: LocationExtended['state']['from']
) {
  const { $t } = getIntl()
  return [
    ...generatePoliciesBreadcrumb(isNewServiceCatalogEnabled, from),
    {
      text: $t(policyTypeLabelMapping[type]),
      link: getPolicyRoutePath({ type, oper: PolicyOperation.LIST })
    }
  ]
}
