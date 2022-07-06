
import React, { useState } from 'react'

import {
  Button,
  Form,
  Select,
  Slider,
  Switch
} from 'antd'

import { StepsForm } from '@acx-ui/components'


import * as UI from './styledComponents'


const { useWatch } = Form
const { Option } = Select




export function AccessControlForm () {
  const [enabledProfile, setEnabledProfile] = useState(false)

  return (
    <div style={{ marginBottom: '30px' }}>
      <span style={{ display: 'grid',
        gridTemplateColumns: '220px 130px auto' ,
        marginTop: '20px' }}>
        <StepsForm.Title
          style={{
            fontSize: 'var(--acx-subtitle-4-font-size)',
            lineHeight: '32px',
            fontWeight: '600'
          }}
        >
          Access Control
        </StepsForm.Title>

        <span>
          {!enabledProfile &&
            <Button
              type='link'
              style={{ padding: 0 }}
              onClick={() => {
              }}
            >
              Save as AC Profile
            </Button>}
        </span>


        <Button
          type='link'
          style={{ padding: 0 }}
          onClick={() => {
            setEnabledProfile(!enabledProfile)
          }}
        >
          {enabledProfile ? 'Select separate profiles' : 'Select Access Control profile'}
        </Button>

      </span>


      {enabledProfile ?
        <SelectAccessProfileProfile /> :
        <AccessControlConfigForm />}



    </div>)
}

function SelectAccessProfileProfile () {
  const [enableAccessControlProfile] = [useWatch('enableAccessControlProfile')]
  return (<>

    <UI.FieldLabel width='175px'>
      Access Control
      <Form.Item
        name='enableAccessControlProfile'
        style={{ marginBottom: '10px' }}
        valuePropName='checked'
        initialValue={false}
        children={<Switch />}
      />
    </UI.FieldLabel>




    {enableAccessControlProfile && <Form.Item
      label='Access Control Policy'
      name='accessControlPolicy'
    >
      <Select>
      </Select>
    </Form.Item>}

    <UI.FieldLabel width='175px' style={{ fontWeight: 700 }}>
      <span>Access Policy</span>
      <span>Policy Details</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      <span>Layer 2</span>
      <span>--</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      <span>Layer 3</span>
      <span>--</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      <span>Device & OS</span>
      <span>--</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      <span>Applications</span>
      <span>--</span>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
      <span>Client Rate Limit</span>
      <span>--</span>
    </UI.FieldLabel>




  </>)
}

function AccessControlConfigForm () {

  const [
    enableLayer2,
    enableLayer3,
    enableDeviceOs,
    enableApplications,
    enableDownloadLimit,
    enableUploadLimit,
    enableClientRateLimit
  ] = [
    useWatch<boolean>('enableLayer2'),
    useWatch<boolean>('enableLayer3'),
    useWatch<boolean>('enableDeviceOs'),
    useWatch<boolean>('enableApplications'),
    useWatch<boolean>('enableDownloadLimit'),
    useWatch<boolean>('enableUploadLimit'),
    useWatch<boolean>('enableClientRateLimit')
  ]

  return (<>
    <UI.FieldLabel width='175px'>
      Layer 2
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name='enableLayer2'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableLayer2 && <>
          <Form.Item
            name='layer2'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
          Add
        </>}
      </div>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
    Layer 3
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name='enableLayer3'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableLayer3 && <>
          <Form.Item
            name='layer3'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
          Add
        </>}
      </div>
    </UI.FieldLabel>

    <UI.FieldLabel width='175px'>
    Device & OS
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name='enableDeviceOs'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />

        {enableDeviceOs && <>
          <Form.Item
            name='deviceOs'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
          Add
        </>}
      </div>
    </UI.FieldLabel>


    <UI.FieldLabel width='175px'>
    Applications
      <div style={{ display: 'grid', gridTemplateColumns: '50px 190px auto' }}>
        <Form.Item
          name='enableApplications'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Switch />}
        />
        {enableApplications && <>
          <Form.Item
            name='applications'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select defaultValue=''
                style={{ width: '180px' }}>
                <Option value=''>Select profile...</Option>
              </Select>}
          />
          Add
        </>}
      </div>
    </UI.FieldLabel>

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

    {enableClientRateLimit && <>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='enableUploadLimit'
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
          enableUploadLimit ?
            <UI.FormItemNoLabel
              name='uploadLimit'
              children={
                <RateSlider />
              }
            /> :
            <Unlimited />
        }
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '175px 1fr' }}>
        <UI.FormItemNoLabel
          name='enableDownloadLimit'
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
          enableDownloadLimit ?
            <UI.FormItemNoLabel
              name='downloadLimit'
              children={
                <RateSlider />
              }
            /> :
            <Unlimited />
        }
      </div>
    </>}
  </>)

}

function Unlimited () {
  return (
    <UI.Label
      style={{ lineHeight: '50px' }}>
      Unlimited
    </UI.Label>
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
