import { useEffect } from 'react'

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
  const form = Form.useFormInstance()
  const [
    enableAccountingService,
    authRadius,
    accountingRadius
  ] = [
    useWatch<boolean>(['enableAccountingService']),
    useWatch('authRadius'),
    useWatch('accountingRadius')
  ]
  useEffect(()=>{
    if(authRadius){
      form.setFieldValue(['guestPortal','wisprPage','authRadius'], authRadius)
    }
  },[authRadius])
  useEffect(()=>{
    if(accountingRadius){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], accountingRadius)
    }
  },[accountingRadius])
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
        <Form.Item name={['guestPortal','wisprPage','accountingRadius']} noStyle/>
        <Form.Item name={['guestPortal','wisprPage','authRadius']} noStyle/>
      </div>
    </Space>
  )
}
