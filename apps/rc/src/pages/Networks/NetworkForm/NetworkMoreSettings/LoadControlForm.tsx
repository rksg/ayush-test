import React, { useContext, useEffect } from 'react'

import {
  Checkbox,
  Form,
  Select,
  Slider
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import { useWatch }            from 'antd/lib/form/Form'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'

import NetworkFormContext from '../NetworkFormContext'

import * as UI from './styledComponents'

const { Option } = Select

enum MaxRateEnum {
  PER_AP = 'perAp',
  UNLIMITED = 'unlimited'
}

export function LoadControlForm () {
  const maxRate = useWatch<MaxRateEnum>('maxRate')
  const { $t } = useIntl()


  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(() => {
    if (data) {
      if (data.wlan?.advancedCustomization) {
        form.setFieldsValue({
          maxRate: get(data, 'wlan.advancedCustomization.totalUplinkRateLimiting') > 0 ||
            get(data, 'wlan.advancedCustomization.totalDownlinkRateLimiting') > 0 ?
            MaxRateEnum.PER_AP : MaxRateEnum.UNLIMITED,
          totalUplinkLimited: get(data, 'wlan.advancedCustomization.totalUplinkRateLimiting') > 0,
          totalDownlinkLimited: get(data,
            'wlan.advancedCustomization.totalDownlinkRateLimitingValue') > 0
        })
      }
    }
  }, [data])

  return(
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Max Rate:' })}
        name='maxRate'>
        <Select
          defaultValue={MaxRateEnum.UNLIMITED}
          style={{ width: '240px' }}
          onChange={function (value: string) {
            if (value == MaxRateEnum.UNLIMITED) {
              form.setFieldValue(['wlan', 'advancedCustomization', 'totalUplinkRateLimiting'], 0)
              form.setFieldValue(['wlan', 'advancedCustomization', 'totalDownlinkRateLimiting'], 0)
            }
          }}>
          <Option value={MaxRateEnum.UNLIMITED}>
            {$t({ defaultMessage: 'Unlimited' })}
          </Option>
          <Option value={MaxRateEnum.PER_AP}>
            {$t({ defaultMessage: 'Per AP' })}
          </Option>
        </Select>
      </Form.Item>

      {maxRate === MaxRateEnum.PER_AP && <PerApForm />}

      <Form.Item
        label={$t({ defaultMessage: 'Max clients per radio:' })}
        name={['wlan', 'advancedCustomization', 'maxClientsOnWlanPerRadio']}
      >
        <Slider
          tooltipVisible={false}
          style={{ width: '240px' }}
          defaultValue={100}
          min={1}
          max={512}
          marks={{ 1: '1', 512: '512' }}
        />
      </Form.Item>

      <UI.FormItemNoLabel
        name={['wlan', 'advancedCustomization', 'enableBandBalancing']}
        valuePropName='checked'
        initialValue={false}
        children={
          <Checkbox
            children={$t({ defaultMessage: 'Enable load balancing between all radios' })} />
        }
      />
      <UI.FormItemNoLabel
        name={['wlan', 'advancedCustomization', 'clientLoadBalancingEnable']}
        valuePropName='checked'
        initialValue={false}
        children={
          <Checkbox children={$t({ defaultMessage: 'Enable load balancing between APs' })} />
        }
      />
    </>
  )
}

function PerApForm () {
  const { $t } = useIntl()
  const [
    totalUplinkLimited,
    totalDownlinkLimited
  ] = [
    useWatch<boolean>('totalUplinkLimited'),
    useWatch<boolean>('totalDownlinkLimited')
  ]

  const form = Form.useFormInstance()

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='totalUplinkLimited'
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='uploadLimit'
              onChange={function (e: CheckboxChangeEvent) {
                if (e.target.checked) {
                  form.setFieldValue(
                    ['wlan', 'advancedCustomization', 'totalUplinkRateLimiting'], 200)
                } else {
                  form.setFieldValue(
                    ['wlan', 'advancedCustomization', 'totalUplinkRateLimiting'], 0)
                }
              }}
              children={$t({ defaultMessage: 'Upload Limit' })} />
          }
        />
        {
          totalUplinkLimited ?
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'totalUplinkRateLimiting']} >
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                defaultValue={200}
                min={1}
                max={200}
                marks={{
                  1: { label: '1 Mbps' },
                  200: { label: '200 Mbps' }
                }}
              />
            </UI.FormItemNoLabel> :
            <UI.Label
              style={{ lineHeight: '50px' }}>
              {$t({ defaultMessage: 'Unlimited' })}
            </UI.Label>
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='totalDownlinkLimited'
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='downloadLimit'
              children={$t({ defaultMessage: 'Download Limit' })}
              onChange={function (e: CheckboxChangeEvent) {
                if (e.target.checked) {
                  form.setFieldValue(
                    ['wlan', 'advancedCustomization', 'totalDownlinkRateLimiting'], 200)
                } else {
                  form.setFieldValue(
                    ['wlan', 'advancedCustomization', 'totalDownlinkRateLimiting'], 0)
                }
              }}/>
          }
        />
        {
          totalDownlinkLimited ?
            <UI.FormItemNoLabel
              name={['wlan', 'advancedCustomization', 'totalDownlinkRateLimiting']} >
              <Slider
                tooltipVisible={false}
                style={{ width: '245px' }}
                defaultValue={20}
                min={1}
                max={200}
                marks={{
                  0: { label: '1 Mbps' },
                  200: { label: '200 Mbps' }
                }}
              />
            </UI.FormItemNoLabel> :
            <UI.Label
              style={{ lineHeight: '50px' }}>
              {$t({ defaultMessage: 'Unlimited' })}
            </UI.Label>
        }
      </div>
    </>
  )
}
