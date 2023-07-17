import { defineMessage } from 'react-intl'

export const productMapping = {
  GENERAL: defineMessage({ defaultMessage: 'General' }),
  WIFI: defineMessage({ defaultMessage: 'Wi-Fi' }),
  SWITCH: defineMessage({ defaultMessage: 'Switch' }),
  EDGE: defineMessage({ defaultMessage: 'SmartEdge' })
}

export const severityMapping = {
  Critical: defineMessage({ defaultMessage: 'Critical' }),
  Major: defineMessage({ defaultMessage: 'Major' }),
  Minor: defineMessage({ defaultMessage: 'Minor' }),
  Warning: defineMessage({ defaultMessage: 'Warning' }),
  Info: defineMessage({ defaultMessage: 'Informational' })
}

export const statusMapping = {
  PENDING: defineMessage({ defaultMessage: 'Pending' }),
  INPROGRESS: defineMessage({ defaultMessage: 'In progress' }),
  SUCCESS: defineMessage({ defaultMessage: 'Success' }),
  FAIL: defineMessage({ defaultMessage: 'Failed' })
}
