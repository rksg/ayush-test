import { Form, Space }            from 'antd'
import { defineMessage, useIntl } from 'react-intl'
import { FormattedMessage }       from 'react-intl'

import { InformationSolid } from '@acx-ui/icons'

import * as UI from '../styledComponents'

const label = defineMessage({ defaultMessage: 'Pre Requisites' })


export function Prerequisites () {
  const { $t } = useIntl()

  const linkDescription = <FormattedMessage
    defaultMessage={`
    <highlight>
    For optimal test results, you are asked to
    </highlight>
    
    
    
  `}
    values={{
      highlight: (chunks) => <Space align='start'>
        <InformationSolid />
        {chunks}
      </Space>
    }}
  />

  return <Form.Item
    name='prerequisites'
    label={$t(label)}
    children={
      <>
        <UI.LabelContainer style={{ marginLeft: 0 }}>
          {linkDescription}
        </UI.LabelContainer>
        <UI.LabelContainer>
          <span>
            {$t(defineMessage({ defaultMessage: '1. Stay on the call for at least 5-7 minutes.' }))}
          </span>
          <span>
            {$t(defineMessage({ defaultMessage: '2. Share both video and audio.' }))}
          </span>
          <span>
            {$t(defineMessage({ defaultMessage: '3. Connect to WiFi over Ruckus AP.' }))}
          </span>
          <span>
            {$t(defineMessage(
              {
                defaultMessage: '4. Use the Zoom desktop or mobile'+
               ' application (not web browser version).'
              }
            ))}
          </span>
        </UI.LabelContainer>
      </>
    }

  />
  // return <Form.Item
  //   name='prerequisites'
  //   label={$t(label)}
  //   extra={
  //     <>{linkDescription}
  //       <div>
  //         {$t(defineMessage({ defaultMessage: '1. Stay on the call for at least 5-7 minutes.' }))}
  //       </div>
  //       <div>
  //         {$t(defineMessage({ defaultMessage: '2. Share both video and audio.' }))}
  //       </div>
  //       <div>
  //         {$t(defineMessage({ defaultMessage: '3. Connect to WiFi over Ruckus AP.' }))}
  //       </div>
  //       <div>
  //         {$t(defineMessage(
  //           {
  //             defaultMessage: '4. Use the Zoom desktop or mobile'+
  //             ' application (not web browser version).'
  //           }
  //         ))}
  //       </div>
  //     </>
  //   }
  // />
}
