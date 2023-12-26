import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { useLocation, useTenantLink } from '@acx-ui/react-router-dom'
import { getIntl }                    from '@acx-ui/utils'

import { LocationExtended }                                    from '../../common/redirect.utils'
import { generateConfigTemplateBreadcrumb, useConfigTemplate } from '../../configTemplate'
import { generatePageHeaderTitle }                             from '../../pages'
import { PolicyType }                                          from '../../types'

import { policyTypeLabelMapping }                                      from './contentsMap'
import { PolicyOperation, getPolicyListRoutePath, getPolicyRoutePath } from './policyRouteUtils'

// eslint-disable-next-line max-len
export function generatePolicyPageHeaderTitle (isEdit: boolean, isTemplate: boolean, policyType: PolicyType) {
  const { $t } = getIntl()
  return generatePageHeaderTitle(isEdit, isTemplate, $t(policyTypeLabelMapping[policyType]))
}

export function usePolicyBreadcrumb (type: PolicyType, oper: PolicyOperation) {
  const { isTemplate } = useConfigTemplate()
  const tablePath = getPolicyRoutePath({ type, oper })
  const { $t } = useIntl()
  const breadcrumb = useMemo(() => {
    return isTemplate
      ? generateConfigTemplateBreadcrumb()
      : [
        { text: $t({ defaultMessage: 'Network Control' }) },
        {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        },
        { text: $t(policyTypeLabelMapping[type]), link: tablePath }
      ]
  }, [isTemplate])

  return breadcrumb
}

export function usePolicyPreviousPath (type: PolicyType, oper: PolicyOperation) {
  const fallbackPath = useTenantLink(getPolicyRoutePath({ type, oper }), 't')
  const location = useLocation()

  return (location as LocationExtended)?.state?.from?.pathname ?? fallbackPath
}
