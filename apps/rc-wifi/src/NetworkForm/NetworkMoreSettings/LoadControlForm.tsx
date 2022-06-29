
import React from 'react'

import {
  Form,
  Select,
  Slider
} from 'antd'


import * as UI from './styledComponents'


// const { useWatch } = Form
const { Option } = Select


export function LoadControlForm () {

  return(
    <>
      <Form.Item
        label='Max Rate:'
        name='maxRate'
      >
        <Select defaultValue='umlimited'
          style={{ width: '240px' }}>
          <Option value='umlimited'>
              Unlimited
          </Option>
          <Option value='perAp'>Per AP</Option>
        </Select>
      </Form.Item>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='uploadLimit'
          style={{ lineHeight: '32px' }}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
                Upload Limit
            </UI.Label>}
        />

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
            }, 200: {
              style: {
                width: '50px',
                fontSize: '10px',
                color: '#ACAEB0'
              },
              label: '200 Mbps'
            }
          }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='downloadLimit'
          style={{ lineHeight: '32px' }}
          children={
            <UI.Label>
              <UI.CheckboxWrapper />
                Download Limit
            </UI.Label>}
        />

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
            }, 200: {
              style: {
                width: '50px',
                fontSize: '10px',
                color: '#ACAEB0'
              },
              label: '200 Mbps'
            }
          }}
        />
      </div>


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
        name='enableDhcp'
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
              Enable load balancing between all radios
          </UI.Label>}
      />
      <UI.FormItemNoLabel
        name='enableDhcp'
        children={
          <UI.Label>
            <UI.CheckboxWrapper />
              Enable load balancing between APs
          </UI.Label>}
      />

    </>
  )

}
