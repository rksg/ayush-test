import { defineMessage } from 'react-intl'

export const ccdFailureTypes = [
  {
    id: 1,
    code: 'auth',
    text: defineMessage({ defaultMessage: 'Authentication' })
  },
  {
    id: 2,
    code: 'assoc',
    text: defineMessage({ defaultMessage: 'Association' })
  },
  {
    id: 3,
    code: 'eap',
    text: defineMessage({ defaultMessage: 'EAP' })
  },
  {
    id: 4,
    code: 'radius',
    text: defineMessage({ defaultMessage: 'RADIUS' })
  },
  {
    id: 5,
    code: 'dhcp',
    text: defineMessage({ defaultMessage: 'DHCP' })
  },
  {
    id: 6,
    code: 'userAuth',
    text: defineMessage({ defaultMessage: 'L3 Authentication' })
  }
]
