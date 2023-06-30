import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

export const unlimitedNumberOfDeviceLabel = defineMessage({ defaultMessage: 'Unlimited' })

export function displayDeviceCountLimit (count: number | undefined) {
  const { $t } = getIntl()
  return count ? count : $t(unlimitedNumberOfDeviceLabel)
}
