import { Form }                                     from 'antd'
import { FormattedMessage, defineMessage, useIntl } from 'react-intl'

import * as UI from '../styledComponents'


export function Disclaimer () {
  const { $t } = useIntl()
  const disc = defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage: 'Please take note that participation in this Zoom test call is entirely voluntary, and by doing so, you are agreeing to share information with Zoom Video Communications, Inc. Please refer to {link} for more details.'
  })
  return <Form.Item
    name='disclaimer'
    children={
      <UI.DisclaimerContainer>
        <FormattedMessage
          {...disc}
          values={{
            link: <a
              className='link'
              target='_blank'
              href='https://explore.zoom.us/trust/privacy'
              rel='noreferrer'>
              {$t({ defaultMessage: 'Zoom privacy statement' })}
            </a>
          }}
        />
      </UI.DisclaimerContainer>
    }
  />
}
