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

import AAAInstance        from '../AAAInstance'
import NetworkFormContext from '../NetworkFormContext'

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
  const proxyServiceTooltip = <Tooltip
    placement='bottom'
    children={<QuestionMarkCircleOutlined />}
    title={$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
    })}
  />
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
  useEffect(()=>{
    if(data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath){
      form.setFieldsValue(data)
    }
  },[data])
  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Authentication Service' })}</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        {data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath&&
        <Form.Item>
          <Form.Item
            noStyle
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch onChange={
              (checked)=>onChange(checked, 'enableAuthProxy')}/>}
          />
          <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
          {proxyServiceTooltip}
        </Form.Item>}
      </div>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item name='enableAccountingService' valuePropName='checked'>
          <Switch onChange={
            (checked)=>onChange(checked, 'enableAccountingService')}/>
        </Form.Item>
        {enableAccountingService &&
        <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
          {data?.guestPortal?.guestNetworkType === GuestNetworkTypeEnum.Cloudpath&&
          <Form.Item>
            <Form.Item
              noStyle
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={
                (checked)=>onChange(checked, 'enableAccountingProxy')}/>}
            />
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>}
        </>}
        <Form.Item name={['guestPortal','wisprPage','accountingRadius']} children={<></>} noStyle/>
        <Form.Item name={['guestPortal','wisprPage','authRadius']} children={<></>} noStyle/>
      </div>
    </Space>
  )
}
