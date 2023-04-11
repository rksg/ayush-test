import { Form }                   from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import * as UI from '../styledComponents'

const label = defineMessage({ defaultMessage: 'Disclaimer' })

export function Disclaimer () {
  const { $t } = useIntl()

  //Please take note that participation in this Zoom test call is entirely voluntary, and by doing so, you are agreeing to share information with Zoom Video Communications, Inc. Please refer to Zoom privacy statement for more details https://explore.zoom.us/trust/privacy.
  return <Form.Item
    name='disclaimer'
    label={$t(label)}
    children={
      <UI.LabelContainer>
        {$t(defineMessage(
          {
            defaultMessage: 'Please take note that participation in this Zoom'+
            ' test call is entirely voluntary, and by doing so, you are agreeing'+
            ' to share information with Zoom Video Communications, Inc. Please refer to Zoom'+
            ' privacy statement for more details '
          }
        ))
        }
        <a href='https://explore.zoom.us/trust/privacy'>
            https://explore.zoom.us/trust/privacy.
        </a>
      </UI.LabelContainer>
    }
  />
}
