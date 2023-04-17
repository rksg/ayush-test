import { PolicyDefaultAccess } from '@acx-ui/rc/utils'
import { getIntl }             from '@acx-ui/utils'

import { defaultAccessLabelMapping }    from './contentsMap'
import { unlimitedNumberOfDeviceLabel } from './DpskDetail/contentsMap'

export function displayDeviceCountLimit (count: number | undefined) {
  const { $t } = getIntl()
  return count ? count : $t(unlimitedNumberOfDeviceLabel)
}

export function displayDefaultAccess (defaultAccess: boolean | undefined) {
  const { $t } = getIntl()
  return $t(defaultAccessLabelMapping[
    defaultAccess === false
      ? PolicyDefaultAccess.REJECT
      : PolicyDefaultAccess.ACCEPT
  ])
}
