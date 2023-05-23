import { PolicyDefaultAccess } from '@acx-ui/rc/utils'
import { getIntl }             from '@acx-ui/utils'

import { defaultAccessLabelMapping } from './contentsMap'

export function displayDefaultAccess (defaultAccess: boolean | undefined) {
  const { $t } = getIntl()
  return $t(defaultAccessLabelMapping[
    defaultAccess === false
      ? PolicyDefaultAccess.REJECT
      : PolicyDefaultAccess.ACCEPT
  ])
}
