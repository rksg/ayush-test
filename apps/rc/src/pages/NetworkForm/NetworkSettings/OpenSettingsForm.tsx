import React, { useContext } from 'react'

import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm }             from '@acx-ui/components'
import { useCloudpathListQuery } from '@acx-ui/rc/services'
import { NetworkTypeEnum }       from '@acx-ui/rc/utils'
import { useParams }             from '@acx-ui/react-router-dom'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext from '../NetworkFormContext'

import { CloudpathServerForm } from './CloudpathServerForm'

const { useWatch } = Form

export function OpenSettingsForm () {
  const { data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  if(data){
    form.setFieldsValue({
      isCloudpathEnabled: data.cloudpathServerId !== undefined
    })
  }
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
  const { editMode } = useContext(NetworkFormContext)
  const { $t } = useIntl()

  return (
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsForm.Title>

      <Form.Item>
        <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
          <Switch disabled={editMode} />
        </Form.Item>
        <span>{$t({ defaultMessage: 'Use Cloudpath Server' })}</span>
      </Form.Item>

      {isCloudpathEnabled && <CloudpathServerForm />}

      { /*TODO: <div><Button type='link'>Show more settings</Button></div> */ }
    </>
  )
}
