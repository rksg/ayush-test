import React, { useState } from 'react'

import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'

import { StepsForm, StepFormProps, Button } from '@acx-ui/components'
import { CreateNetworkFormFields }          from '@acx-ui/rc/utils'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { CloudpathServerForm } from './CloudpathServerForm'

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
      {state.isCloudpathEnabled && <CloudpathServerForm />}
      <div><Button type='link' style={{ padding: 0 }}>Show more settings</Button></div>
    </>
  )
}
