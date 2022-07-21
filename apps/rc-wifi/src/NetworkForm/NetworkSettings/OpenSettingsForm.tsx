import React, { useContext } from 'react'

import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'

import { StepsForm } from '@acx-ui/components'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext from '../NetworkFormContext'

import { CloudpathServerForm } from './CloudpathServerForm'

const { useWatch } = Form

export function OpenSettingsForm (){
  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram type='open' />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const isCloudpathEnabled = useWatch<boolean>('isCloudpathEnabled')
  const { editMode } = useContext(NetworkFormContext)

  return (
    <>
      <StepsForm.Title>Open Settings</StepsForm.Title>

      <Form.Item>
        <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
          <Switch disabled={editMode} />
        </Form.Item>
        <span>Use Cloudpath Server</span>
      </Form.Item>

      {isCloudpathEnabled && <CloudpathServerForm />}

      { /*TODO: <div><Button type='link'>Show more settings</Button></div> */ }
    </>
  )
}
