import {
  Space,
  Form,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { Subtitle } from '@acx-ui/components'


import AAAInstance from '../AAAInstance'
export function AuthAccServerSetting () {
  const intl = useIntl()
  const { useWatch } = Form
  const [
    enableAccountingService
  ] = [
    useWatch<boolean>(['enableAccountingService'])
  ]
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Authentication Service' })}</Subtitle>
        <AAAInstance serverLabel={intl.$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
      </div>
      <div>
        <Subtitle level={3}>{intl.$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch />
        </Form.Item>
        {enableAccountingService &&
          <AAAInstance serverLabel={intl.$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>}
      </div>
    </Space>
  )
}
