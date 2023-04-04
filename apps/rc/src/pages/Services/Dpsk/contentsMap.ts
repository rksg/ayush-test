import { defineMessage, MessageDescriptor } from 'react-intl'

import { PassphraseFormatEnum, PolicyDefaultAccess } from '@acx-ui/rc/utils'

export const passphraseFormatDescription: Record<PassphraseFormatEnum, MessageDescriptor> = {
  // eslint-disable-next-line max-len
  [PassphraseFormatEnum.MOST_SECURED]: defineMessage({ defaultMessage: 'Letters, numbers and symbols can be used' }),
  // eslint-disable-next-line max-len
  [PassphraseFormatEnum.KEYBOARD_FRIENDLY]: defineMessage({ defaultMessage: 'Only letters and numbers can be used' }),
  [PassphraseFormatEnum.NUMBERS_ONLY]: defineMessage({ defaultMessage: 'Only numbers can be used' })
}

export const defaultAccessLabelMapping: Record<PolicyDefaultAccess, MessageDescriptor> = {
  [PolicyDefaultAccess.ACCEPT]: defineMessage({ defaultMessage: 'ACCEPT' }),
  [PolicyDefaultAccess.REJECT]: defineMessage({ defaultMessage: 'REJECT' })
}
