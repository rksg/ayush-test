import { defineMessage } from 'react-intl'

export const severityMapping = {
  Critical: defineMessage({ defaultMessage: 'Critical' }),
  Major: defineMessage({ defaultMessage: 'Major' }),
  Minor: defineMessage({ defaultMessage: 'Minor' }),
  Warning: defineMessage({ defaultMessage: 'Warning' }),
  Info: defineMessage({ defaultMessage: 'Informational' })
}

export const eventTypeMapping = {
  AP: defineMessage({ defaultMessage: 'AP' }),
  CLIENT: defineMessage({ defaultMessage: 'Client' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  NETWORK: defineMessage({ defaultMessage: 'Network' }),
  ADMIN: defineMessage({ defaultMessage: 'Admin' }),
  ADMINACTIVITY: defineMessage({ defaultMessage: 'Admin Activity' }),
  NOTIFICATION: defineMessage({ defaultMessage: 'Notification' })
}

export const productMapping = {
  GENERAL: defineMessage({ defaultMessage: 'General' }),
  WIFI: defineMessage({ defaultMessage: 'Wi-Fi' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' })
}

export const adminLogTypeMapping = {
  ADMIN: defineMessage({ defaultMessage: 'Admin' }),
  NOTIFICATION: defineMessage({ defaultMessage: 'Notification' })
}
