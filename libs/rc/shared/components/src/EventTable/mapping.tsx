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
  SECURITY: defineMessage({ defaultMessage: 'Security' }),
  CLIENT: defineMessage({ defaultMessage: 'Client' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  NETWORK: defineMessage({ defaultMessage: 'Network' }),
  EDGE: defineMessage({ defaultMessage: 'RUCKUS Edge' }),
  PROFILE: defineMessage({ defaultMessage: 'Profile' })
}

export const productMapping = {
  GENERAL: defineMessage({ defaultMessage: 'General' }),
  WIFI: defineMessage({ defaultMessage: 'Wi-Fi' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  EDGE: defineMessage({ defaultMessage: 'RUCKUS Edge' })
}

export const adminLogTypeMapping = {
  ADMIN: defineMessage({ defaultMessage: 'Admin' }),
  NOTIFICATION: defineMessage({ defaultMessage: 'Notification' })
}

export const authTypeMapping = {
  RUCKUS_SFDC: defineMessage({ defaultMessage: 'RUCKUS SFDC' }),
  RUCKUS_OTP: defineMessage({ defaultMessage: 'RUCKUS OTP' }),
  API_TOKEN: defineMessage({ defaultMessage: 'API TOKEN' }),
  SSO: defineMessage({ defaultMessage: 'SSO' })
}

export const typeMapping = {
  ...eventTypeMapping,
  ...adminLogTypeMapping,
  // this event type only visible from search
  // hence not included in the 2 mapping above
  ADMINACTIVITY: defineMessage({ defaultMessage: 'Admin Activity' })
}
