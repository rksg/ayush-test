import { defineMessage } from 'react-intl'

export const productMapping = {
  GENERAL: defineMessage({ defaultMessage: 'General' }),
  WIFI: defineMessage({ defaultMessage: 'Wi-Fi' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' })
}

export const statusMapping = {
  PENDING: defineMessage({ defaultMessage: 'Pending' }),
  INPROGRESS: defineMessage({ defaultMessage: 'In progress' }),
  SUCCESS: defineMessage({ defaultMessage: 'Success' }),
  FAIL: defineMessage({ defaultMessage: 'Failed' })
}

export const adminLogEventTypeMapping = {
  ADMIN: defineMessage({ defaultMessage: 'Admin' }),
  NOTIFICATION: defineMessage({ defaultMessage: 'Notification' })
}

export const eventEventTypeMapping = {
  AP: defineMessage({ defaultMessage: 'AP' }),
  CLIENT: defineMessage({ defaultMessage: 'Client' })
}

export const severityMapping = {
  Info: defineMessage({ defaultMessage: 'Informational' })
}
