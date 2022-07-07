
import React, { useState } from 'react'

import {
  Button,
  Form,
  Select,
  Slider,
  Switch,
  Modal,
  Input
} from 'antd'

import { StepsForm }              from '@acx-ui/components'
import { useDevicePolicyListQuery,
  useL2AclPolicyListQuery,
  useL3AclPolicyListQuery,
  useApplicationPolicyListQuery } from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

import * as UI from './styledComponents'




const { useWatch } = Form
const { Option } = Select

function SaveAsAcProfileButton () {
  const [isModalVisible, setIsModalVisible] = useState(false)

  const showModal = () => {
    setIsModalVisible(true)
  }

  const handleOk = () => {
    setIsModalVisible(false)
  }

  const handleCancel = () => {
    setIsModalVisible(false)
  }

  return( <>
    <Button
      type='link'
      style={{ padding: 0 }}
      onClick={() => {
        showModal()
      }}
    >
      Save as AC Profile
    </Button>
    <Modal
      title='Create Access Control Profile'
      visible={isModalVisible}
      onOk={handleOk}
      onCancel={handleCancel}
    >
      <UI.FieldLabel width='175px'>
        Profile Name:
        <Form.Item
          name='profileName'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Input />}
        />
      </UI.FieldLabel>

      <UI.FieldLabel width='175px'>
        Client Rate Limit
        <Form.Item
          name='description'
          style={{ marginBottom: '10px' }}
          valuePropName='checked'
          initialValue={false}
          children={<Input />}
        />
      </UI.FieldLabel>

      <AccessControlConfigForm />
    </Modal>
  </>)
}


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
            <SaveAsAcProfileButton />
          }
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

  const listPayload = {
    fields: ['name', 'id'], sortField: 'name',
    sortOrder: 'ASC', page: 1, pageSize: 10000
  }

  const { layer2SelectOptions } = useL2AclPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        layer2SelectOptions: data?.data.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  const { layer3SelectOptions } = useL3AclPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        layer3SelectOptions: data?.data.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  const { devicePolicySelectOptions } = useDevicePolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        devicePolicySelectOptions: data?.data.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })

  const { applicationPolicySelectOptions } = useApplicationPolicyListQuery({
    params: useParams(),
    payload: listPayload
  }, {
    selectFromResult ({ data }) {
      return {
        applicationPolicySelectOptions: data?.data.map(
          item => <Option key={item.id}>{item.name}</Option>) ?? []
      }
    }
  })


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
            name='layer2Id'
            style={{ marginBottom: '10px', lineHeight: '32px' }}
            children={
              <Select placeholder='Select profile...'
                style={{ width: '180px' }}
                children={layer2SelectOptions} />
            }
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
              <Select placeholder='Select profile...'
                style={{ width: '180px' }}
                children={layer3SelectOptions} />
            }
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
              <Select placeholder='Select profile...'
                style={{ width: '180px' }}
                children={devicePolicySelectOptions} />
            }
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
              <Select placeholder='Select profile...'
                style={{ width: '180px' }}
                children={applicationPolicySelectOptions} />
            }
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
