import { useEffect } from 'react'

import { Form, Switch, Space } from 'antd'
import { useWatch }            from 'antd/lib/form/Form'
import { useIntl }             from 'react-intl'

import { Subtitle, Tooltip }                                               from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }          from '@acx-ui/feature-toggle'
import { NetworkTypeEnum, Radius, WifiNetworkMessages, useConfigTemplate } from '@acx-ui/rc/utils'

import { AAAInstance } from '../../AAAInstance'
import * as UI         from '../../styledComponents'

interface AccountingServiceInputProps {
    isProxyModeConfigurable: boolean,
    labelWidth?: string,
    initValue?: boolean,
    proxyModeInitValue?: boolean,
    networkType?: NetworkTypeEnum,
    excludeRadSec?: boolean,
    customProxyModeToolTip?: JSX.Element,
    enableToggleOnChange?: (checked: boolean) => void,
    proxyModeToggleOnChange?: (checked: boolean) => void
}


export function AccountingServiceInput (props: AccountingServiceInputProps) {
  const {
    isProxyModeConfigurable,
    labelWidth= '250px',
    initValue=false,
    proxyModeInitValue=false,
    networkType,
    excludeRadSec=false,
    customProxyModeToolTip,
    enableToggleOnChange,
    proxyModeToggleOnChange
  } = props
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const selectedAcctRadius = useWatch<Radius>('accountingRadius')
  const enableAccountingService = useWatch('enableAccountingService')
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  const proxyServiceTooltip = <Tooltip.Question
    placement='bottom'
    title={$t(WifiNetworkMessages.ENABLE_PROXY_TOOLTIP)}
    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
  />

  useEffect(() => {
    if (supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled) {
      form.setFieldValue('enableAccountingProxy', true)
    }
  }, [selectedAcctRadius])

  const handleEnableAccountingToggleChange = (checked: boolean) => {
    enableToggleOnChange?.(checked)
  }

  const handleProxyModeToggleChange = (checked: boolean) => {
    proxyModeToggleOnChange?.(checked)
  }

  return (<>
    <UI.FieldLabel width={labelWidth}>
      <Subtitle level={3}>{$t({ defaultMessage: 'Accounting Service' })}</Subtitle>
      <Form.Item
        name='enableAccountingService'
        valuePropName='checked'
        style={{ marginTop: '-5px', marginBottom: '0' }}
        initialValue={initValue}
        children={<Switch
          data-testid='enable-accounting-service'
          onChange={handleEnableAccountingToggleChange}
        />}
      />
    </UI.FieldLabel>
    {enableAccountingService && <>
      <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
        type='accountingRadius'
        networkType={networkType}
        excludeRadSec={excludeRadSec}
      />
      {isProxyModeConfigurable &&
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            { $t({ defaultMessage: 'Proxy Service' }) }
            { (customProxyModeToolTip)?
              customProxyModeToolTip : proxyServiceTooltip }
          </Space>
          <Form.Item
            name='enableAccountingProxy'
            valuePropName='checked'
            initialValue={proxyModeInitValue}
            children={<Switch
              onChange={handleProxyModeToggleChange}
              data-testid='enable-accounting-proxy'
              disabled={
                (supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled)
              }
            />}
          />
        </UI.FieldLabel>
      }
    </>
    }
  </>
  )
}