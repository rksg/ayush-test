import { useEffect } from 'react'

import { Form, Space, Switch } from 'antd'
import { useWatch }            from 'antd/lib/form/Form'
import { useIntl }             from 'react-intl'

import { Subtitle , StepsForm, Tooltip }                          from '@acx-ui/components'
import { useIsSplitOn, Features, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { EthernetPortProfileMessages, Radius, useConfigTemplate } from '@acx-ui/rc/utils'

import { AAAInstance } from '../../../NetworkForm/AAAInstance'


export function EthernetPortAAASettings () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [accountingEnabled, authRadius, acctRadius] = [useWatch('accountingEnabled', form),
    useWatch<Radius>('authRadius', form),
    useWatch<Radius>('accountingRadius', form)]
  const labelWidth = '280px'
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate
  const isSupportProxyRadius = useIsSplitOn(Features.ETHERNET_PORT_SUPPORT_PROXY_RADIUS_TOGGLE)

  useEffect(() => {
    if (supportRadsec && authRadius?.radSecOptions?.tlsEnabled) {
      form.setFieldValue('enableAuthProxy', true)
    }
  }, [authRadius])

  useEffect(() => {
    if (supportRadsec && acctRadius?.radSecOptions?.tlsEnabled) {
      form.setFieldValue('enableAccountingProxy', true)
    }
  }, [acctRadius])

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'
          excludeRadSec={!isSupportProxyRadius} />
        {isSupportProxyRadius &&
          <StepsForm.FieldLabel width={labelWidth}>
            <Space>
              {$t({ defaultMessage: 'Use Proxy Service' })}
              <Tooltip.Question
                title={$t(EthernetPortProfileMessages.USE_RADIUS_PROXY)}
                placement='bottom'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />
            </Space>
            <Form.Item
              name='enableAuthProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch
                disabled={(supportRadsec && authRadius?.radSecOptions?.tlsEnabled)}
              />}
            />
          </StepsForm.FieldLabel>
        }
      </div>
      <div>
        <StepsForm.FieldLabel width={labelWidth}>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='accountingEnabled'
            valuePropName='checked'
            initialValue={false}
            children={<Switch />}
          />
        </StepsForm.FieldLabel>
        {accountingEnabled && <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'
            excludeRadSec={!isSupportProxyRadius} />
          {isSupportProxyRadius &&
            <StepsForm.FieldLabel width={labelWidth}>
              <Space>
                {$t({ defaultMessage: 'Use Proxy Service' })}
                <Tooltip.Question
                  title={$t(EthernetPortProfileMessages.USE_RADIUS_PROXY)}
                  placement='bottom'
                  iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
                />
              </Space>
              <Form.Item
                name='enableAccountingProxy'
                valuePropName='checked'
                initialValue={false}
                children={<Switch
                  disabled={(supportRadsec && acctRadius?.radSecOptions?.tlsEnabled)}/>}
              />
            </StepsForm.FieldLabel>
          }
        </>}
      </div>
    </Space>
  )
}