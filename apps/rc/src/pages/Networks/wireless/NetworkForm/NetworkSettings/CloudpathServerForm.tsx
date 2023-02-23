import {
  Form,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'


import { Subtitle } from '@acx-ui/components'


import AAAInstance from '../AAAInstance'



const { useWatch } = Form

export function CloudpathServerForm () {
  const { $t } = useIntl()

  const enableAccountingService = useWatch('enableAccountingService')
  return (
    <>
      <AAAInstance serverLabel={$t({ defaultMessage: 'Cloudpath Server' })}
        type='authRadius'/>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch />
        </Form.Item>
        {enableAccountingService &&
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
        }
      </div>
    </>
  )
}
