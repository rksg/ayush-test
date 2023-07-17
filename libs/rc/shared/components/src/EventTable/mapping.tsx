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
  SECURITY: defineMessage({ defaultMessage: 'SECURITY' }),
  CLIENT: defineMessage({ defaultMessage: 'Client' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  NETWORK: defineMessage({ defaultMessage: 'Network' }),
  EDGE: defineMessage({ defaultMessage: 'SmartEdge' })
}

export const productMapping = {
  GENERAL: defineMessage({ defaultMessage: 'General' }),
  WIFI: defineMessage({ defaultMessage: 'Wi-Fi' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  EDGE: defineMessage({ defaultMessage: 'SmartEdge' })
}

export const adminLogTypeMapping = {
  ADMIN: defineMessage({ defaultMessage: 'Admin' }),
  NOTIFICATION: defineMessage({ defaultMessage: 'Notification' })
}

export const typeMapping = {
  ...eventTypeMapping,
  ...adminLogTypeMapping,
  // this event type only visible from search
  // hence not included in the 2 mapping above
  ADMINACTIVITY: defineMessage({ defaultMessage: 'Admin Activity' })
}
