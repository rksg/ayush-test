import { defineMessage } from 'react-intl'

export const ccdFailureTypes = [
  {
    id: 1,
    code: 'auth',
    text: defineMessage({ defaultMessage: 'Authentication' }),
    failuresText: defineMessage({ defaultMessage: 'Authentication Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'Authentication Attempts' })
  },
  {
    id: 2,
    code: 'assoc',
    text: defineMessage({ defaultMessage: 'Association' }),
    failuresText: defineMessage({ defaultMessage: 'Association Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'Association Attempts' })
  },
  {
    id: 3,
    code: 'eap',
    text: defineMessage({ defaultMessage: 'EAP' }),
    failuresText: defineMessage({ defaultMessage: 'EAP Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'EAP Attempts' })
  },
  {
    id: 4,
    code: 'radius',
    text: defineMessage({ defaultMessage: 'RADIUS' }),
    failuresText: defineMessage({ defaultMessage: 'RADIUS Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'RADIUS Attempts' })
  },
  {
    id: 5,
    code: 'dhcp',
    text: defineMessage({ defaultMessage: 'DHCP' }),
    failuresText: defineMessage({ defaultMessage: 'DHCP Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'DHCP Attempts' })
  },
  {
    id: 6,
    code: 'userAuth',
    text: defineMessage({ defaultMessage: 'L3 Authentication' }),
    failuresText: defineMessage({ defaultMessage: 'L3 Authentication Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'L3 Authentication Attempts' })
  },
  { id: 7,
    code: 'eapol',
    text: defineMessage({ defaultMessage: 'EAPOL' }),
    failuresText: defineMessage({ defaultMessage: 'EAPOL Failures' }),
    attemptsText: defineMessage({ defaultMessage: 'EAPOL Attempts' })
  }
]
