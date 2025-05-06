import { useEffect, useContext } from 'react'

import {
  Space,
  Form,
  Switch
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Subtitle, Tooltip }                                                    from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }               from '@acx-ui/feature-toggle'
import { QuestionMarkCircleOutlined }                                           from '@acx-ui/icons'
import { GuestNetworkTypeEnum, Radius, useConfigTemplate, WifiNetworkMessages } from '@acx-ui/rc/utils'

import { AAAInstance }    from '../AAAInstance'
import NetworkFormContext from '../NetworkFormContext'

export function AuthAccServerSetting () {
  const { $t } = useIntl()
  const { useWatch } = Form
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  const onChange = (value: boolean, fieldName: string) => {
    if(!value){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], undefined)
    }
    form.setFieldValue(fieldName, value)

    if (supportRadsec) {
      setData && setData({ ...(!value?_.omit(data, 'guestPortal.wisprPage.accountingRadius'):data),
        [fieldName]: value,
        authRadius: authRadius,
        authRadiusId: authRadius?.id,
        accountingRadius: accountingRadius,
        accountingRadiusId: accountingRadius?.id })
    } else {
      setData && setData({ ...(!value?_.omit(data, 'guestPortal.wisprPage.accountingRadius'):data),
        [fieldName]: value })
    }
  }
  const proxyServiceTooltip = <Tooltip
    placement='bottom'
    children={<QuestionMarkCircleOutlined />}
    title={$t(WifiNetworkMessages.ENABLE_PROXY_TOOLTIP)}
  />
  const [
    enableAccountingService,
    authRadius,
    accountingRadius
  ] = [
    useWatch<boolean>(['enableAccountingService']),
    useWatch<Radius>('authRadius'),
    useWatch<Radius>('accountingRadius')
  ]
  useEffect(()=>{
    if(authRadius){
      form.setFieldValue(['guestPortal','wisprPage','authRadius'], authRadius)

      if (supportRadsec && authRadius.radSecOptions?.tlsEnabled) {
        onChange(true, 'enableAuthProxy')
      }
    }
  },[supportRadsec, authRadius])
  useEffect(()=>{
    if(accountingRadius){
      form.setFieldValue(['guestPortal','wisprPage','accountingRadius'], accountingRadius)

      if (supportRadsec && accountingRadius.radSecOptions?.tlsEnabled) {
        onChange(true, 'enableAccountingProxy')
      }
    }
  },[supportRadsec, accountingRadius])

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
              (checked)=>onChange(checked, 'enableAuthProxy')}
            disabled={supportRadsec && authRadius?.radSecOptions?.tlsEnabled}/>}
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
                (checked)=>onChange(checked, 'enableAccountingProxy')}
              disabled={supportRadsec && accountingRadius?.radSecOptions?.tlsEnabled}/>}
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
