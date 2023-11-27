import { getIntl } from '@acx-ui/utils'

import { generatePageHeaderTitle } from '../../pages'
import { PolicyType }              from '../../types'

import { policyTypeLabelMapping } from './contentsMap'

// eslint-disable-next-line max-len
export function generatePolicyPageHeaderTitle (isEdit: boolean, isTemplate: boolean, policyType: PolicyType) {
  const { $t } = getIntl()
  return generatePageHeaderTitle(isEdit, isTemplate, $t(policyTypeLabelMapping[policyType]))
}
