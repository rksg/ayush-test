import { defineMessage } from 'react-intl'

export const ccdFailureTypes = [
  {
    id: 1,
    code: 'auth',
    text: defineMessage({ defaultMessage: 'Authentication Failure' }),
    failuresText: defineMessage({ defaultMessage: 'Authentication Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'Authentication Attempts' })
  },
  {
    id: 2,
    code: 'assoc',
    text: defineMessage({ defaultMessage: 'Association Failure' }),
    failuresText: defineMessage({ defaultMessage: 'Association Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'Association Attempts' })
  },
  {
    id: 3,
    code: 'eap',
    text: defineMessage({ defaultMessage: 'EAP Failure' }),
    failuresText: defineMessage({ defaultMessage: 'EAP Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'EAP Attempts' })
  },
  {
    id: 4,
    code: 'radius',
    text: defineMessage({ defaultMessage: 'RADIUS Failure' }),
    failuresText: defineMessage({ defaultMessage: 'RADIUS Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'RADIUS Attempts' })
  },
  {
    id: 5,
    code: 'dhcp',
    text: defineMessage({ defaultMessage: 'DHCP Failure' }),
    failuresText: defineMessage({ defaultMessage: 'DHCP Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'DHCP Attempts' })
  },
  {
    id: 6,
    code: 'userAuth',
    text: defineMessage({ defaultMessage: 'L3 Authentication Failure' }),
    failuresText: defineMessage({ defaultMessage: 'L3 Authentication Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'L3 Authentication Attempts' })
  },
  { id: 7,
    code: 'eapol',
    text: defineMessage({ defaultMessage: 'EAPOL Failure' }),
    failuresText: defineMessage({ defaultMessage: 'EAPOL Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'EAPOL Attempts' })
  }
]
