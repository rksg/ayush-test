import { defineMessage } from 'react-intl'

export const ccdFailureTypes = [
  {
    id: 1,
    code: 'auth',
    text: defineMessage({ defaultMessage: 'Authentication' }),
    failuresText: defineMessage({ defaultMessage: 'Authentication Failures' })
  },
  {
    id: 2,
    code: 'assoc',
    text: defineMessage({ defaultMessage: 'Association' }),
    failuresText: defineMessage({ defaultMessage: 'Association Failures' })
  },
  {
    id: 3,
    code: 'eap',
    text: defineMessage({ defaultMessage: 'EAP' }),
    failuresText: defineMessage({ defaultMessage: 'EAP Failures' })
  },
  {
    id: 4,
    code: 'radius',
    text: defineMessage({ defaultMessage: 'RADIUS' }),
    failuresText: defineMessage({ defaultMessage: 'RADIUS Failures' })
  },
  {
    id: 5,
    code: 'dhcp',
    text: defineMessage({ defaultMessage: 'DHCP' }),
    failuresText: defineMessage({ defaultMessage: 'DHCP Failures' })
  },
  {
    id: 6,
    code: 'userAuth',
    text: defineMessage({ defaultMessage: 'L3 Authentication' }),
    failuresText: defineMessage({ defaultMessage: 'L3 Authentication Failures' })
  },
  { id: 7,
    code: 'eapol',
    text: defineMessage({ defaultMessage: 'EAPOL' }),
    failuresText: defineMessage({ defaultMessage: 'EAPOL Failures' })
  }
]
