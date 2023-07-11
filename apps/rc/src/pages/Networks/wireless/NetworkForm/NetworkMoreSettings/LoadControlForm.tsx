/* eslint-disable max-len */
import React, { useContext, useEffect } from 'react'

import {
  Checkbox,
  Form,
  Select,
  Slider, Switch
} from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox/Checkbox'
import { get }                 from 'lodash'
import { useIntl }             from 'react-intl'

import NetworkFormContext from '../NetworkFormContext'

import * as UI from './styledComponents'

const { Option } = Select

enum MaxRateEnum {
  PER_AP = 'perAp',
  UNLIMITED = 'unlimited'
}

const { useWatch } = Form

export function LoadControlForm () {
  const maxRate = useWatch<MaxRateEnum>('maxRate')
  const { $t } = useIntl()


  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(() => {
    const advancedCustomization = data?.wlan?.advancedCustomization
    if (advancedCustomization) {
      const apUplinkRateLimiting = get(data, 'wlan.advancedCustomization.totalUplinkRateLimiting')
      const apDownlinkRateLimiting = get(data, 'wlan.advancedCustomization.totalDownlinkRateLimiting')

      const hasApUplinkRateLimiting = apUplinkRateLimiting > 0
      const hasApDownlinkRateLimiting = apDownlinkRateLimiting > 0
      form.setFieldsValue({
        maxRate: (hasApUplinkRateLimiting || hasApDownlinkRateLimiting) ?
          MaxRateEnum.PER_AP : MaxRateEnum.UNLIMITED,
        totalUplinkLimited: hasApUplinkRateLimiting,
        totalDownlinkLimited: hasApDownlinkRateLimiting
      })
    }
  }, [data])

  return(
    <>
      <UI.Subtitle>{$t({ defaultMessage: 'Load Control' })}</UI.Subtitle>
      <Form.Item
        label={$t({ defaultMessage: 'Max Rate:' })}
        name='maxRate'>
        <Select
          defaultValue={MaxRateEnum.UNLIMITED}
          style={{ width: '240px' }}
          onChange={function (value: string) {
            if (value === MaxRateEnum.PER_AP) {
              form.setFieldValue('totalUplinkLimited', true)
              form.setFieldValue('totalDownlinkLimited', true)
              form.setFieldValue(['wlan', 'advancedCustomization', 'totalUplinkRateLimiting'], 200)
              form.setFieldValue(['wlan', 'advancedCustomization', 'totalDownlinkRateLimiting'], 200)
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

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Enable load balancing between all radios' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'enableBandBalancing']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={true}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <UI.FieldLabel width='250px'>
        {$t({ defaultMessage: 'Enable load balancing between APs' })}
        <Form.Item
          name={['wlan', 'advancedCustomization', 'clientLoadBalancingEnable']}
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={true}
          children={<Switch />}
        />
      </UI.FieldLabel>

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
    </>
  )
}
