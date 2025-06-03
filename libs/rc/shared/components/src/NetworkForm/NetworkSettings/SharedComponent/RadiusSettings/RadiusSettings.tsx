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

import { AAAInstance }            from '../../../AAAInstance'
import NetworkFormContext         from '../../../NetworkFormContext'
import { AccountingServiceInput } from '../../../SharedComponent'
import * as UI                    from '../../../styledComponents'


const { useWatch } = Form

interface RadiusSettingsProps {
  dpskWlanSecurity?: WlanSecurityEnum
}

/*
 * This component forked from CloudpathServerForm and remove setData actions,
 * If you want to modify this file please also reflect to CloudpathServerForm and modify it
 * Once we can refactor OpenSettingsForm from setData, then we can reuse this component and remove CloudpathServerForm
 */
export function RadiusSettings (props: RadiusSettingsProps) {
  const labelWidth = '250px'
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const { data } = useContext(NetworkFormContext)
  const { dpskWlanSecurity } = props
  const [selectedAuthRadius, selectedAcctRadius] =
    [useWatch<Radius>('authRadius'), useWatch<Radius>('accountingRadius')]
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  const isNonProxyAcctDpskFFEnabled = useIsSplitOn(Features.ACX_UI_NON_PROXY_ACCOUNTING_DPSK_TOGGLE)

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
              disabled={supportRadsec && selectedAuthRadius?.radSecOptions?.tlsEnabled}
            />}
          />
        </UI.FieldLabel>}
      </div>
      <div>
        <AccountingServiceInput
          isProxyModeConfigurable={
            ((data?.type && accountingProxyNetworkTypes.includes(data.type)) &&
            dpskWlanSecurity!==WlanSecurityEnum.WPA23Mixed) ?? false
          }
          labelWidth={labelWidth}
          networkType={data?.type}
          excludeRadSec={
            data?.type === NetworkTypeEnum.DPSK ||
            dpskWlanSecurity===WlanSecurityEnum.WPA23Mixed
          }
          customProxyModeToolTip={(data?.type === NetworkTypeEnum.DPSK)?
            DPSKAcctProxyServiceTooltip: undefined
          }
        />
      </div>
    </Space>
  )
}
