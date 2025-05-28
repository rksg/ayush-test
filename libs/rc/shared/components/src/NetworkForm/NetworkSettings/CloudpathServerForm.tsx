import { useContext, useEffect } from 'react'

import {
  Form,
  Switch,
  Space
} from 'antd'
import { defineMessages, useIntl } from 'react-intl'


import { Subtitle, Tooltip }                                                                 from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }                            from '@acx-ui/feature-toggle'
import { NetworkTypeEnum, Radius, useConfigTemplate, WifiNetworkMessages, WlanSecurityEnum } from '@acx-ui/rc/utils'

import { AAAInstance }    from '../AAAInstance'
import NetworkFormContext from '../NetworkFormContext'
import * as UI            from '../styledComponents'


const { useWatch } = Form

interface CloudpathServerFormProps {
  dpskWlanSecurity?: WlanSecurityEnum
}

/*
 * There have RadiusSettings forked from this file and remove setData,
 * This file still be used for OpenSettingsForm and use setData in each UI action.
 * If you want to modify this file please also reflect to RadiusSettings
 * Once we can refactor OpenSettingsForm, we could reuse the RadiusSettings
 */
export function CloudpathServerForm (props: CloudpathServerFormProps) {
  const labelWidth = '250px'
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data, setData } = useContext(NetworkFormContext)
  const { dpskWlanSecurity } = props
  const onProxyChange = (value: boolean, fieldName: string) => {
    setData && setData({ ...data, [fieldName]: value })
  }
  const [selectedAuthRadius, selectedAcctRadius] =
    [useWatch<Radius>('authRadius'), useWatch<Radius>('accountingRadius')]
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  const isNonProxyAcctDpskFFEnabled = useIsSplitOn(Features.ACX_UI_NON_PROXY_ACCOUNTING_DPSK_TOGGLE)

  // TODO: Remove deprecated codes below when RadSec feature is delivery
  useEffect(()=>{
    !supportRadsec && form.setFieldsValue({ ...data })
  },[supportRadsec, data])

  useEffect(()=>{
    supportRadsec && form.setFieldsValue({ ...data })
  },[supportRadsec, data?.id])

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

  const messages = defineMessages({
    dpskProxyServiceTooltip: {
      id: 'dpskProxyServiceTooltip',
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the {system} as proxy in DPSK networks. A proxy {serverType} server is used when APs send {messageType} messages to the {system} and the {system} forwards these messages to an external {serverType} server.'
    }
  })

  const dpskProxyServiceTooltipMsg = $t(messages.dpskProxyServiceTooltip, {
    system: isNonProxyAcctDpskFFEnabled ?
      $t({ defaultMessage: 'RUCKUS One' }) : $t({ defaultMessage: 'controller' }),
    serverType: isNonProxyAcctDpskFFEnabled ?
      $t({ defaultMessage: 'authentication' }) : $t({ defaultMessage: 'AAA' }),
    messageType: isNonProxyAcctDpskFFEnabled ?
      $t({ defaultMessage: 'authentication' }) : $t({ defaultMessage: 'authentication/accounting' })
  })


  const DPSKProxyServiceTooltip = <Tooltip.Question
    placement='bottom'
    title={dpskProxyServiceTooltipMsg}
    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
  />

  const DPSKAcctProxyServiceTooltip = <Tooltip.Question
    placement='bottom'
    title={$t({
      // eslint-disable-next-line max-len
      defaultMessage: 'Use the RUCKUS One as proxy in DPSK networks. A proxy accounting server is used when APs send accounting messages to the RUCKUS One and the RUCKUS One forwards these messages to an external accounting server.'
    })}
    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
  />

  const enableAccountingService = useWatch('enableAccountingService')

  const authProxyNetworkTypes = [NetworkTypeEnum.OPEN, NetworkTypeEnum.AAA, NetworkTypeEnum.DPSK]
  const accountingProxyNetworkTypes = [NetworkTypeEnum.OPEN, NetworkTypeEnum.AAA]

  if (isNonProxyAcctDpskFFEnabled) {
    accountingProxyNetworkTypes.push(NetworkTypeEnum.DPSK)
  }

  return (
    <Space direction='vertical' size='middle'>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance
          serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'
          networkType={data?.type}
          excludeRadSec={dpskWlanSecurity===WlanSecurityEnum.WPA23Mixed}
        />
        {((data?.type && authProxyNetworkTypes.includes(data.type)) &&
          dpskWlanSecurity!==WlanSecurityEnum.WPA23Mixed
        ) &&
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
            networkType={data?.type}
            excludeRadSec={
              data?.type === NetworkTypeEnum.DPSK ||
              dpskWlanSecurity===WlanSecurityEnum.WPA23Mixed
            }
          />
          {(data?.type && accountingProxyNetworkTypes.includes(data.type)) &&
            dpskWlanSecurity!==WlanSecurityEnum.WPA23Mixed &&
          <UI.FieldLabel width={labelWidth}>
            <Space align='start'>
              { $t({ defaultMessage: 'Proxy Service' }) }
              { (data?.type === NetworkTypeEnum.DPSK)?
                DPSKAcctProxyServiceTooltip : proxyServiceTooltip }
            </Space>
            <Form.Item
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch
                data-testid='enable-accounting-proxy'
                onChange={(value)=>onProxyChange(value,'enableAccountingProxy')}
                disabled={
                  (supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled)
                }
              />}
            />
          </UI.FieldLabel>}
        </>}
      </div>
    </Space>
  )
}
