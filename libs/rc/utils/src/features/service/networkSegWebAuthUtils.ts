import { Rule }          from 'antd/lib/form'
import { defineMessage } from 'react-intl'

import { getIntl } from '@acx-ui/utils'

export const defaultTemplateData = {
  webAuthCustomTop: {
    label: defineMessage({ defaultMessage: 'Header' }),
    defaultMessage:
      defineMessage({ defaultMessage: 'Welcome to Ruckus Networks Web Authentication Homepage' })
  },
  webAuthCustomTitle: {
    label: defineMessage({ defaultMessage: 'Title' }),
    defaultMessage:
      defineMessage({ defaultMessage: 'Enter your Password below and press the button' })
  },
  webAuthPasswordLabel: {
    label: defineMessage({ defaultMessage: 'Password Label' }),
    defaultMessage: defineMessage({ defaultMessage: 'DPSK Password' })
  },
  webAuthCustomLoginButton: {
    label: defineMessage({ defaultMessage: 'Button' }),
    defaultMessage: defineMessage({ defaultMessage: 'Login' })
  },
  webAuthCustomBottom: {
    label: defineMessage({ defaultMessage: 'Footer' }),
    defaultMessage:
      defineMessage({ defaultMessage: `This network is restricted to authorized users only.
      Violators may be subjected to legal prosecution.
      Activity on this network is monitored and may be used as evidence in a court of law.
      Copyright {year} CommScope, Inc. All Rights Reserved.` })
  }
}

export const getWebAuthLabelValidator = (): Rule => {
  const { $t } = getIntl()
  return {
    pattern: /^[\w\s,.!\-\[\]]*$/,
    message: $t({ defaultMessage: 'Accept only word characters.' })
  }
}
