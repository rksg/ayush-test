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
        enableAccountingService: data.accountingRadius,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        accountingRadiusId: data.accountingRadiusId||data.accountingRadius?.id,
        authRadiusId: data.authRadiusId||data.authRadius?.id
      })
      form.setFieldValue(['wlan', 'macAddressAuthentication'],
        data.wlan?.macAddressAuthentication)
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
  const isMacAuthEnabled = useWatch<boolean>(['wlan', 'macAddressAuthentication'])
  const { editMode, data } = useContext(NetworkFormContext)
  const { $t } = useIntl()

  const disableAAA = !useIsSplitOn(Features.POLICIES)
  return (
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsForm.Title>

      <Form.Item>
        <Form.Item noStyle name={['wlan', 'macAddressAuthentication']} valuePropName='checked'>
          <Switch disabled={editMode||disableAAA} />
        </Form.Item>
        <span>{$t({ defaultMessage: 'Use MAC Auth' })}</span>
      </Form.Item>

      {isMacAuthEnabled && <CloudpathServerForm />}
      {!(editMode) && <NetworkMoreSettingsForm wlanData={data} />}
    </>
  )
}
