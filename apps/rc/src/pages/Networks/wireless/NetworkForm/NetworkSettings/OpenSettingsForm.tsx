import React, { useContext, useEffect } from 'react'

import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm }              from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'

import { NetworkDiagram } from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext from '../NetworkFormContext'

import { NetworkMoreSettingsForm } from './../NetworkMoreSettings/NetworkMoreSettingsForm'
import { CloudpathServerForm }     from './CloudpathServerForm'

const { useWatch } = Form

export function OpenSettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({
        isCloudpathEnabled: data.isCloudpathEnabled,
        enableAccountingService: data.accountingRadius,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        accountingRadiusId: data.accountingRadiusId,
        authRadiusId: data.authRadiusId
      })
    }
  }, [data])

  return (
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
  )
}

function SettingsForm () {
  const form = Form.useFormInstance()
  const isCloudpathEnabled = useWatch<boolean>('isCloudpathEnabled')
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { $t } = useIntl()

  const onCloudPathChange = (checked: boolean) => {
    if(checked){
      delete data?.authRadius
      delete data?.accountingRadius
    }else{
      delete data?.cloudpathServerId
      form.setFieldsValue({
        cloudpathServerId: ''
      })
    }
    setData && setData({ ...data, isCloudpathEnabled: checked })
  }
  const disableAAA = !useIsSplitOn(Features.POLICIES)||true
  return (
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsForm.Title>

      <Form.Item>
        <Form.Item noStyle name='isCloudpathEnabled' valuePropName='checked'>
          <Switch disabled={editMode||disableAAA} onChange={onCloudPathChange} />
        </Form.Item>
        <span>{$t({ defaultMessage: 'Use Cloudpath Server' })}</span>
      </Form.Item>

      {isCloudpathEnabled && <CloudpathServerForm />}
      {!(editMode) && <NetworkMoreSettingsForm wlanData={data} />}
    </>
  )
}
