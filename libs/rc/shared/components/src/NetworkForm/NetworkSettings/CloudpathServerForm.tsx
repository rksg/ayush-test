import { useContext, useEffect } from 'react'

import {
  Form,
  Switch,
  Space
} from 'antd'
import { useIntl } from 'react-intl'


import { Subtitle, Tooltip }                                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                          from '@acx-ui/feature-toggle'
import { NetworkTypeEnum, Radius, useConfigTemplate, WifiNetworkMessages } from '@acx-ui/rc/utils'

import { AAAInstance }    from '../AAAInstance'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'


const { useWatch } = Form

export function CloudpathServerForm () {
  const labelWidth = '250px'
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const onProxyChange = (value: boolean, fieldName: string) => {
    setData && setData({ ...data, [fieldName]: value })
  }
  const [selectedAuthRadius, selectedAcctRadius] =
    [useWatch<Radius>('authRadius'), useWatch<Radius>('accountingRadius')]
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate

  // TODO: Remove deprecated codes below when RadSec feature is delivery
  useEffect(()=>{
    !supportRadsec && form.setFieldsValue({ ...data })
  },[data])

  useEffect(()=>{
    supportRadsec && form.setFieldsValue({ ...data })
  },[data?.id])

  useEffect(() => {
    if (supportRadsec && selectedAuthRadius?.radSecOptions?.tlsEnabled) {
      form.setFieldValue('enableAuthProxy', true)
    }
  }, [selectedAuthRadius])

  useEffect(() => {
    if (supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled) {
      form.setFieldValue('enableAccountingProxy', true)
    }
  }, [selectedAcctRadius])

  const proxyServiceTooltip = <Tooltip.Question
    placement='bottom'
    title={$t(WifiNetworkMessages.ENABLE_PROXY_TOOLTIP)}
    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
  />

  const DPSKProxyServiceTooltip = <Tooltip.Question
    placement='bottom'
    title={$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the controller as proxy in DPSK networks. A proxy AAA server is used when APs send authentication/accounting messages to the controller and the controller forwards these messages to an external AAA server.'
    })}
    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
  />

  const enableAccountingService = useWatch('enableAccountingService')

  const authProxyNetworkTypes = [NetworkTypeEnum.OPEN, NetworkTypeEnum.AAA, NetworkTypeEnum.DPSK]
  const accountingProxyNetworkTypes = [NetworkTypeEnum.OPEN, NetworkTypeEnum.AAA]

  return (
    <Space direction='vertical' size='middle'>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        {(data?.type && authProxyNetworkTypes.includes(data.type)) &&
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            { $t({ defaultMessage: 'Proxy Service' }) }
            { (data?.type === NetworkTypeEnum.DPSK)? DPSKProxyServiceTooltip : proxyServiceTooltip }
          </Space>
          <Form.Item
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch
              data-testid='enable-auth-proxy'
              onChange={(value) => onProxyChange(value,'enableAuthProxy')}
              disabled={supportRadsec && selectedAuthRadius?.radSecOptions?.tlsEnabled}
            />}
          />
        </UI.FieldLabel>}
      </div>
      <div>
        <UI.FieldLabel width={labelWidth}>
          <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
          <Form.Item
            name='enableAccountingService'
            valuePropName='checked'
            style={{ marginTop: '-5px', marginBottom: '0' }}
            initialValue={false}
            children={<Switch
              onChange={(value) => onProxyChange(value,'enableAccountingService')}
            />}
          />
        </UI.FieldLabel>
        {enableAccountingService && <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'
            networkType={data?.type}/>
          {(data?.type && accountingProxyNetworkTypes.includes(data.type))&&
          <UI.FieldLabel width={labelWidth}>
            <Space align='start'>
              { $t({ defaultMessage: 'Proxy Service' }) }
              {proxyServiceTooltip}
            </Space>
            <Form.Item
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch
                data-testid='enable-accounting-proxy'
                onChange={(value)=>onProxyChange(value,'enableAccountingProxy')}
                disabled={supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled}
              />}
            />
          </UI.FieldLabel>}
        </>}
      </div>
    </Space>
  )
}
