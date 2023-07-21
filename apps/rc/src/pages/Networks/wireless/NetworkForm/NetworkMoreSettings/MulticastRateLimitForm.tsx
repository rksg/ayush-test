/* eslint-disable max-len */

import React, { ReactNode, CSSProperties } from 'react'

import {
  Checkbox,
  Form,
  Switch,
  Slider,
  FormItemProps
} from 'antd'

import * as UI                       from './styledComponents'
import { useIntl } from 'react-intl'
import form                          from 'antd/lib/form'
import { Button, Fieldset, Tooltip } from '@acx-ui/components'

const { useWatch } = Form

export function MulticastRateLimitForm () {

  const { $t } = useIntl()
  const [
    bssMinimumPhyRate, //BSS Min Rate
    enableMulticastRateLimiting,
    enableMulticastUpLimit,
    enableMulticastDownLimit
  ] = [
    useWatch<string>('bssMinimumPhyRate'),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableMulticastRateLimiting']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableMulticastUplinkRateLimiting']),
    useWatch<boolean>(['wlan', 'advancedCustomization', 'enableMulticastDownlinkRateLimiting'])
  ]

  const form = Form.useFormInstance()
  const getDownloadMaxValue = () => getDLMax(form.getFieldValue('bssMinimumPhyRate'))


  return (
    <>
      <UI.FieldLabel width='175px'>
        {$t({ defaultMessage: 'Multicast Rate Limiting' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'enableMulticastRateLimiting']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
        >
          <Switch/>
        </Form.Item>
      </UI.FieldLabel>

      {enableMulticastRateLimiting && <>

        <FieldsetItem
          name={['wlan', 'advancedCustomization', 'multicastRateLimit5GField']}
          label={$t({ defaultMessage: '2.4 GHz & 5 GHz' })}
          initialValue={true}
          switchStyle={{ display: 'none' }}
          style={{ width: 'max-content', marginLeft: '-8px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'enableMulticastUplinkRateLimiting']}
              valuePropName='checked'
              initialValue={enableMulticastUpLimit || enableMulticastDownLimit}
              style={{ lineHeight: '50px' }}>
              <Checkbox data-testid='enableMulticastUpLimit'
                children={$t({ defaultMessage: 'Upload Limit' })} />
              <Tooltip.Question
                title={$t({ defaultMessage: 'The multicast download rate limiting should remain below 50% of the BSS minimum rate' })}
                placement='bottom' />
            </UI.FormItemNoLabel>
            {
              enableMulticastUpLimit ?
                <UI.FormItemNoLabel
                  name={['wlan', 'advancedCustomization', 'multicastUplinkRateLimiting']}
                  children={
                    <Slider
                      tooltipVisible={false}
                      style={{ width: '245px', marginRight: '10px' }}
                      defaultValue={20}
                      min={1}
                      max={100}
                      marks={{
                        1: { label: '1 Mbps' },
                        100: { label: '100 Mbps' }
                      }}
                    />
                  }
                /> :
                <Unlimited />
            }
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'enableMulticastDownlinkRateLimiting']}
              valuePropName='checked'
              initialValue={false}
              style={{ lineHeight: '50px' }}
              children={
                <Checkbox data-testid='enableMulticastDownLimit'
                  children={$t({ defaultMessage: 'Download Limit' })} />}
            />
            {
              enableMulticastDownLimit ?
                <UI.FormItemNoLabel
                  name={['wlan', 'advancedCustomization', 'multicastDownlinkRateLimiting']}
                  children={
                    <Slider
                      tooltipVisible={false}
                      style={{ width: '245px', marginRight: '10px' }}
                      defaultValue={getDownloadMaxValue()}
                      min={1}
                      max={getDownloadMaxValue()}
                      marks={{
                        1: { label: '1 Mbps' },
                        [`${getDownloadMaxValue()}`]: { label: getDownloadMaxValue().toString() + ' Mbps' }
                      }}
                    />
                  }
                /> : <Unlimited />
            }
          </div>
        </FieldsetItem>

        <FieldsetItem
          name={['wlan', 'advancedCustomization', 'multicastRateLimit6GField']}
          label={$t({ defaultMessage: '6 GHz' })}
          initialValue={true}
          switchStyle={{ display: 'none' }}
          style={{ width: 'max-content', marginLeft: '-8px' }}>

          <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'enableMulticastUplinkRateLimiting6G']}
              valuePropName='checked'
              initialValue={false}
              style={{ lineHeight: '50px' }}
              children={
                <Checkbox data-testid='enableMulticastUpLimit6G'
                  children={$t({ defaultMessage: 'Upload Limit' })} />}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'enableMulticastDownlinkRateLimiting6G']}
              valuePropName='checked'
              initialValue={false}
              style={{ lineHeight: '50px' }}
              children={
                <Checkbox data-testid='enableMulticastDownLimit6G'
                  children={$t({ defaultMessage: 'Download Limit' })} />}
            />
          </div>

        </FieldsetItem>
      </>}
    </>
  )
}

enum BssMinRateEnum {
    VALUE_NONE = 'default',
    VALUE_1 = '1',
    VALUE_2 = '2',
    VALUE_5_5 = '5.5',
    VALUE_12 = '12',
    VALUE_24 = '24'
  }

function Unlimited () {
  const { $t } = useIntl()
  return (
    <UI.Label
      style={{ lineHeight: '50px' }}>
      {$t({ defaultMessage: 'Unlimited' })}
    </UI.Label>
  )
}

function getDLMax (value : String) : number {
  switch (value) {
    case BssMinRateEnum.VALUE_1: return 1
    case BssMinRateEnum.VALUE_2: return 1
    case BssMinRateEnum.VALUE_5_5: return 3
    case BssMinRateEnum.VALUE_12: return 6
    case BssMinRateEnum.VALUE_24: return 12
    default: return 6
  }
}

const FieldsetItem = ({
  children,
  label,
  switchStyle,
  ...props
}: FormItemProps & { label: string, children: ReactNode, switchStyle: CSSProperties }) =>
  <Form.Item
    {...props}
    valuePropName='checked'>
    <Fieldset {...{ label, children }} switchStyle={switchStyle}/>
  </Form.Item>