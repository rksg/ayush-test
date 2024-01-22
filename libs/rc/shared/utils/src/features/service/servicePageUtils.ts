import { getIntl } from '@acx-ui/utils'

import { ServiceType }             from '../../constants'
import { generatePageHeaderTitle } from '../../pages'

import { serviceTypeLabelMapping } from './contentsMap'

// eslint-disable-next-line max-len
export function generateServicePageHeaderTitle (isEdit: boolean, isTemplate: boolean, serviceType: ServiceType) {
  const { $t } = getIntl()
  return generatePageHeaderTitle({
    isEdit,
    isTemplate,
    instanceLabel: $t(serviceTypeLabelMapping[serviceType])
  })
}
