
import React from 'react'

import {
  Form,
  Select,
  Slider
} from 'antd'
import { useWatch } from 'antd/lib/form/Form'

import * as UI from './styledComponents'


// const { useWatch } = Form
const { Option } = Select

enum MaxRateEnum {
  PER_AP = 'perAp',
  UNLIMITED = 'unlimited'
}

export function LoadControlForm () {
  const maxRate = useWatch<MaxRateEnum>('maxRate')

  return(
    <>
      <Form.Item
        label='Max Rate:'
        name='maxRate'>
        <Select defaultValue={MaxRateEnum.UNLIMITED}
          style={{ width: '240px' }}>
          <Option value={MaxRateEnum.UNLIMITED}>
            Unlimited
          </Option>
          <Option value={MaxRateEnum.PER_AP}>
            Per AP
          </Option>
        </Select>
      </Form.Item>

      {maxRate === MaxRateEnum.PER_AP && <PerApForm />}

      <Form.Item
        label='Activated in Venues:'
        name='activatedInVenues'
      >
        <Slider
          style={{ width: '240px' }}
          defaultValue={100}
          min={1}
          max={512}
          marks={{ 0: '0', 512: '512' }}
        />
      </Form.Item>

      <UI.FormItemNoLabel
        name={['wlan','advancedCustomization','enableBandBalancing']}
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
              Enable load balancing between all radios
          </UI.Label>}
      />
      <UI.FormItemNoLabel
        name={['wlan','advancedCustomization','clientLoadBalancingEnable']}
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
              Enable load balancing between APs
          </UI.Label>}
      />
    </>
  )
}

function RateSlider () {
  return (
    <Slider
      style={{ width: '245px' }}
      defaultValue={20}
      min={1}
      max={200}
      marks={{
        0: {
          style: {
            fontSize: '10px',
            color: '#ACAEB0'
          },
          label: '1 Mbps'
        },
        200: {
          style: {
            width: '50px',
            fontSize: '10px',
            color: '#ACAEB0'
          },
          label: '200 Mbps'
        }
      }}
    />
  )
}

function PerApForm () {
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
            <UI.Label>
              <UI.CheckboxWrapper />
              Upload Limit
            </UI.Label>}
        />
        {
          uploadLimit ?
            <UI.FormItemNoLabel
              name='uploadLimitRate'
              children={
                <RateSlider />
              }
            /> :
            <UI.Label
              style={{ lineHeight: '50px' }}>
              Unlimited
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
            <UI.Label>
              <UI.CheckboxWrapper />
              Download Limit
            </UI.Label>}
        />
        {
          downloadLimit ?
            <UI.FormItemNoLabel
              name='downloadLimitRate'
              children={
                <RateSlider />
              }
            /> :
            <UI.Label
              style={{ lineHeight: '50px' }}>
              Unlimited
            </UI.Label>
        }
      </div>
    </>
  )
}
