
import React from 'react'

import {
  Form,
  Select,
  Slider,
  Switch
} from 'antd'


import * as UI from './styledComponents'


// const { useWatch } = Form
const { Option } = Select


export function AccessControlForm () {
  return (<>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <UI.FieldLabel width='175px'>
        Layer 2
        <Form.Item
          name='enableLayer2'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <Form.Item
        name='layer2'
        style={{ marginBottom: '10px', lineHeight: '32px' }}
        children={
          <Select defaultValue=''
            style={{ width: '180px' }}>
            <Option value=''>Select profile...</Option>
          </Select>}
      />
    </div>



    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <UI.FieldLabel width='175px'>
        Layer 3
        <Form.Item
          name='enableLayer3'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <Form.Item
        name='layer3'
        style={{ marginBottom: '10px', lineHeight: '32px' }}
        children={
          <Select defaultValue=''
            style={{ width: '180px' }}>
            <Option value=''>Select profile...</Option>
          </Select>}
      />
    </div>



    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <UI.FieldLabel width='175px'>
        Device & OS
        <Form.Item
          name='enableDeviceOs'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <Form.Item
        name='deviceOs'
        style={{ marginBottom: '10px', lineHeight: '32px' }}
        children={
          <Select defaultValue=''
            style={{ width: '180px' }}>
            <Option value=''>Select profile...</Option>
          </Select>}
      />
    </div>


    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
      <UI.FieldLabel width='175px'>
        Applications
        <Form.Item
          name='enableApplications'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
      </UI.FieldLabel>

      <Form.Item
        name='applications'
        style={{ marginBottom: '10px', lineHeight: '32px' }}
        children={
          <Select defaultValue=''
            style={{ width: '180px' }}>
            <Option value=''>Select profile...</Option>
          </Select>}
      />
    </div>

    <UI.FieldLabel width='175px'>
      Client Rate Limit
      <Form.Item
        name='enableClientRateLimit'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>

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

  </>)
}
