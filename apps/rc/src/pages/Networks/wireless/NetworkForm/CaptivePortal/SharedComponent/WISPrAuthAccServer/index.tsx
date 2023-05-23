import { useEffect, useContext } from 'react'

import {
  Space,
  Form,
  Switch
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Subtitle, Tooltip }          from '@acx-ui/components'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { GuestNetworkTypeEnum }       from '@acx-ui/rc/utils'

import AAAInstance        from '../../../AAAInstance'
import NetworkFormContext from '../../../NetworkFormContext'

export function AuthAccServerSetting () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)

  const onChange = (value: boolean, fieldName: string) => {
    if(!value){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], undefined)
    }
    setData && setData({ ...(!value?_.omit(data, 'guestPortal.wisprPage.accountingRadius'):data),
      [fieldName]: value })
  }
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
        <Subtitle level={3}>{$t({ defaultMessage: 'Authentication Connections' })}</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
      </div>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch onChange={
            (checked)=>onChange(checked, 'enableAccountingService')}/>
        </Form.Item>
        {enableAccountingService &&
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
        }
        <Form.Item name={['guestPortal','wisprPage','accountingRadius']} noStyle/>
        <Form.Item name={['guestPortal','wisprPage','authRadius']} noStyle/>
      </div>
    </Space>
  )
}
