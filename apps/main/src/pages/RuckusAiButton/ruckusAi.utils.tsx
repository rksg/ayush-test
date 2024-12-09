import { IntlShape } from 'react-intl'

import { Alert, cssStr } from '@acx-ui/components'


export const willRegenerateAlert = ($t: IntlShape['$t']) => {
  // eslint-disable-next-line max-len
  const msg = $t({ defaultMessage: 'When changing the settings, please be aware that the settings for other steps may also be affected.' })
  return <Alert style={{
    borderRadius: '8px',
    margin: '5px 0px -5px 0px',
    borderColor: cssStr('--acx-accents-orange-50')
  }}
  message={msg}
  type='info'
  showIcon />
}