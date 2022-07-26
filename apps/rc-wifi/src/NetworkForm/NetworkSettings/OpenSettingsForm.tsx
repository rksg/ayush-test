import React from 'react'

import { useIntl } from 'react-intl'
import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'

import { StepsForm } from '@acx-ui/components'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { CloudpathServerForm } from './CloudpathServerForm'

const { useWatch } = Form

export function OpenSettingsForm () {
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
  const {$t} = useIntl()

  return (
    <>
      <StepsForm.Title>{$t({id: 'stepForm.title', defaultMessage: 'Open Settings'})}</StepsForm.Title>

      <Form.Item>
        <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
          <Switch />
        </Form.Item>
        <span>{$t({id: 'stepForm.useCloudpathServer', defaultMessage: 'Use Cloudpath Server'})}</span>
      </Form.Item>

      {isCloudpathEnabled && <CloudpathServerForm />}

      { /*TODO: <div><Button type='link'>Show more settings</Button></div> */ }
    </>
  )
}
