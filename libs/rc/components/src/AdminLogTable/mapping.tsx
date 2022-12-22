import { defineMessage } from 'react-intl'

export const adminLogTypeMapping = {
  ADMIN: defineMessage({ defaultMessage: 'Admin' }),
  NOTIFICATION: defineMessage({ defaultMessage: 'Notification' })
}

export const severityMapping = {
  Critical: defineMessage({ defaultMessage: 'Critical' }),
  Major: defineMessage({ defaultMessage: 'Major' }),
  Minor: defineMessage({ defaultMessage: 'Minor' }),
  Warning: defineMessage({ defaultMessage: 'Warning' }),
  Info: defineMessage({ defaultMessage: 'Informational' })
}
