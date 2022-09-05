import React from 'react'

import {
  Checkbox,
  Form,
  Select,
  Slider
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'
import { useIntl }  from 'react-intl'

import * as UI from './styledComponents'

const { Option } = Select

enum MaxRateEnum {
  PER_AP = 'perAp',
  UNLIMITED = 'unlimited'
}

export function LoadControlForm () {
  const maxRate = useWatch<MaxRateEnum>('maxRate')
  const { $t } = useIntl()

  return(
    <>
      <Form.Item
        label={$t({ defaultMessage: 'Max Rate:' })}
        name='maxRate'>
        <Select
          defaultValue={MaxRateEnum.UNLIMITED}
          style={{ width: '240px' }}>
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
        label={$t({ defaultMessage: 'Activated in Venues:' })}
        name='activatedInVenues'
      >
        <Slider
          tooltipVisible={false}
          style={{ width: '240px' }}
          defaultValue={100}
          min={1}
          max={512}
          marks={{ 0: '0', 512: '512' }}
        />
      </Form.Item>

      <UI.FormItemNoLabel
        name={['wlan', 'advancedCustomization', 'enableBandBalancing']}
        children={
          <Checkbox
            children={$t({ defaultMessage: 'Enable load balancing between all radios' })} />
        }
      />
      <UI.FormItemNoLabel
        name={['wlan', 'advancedCustomization', 'clientLoadBalancingEnable']}
        children={
          <Checkbox children={$t({ defaultMessage: 'Enable load balancing between APs' })} />
        }
      />
    </>
  )
}

function RateSlider () {
  return (
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
  )
}

function PerApForm () {
  const { $t } = useIntl()
  const [
    uploadLimit,
    downloadLimit
  ] = [
    useWatch<boolean>('uploadLimit'),
    useWatch<boolean>('downloadLimit')
  ]

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='uploadLimit'
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='uploadLimit'
              children={$t({ defaultMessage: 'Upload Limit' })} />
          }
        />
        {
          uploadLimit ?
            <UI.FormItemNoLabel
              name={['wlan','advancedCustomization','totalUplinkRateLimiting']}
              children={
                <RateSlider />
              }
            /> :
            <UI.Label
              style={{ lineHeight: '50px' }}>
              {$t({ defaultMessage: 'Unlimited' })}
            </UI.Label>
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='downloadLimit'
          valuePropName='checked'
          initialValue={false}
          style={{ lineHeight: '50px' }}
          children={
            <Checkbox data-testid='downloadLimit'
              children={$t({ defaultMessage: 'Download Limit' })} />
          }
        />
        {
          downloadLimit ?
            <UI.FormItemNoLabel
              name={['wlan','advancedCustomization','totalDownlinkRateLimiting']}
              children={
                <RateSlider />
              }
            /> :
            <UI.Label
              style={{ lineHeight: '50px' }}>
              {$t({ defaultMessage: 'Unlimited' })}
            </UI.Label>
        }
      </div>
    </>
  )
}
