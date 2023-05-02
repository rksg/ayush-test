import { defineMessage, useIntl } from 'react-intl'

import * as UI from '../styledComponents'

const label = defineMessage({ defaultMessage: 'Pre Requisites' })
export function Prerequisites () {
  const { $t } = useIntl()

  return <UI.OverwriteFormItem
    name='prerequisites'
    label={$t(label)}
    children={
      <UI.NotificationBox>
        <span>
          {$t(defineMessage({ defaultMessage: 'For optimal test results, you are asked to' }))}
        </span>
        <span>
          {$t(defineMessage({ defaultMessage: '1. Stay on the call for at least 5-7 minutes' }))}
        </span>
        <span>
          {$t(defineMessage({ defaultMessage: '2. Share both video and audio' }))}
        </span>
        <span>
          {$t(defineMessage({ defaultMessage: '3. Connect to WiFi over Ruckus AP' }))}
        </span>
        <span>
          {$t(defineMessage(
            {
              defaultMessage: '4. Use the Zoom desktop or mobile '+
              'application (not web browser version)'
            }
          ))}
        </span>
      </UI.NotificationBox>
    }

  />
}
