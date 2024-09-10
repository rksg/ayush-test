import { defineMessage } from 'react-intl'

export const messageMapping = {
  fullyCompatible: defineMessage({ defaultMessage: 'Fully compatible' }),
  partiallyIncompatible: defineMessage({ defaultMessage: 'Partially incompatible' }),
  unavailable: defineMessage({ defaultMessage: 'Check Unavailable' }),
  checking: defineMessage({ defaultMessage: 'Compatibility Checking' }),
  unknown: defineMessage({ defaultMessage: 'Unknown' })
}