import { useContext, useEffect } from 'react'

import {
  Form,
  Switch,
  Space,
  Typography
} from 'antd'
import { useIntl } from 'react-intl'


import { Subtitle, Tooltip }          from '@acx-ui/components'
import { Features, useIsSplitOn }     from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined } from '@acx-ui/icons'
import { NetworkTypeEnum }            from '@acx-ui/rc/utils'

import AAAInstance        from '../AAAInstance'
import NetworkFormContext from '../NetworkFormContext'



const { useWatch } = Form

export function CloudpathServerForm () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const onProxyChange = (value: boolean, fieldName: string) => {
    setData && setData({ ...data, [fieldName]: value })
  }
  useEffect(()=>{
    form.setFieldsValue({ ...data })
  },[data])
  const proxyServiceTooltip = <Tooltip
    placement='bottom'
    children={<QuestionMarkCircleOutlined />}
    title={$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the controller as proxy in 802.1X networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
    })}
  />

  const DPSKProxyServiceTooltip = <Tooltip
    placement='bottom'
    children={<QuestionMarkCircleOutlined />}
    title={$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the controller as proxy in DPSK networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
    })}
  />
  const enableAccountingService = useWatch('enableAccountingService')

  const disableDPSKProxyService = !useIsSplitOn(Features.WIFI_EDA_NON_PROXY_DPSK_TOGGLE)
  && data?.type===NetworkTypeEnum.DPSK
  return (
    <Space direction='vertical' size='middle'>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        {(data?.type===NetworkTypeEnum.AAA
        || data?.type===NetworkTypeEnum.DPSK
        || data?.type===NetworkTypeEnum.OPEN)&&
        <Form.Item
          style={
            {
              marginBottom: 0
            }
          }>
          <Form.Item
            noStyle
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch disabled={
              disableDPSKProxyService
            }
            title='Proxy Service'
            onChange={(value)=>onProxyChange(value,'enableAuthProxy')}/>}
          />
          <span className={
            (disableDPSKProxyService)
              ? 'ant-switch-disabled'
              : ''
          }>
            { $t({ defaultMessage: 'Proxy Service' }) }
          </span>
          { data?.type===NetworkTypeEnum.DPSK ? DPSKProxyServiceTooltip : proxyServiceTooltip }
        </Form.Item>}
        { disableDPSKProxyService
          && <Typography.Text disabled className='ant-form-item-extra'>
            { $t({ defaultMessage:
              'DPSK Network with Non-Proxy mode is not supported at this moment!' })}
          </Typography.Text> }
      </div>
      <div>
        <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
        <Form.Item
          name='enableAccountingService'
          valuePropName='checked'
          initialValue={false}
          children={<Switch onChange={(value)=>onProxyChange(value,'enableAccountingService')}/>}
        />
        {enableAccountingService &&
        <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
          {(data?.type===NetworkTypeEnum.AAA || data?.type===NetworkTypeEnum.OPEN)&&
          <Form.Item>
            <Form.Item
              noStyle
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch onChange={(value)=>onProxyChange(value,'enableAccountingProxy')}/>}
            />
            <span>{ $t({ defaultMessage: 'Proxy Service' }) }</span>
            {proxyServiceTooltip}
          </Form.Item>}
        </>
        }
      </div>
    </Space>
  )
}
