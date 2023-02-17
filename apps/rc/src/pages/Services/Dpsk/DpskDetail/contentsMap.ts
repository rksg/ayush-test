import { defineMessage, MessageDescriptor } from 'react-intl'

import { DpskDetailsTabKey } from '@acx-ui/rc/utils'


export const dpskTabNameMapping: Record<DpskDetailsTabKey, MessageDescriptor> = {
  [DpskDetailsTabKey.OVERVIEW]: defineMessage({ defaultMessage: 'Overview' }),
  [DpskDetailsTabKey.PASSPHRASE_MGMT]: defineMessage({ defaultMessage: 'Passphrase Management' })
}

export const unlimitedNumberOfDeviceLabel = defineMessage({ defaultMessage: 'Unlimited' })
