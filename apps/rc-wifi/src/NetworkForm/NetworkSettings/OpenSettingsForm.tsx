import React, { useState } from 'react'

import {
  Col,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Typography
} from 'antd'

import { StepsForm, StepFormProps, Button } from '@acx-ui/components'
import { useCloudpathListQuery }            from '@acx-ui/rc/services'
import { CreateNetworkFormFields }          from '@acx-ui/rc/utils'
import { useParams }                        from '@acx-ui/react-router-dom'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'


const { Option } = Select

export interface OpenSettingsFields {
  isCloudpathEnabled?: boolean;
}

export function OpenSettingsForm (props: StepFormProps<CreateNetworkFormFields>) {
  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm formRef={props.formRef} />
      </Col>
      <Col span={14}>
        <NetworkDiagram type='open'/>
      </Col>
    </Row>
  )
}

function SettingsForm (props: StepFormProps<CreateNetworkFormFields>) {
  const [state, updateState] = useState<OpenSettingsFields>({
    isCloudpathEnabled: false
  })
  const updateData = (newData: Partial<OpenSettingsFields>) => {
    updateState({ ...state, ...newData })
  }

  return (
    <>
      <StepsForm.Title>Open Settings</StepsForm.Title>

      <Form.Item name='isCloudpathEnabled' 
        initialValue={ state.isCloudpathEnabled }
        valuePropName='checked'>
        <Switch
          onChange={function (value: any) {
            props.formRef?.current?.setFieldsValue({ isCloudpathEnabled: value })
            updateData({ isCloudpathEnabled: value })
          }}
        />
        <span>Use Cloudpath Server</span>
      </Form.Item>
      {state.isCloudpathEnabled && <CloudpathServer />}
      <div><Button type='link' style={{ padding: 0 }}>Show more settings</Button></div>
    </>
  )
}

function CloudpathServer () {
  const params = useParams()
  const { data } = useCloudpathListQuery({ params })

  const [state, updateState] = useState({
    enableCloudPathServer: false,
    cloudpathId: ''
  })

  const updateData = (newData: any) => {
    updateState(newData)
  }

  const selectOptions = []
  for (let i = 0; i < (data ? data.length : 0); i++) {
    selectOptions.push(<Option key={data[i].id}>{data[i].name}</Option>)
  }

  const onCloudPathChange = function (cloudpathId: any) {
    updateData({ enableCloudPathServer: true, cloudpathId })
  }

  const getCloudData = function () {
    return data.find((item: any) => item.id === state.cloudpathId)
  }

  return (
    <React.Fragment>
      <StepsForm.Title>Cloudpath Server</StepsForm.Title>
      <Form.Item name='cloudpathServerId' rules={[{ required: true }]}>
        <Select
          style={{ width: '100%' }}
          onChange={onCloudPathChange}
          onSelect={onCloudPathChange}
          placeholder='Select...'
        >
          {selectOptions}
        </Select>
      </Form.Item>
      <div><Button type='link' style={{ padding: 0 }}>Add Server</Button></div>

      {state.cloudpathId !== '' && (
        <>
          <Typography.Title level={4}>
            Radius Authentication Service
          </Typography.Title>
          <Form.Item
            label='Deployment Type'
            children={getCloudData().deploymentType}
          />
          <Typography.Title level={4}>
            Radius Authentication Service
          </Typography.Title>
          <Form.Item
            label='IP Address'
            children={
              getCloudData().authRadius.primary.ip +
              ':' +
              getCloudData().authRadius.primary.port
            }
          />
          <Form.Item
            label='Radius Shared secret'
            children={
              <Input.Password
                readOnly={true}
                bordered={false}
                style={{ padding: '0px' }}
                value={getCloudData().authRadius.primary.sharedSecret}
              />
            }
          />
        </>
      )}
    </React.Fragment>
  )
}