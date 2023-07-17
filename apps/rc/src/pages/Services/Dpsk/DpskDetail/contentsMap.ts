import { defineMessage, MessageDescriptor } from 'react-intl'

import { DpskDetailsTabKey } from '@acx-ui/rc/utils'


export const dpskTabNameMapping: Record<DpskDetailsTabKey, MessageDescriptor> = {
  [DpskDetailsTabKey.OVERVIEW]: defineMessage({ defaultMessage: 'Overview' }),
  // eslint-disable-next-line max-len
  [DpskDetailsTabKey.PASSPHRASE_MGMT]: defineMessage({ defaultMessage: 'Passphrases ({activeCount} Active)' })
}
