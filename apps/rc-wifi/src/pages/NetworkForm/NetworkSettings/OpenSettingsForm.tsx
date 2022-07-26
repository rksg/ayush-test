import React from 'react'

import { useIntl } from 'react-intl'
import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'

import { StepsForm }             from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { NetworkTypeEnum }       from '@acx-ui/rc/utils'
import { useParams }             from '@acx-ui/react-router-dom'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'

import { CloudpathServerForm } from './CloudpathServerForm'

const { useWatch } = Form

export function OpenSettingsForm () {
  const selectedId = useWatch('cloudpathServerId')
  const { selected } = useCloudpathListQuery({ params: useParams() }, {
    selectFromResult ({ data }) {
      return {
        selected: data?.find((item) => item.id === selectedId)
      }
    }
  })

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14}>
        <NetworkDiagram
          type={NetworkTypeEnum.OPEN}
          cloudpathType={selected?.deploymentType}
        />
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
