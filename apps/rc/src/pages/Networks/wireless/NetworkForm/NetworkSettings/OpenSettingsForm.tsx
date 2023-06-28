import React, { useContext, useEffect } from 'react'

import {
  Col,
  Form, Radio,
  Row, Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormLegacy, Tooltip }                 from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { WifiNetworkMessages }                      from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'

import { CloudpathServerForm }      from './CloudpathServerForm'
import MacRegistrationListComponent from './MacRegistrationListComponent'

const { useWatch } = Form

export function OpenSettingsForm () {
  const { editMode, cloneMode, data } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      form.setFieldsValue({
        enableAuthProxy: data.enableAuthProxy,
        enableAccountingProxy: data.enableAccountingProxy,
        enableAccountingService: data.enableAccountingService,
        wlan: {
          isMacRegistrationList: !!data.wlan?.macRegistrationListId,
          macAddressAuthentication: data.wlan?.macAddressAuthentication,
          macRegistrationListId: data.wlan?.macRegistrationListId
        },
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
  const form = Form.useFormInstance()
  const [
    macAddressAuthentication,
    isMacRegistrationList
  ] = [
    useWatch<boolean>(['wlan', 'macAddressAuthentication']),
    useWatch(['wlan', 'isMacRegistrationList'])
  ]
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { $t } = useIntl()
  const onMacAuthChange = (checked: boolean) => {
    setData && setData({
      ...data,
      ...{
        wlan: {
          ...data?.wlan,
          macAddressAuthentication: checked
        }
      }
    })
  }
  useEffect(()=>{
    form.setFieldsValue(data)
  },[data])

  const disablePolicies = !useIsSplitOn(Features.POLICIES)
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

  return (
    <>
      <StepsFormLegacy.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsFormLegacy.Title>

      <div>
        <Form.Item>
          <Form.Item>
            <Form.Item noStyle
              name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'>
              <Switch onChange={onMacAuthChange} disabled={editMode || disablePolicies}/>
            </Form.Item>
            <span>{$t({ defaultMessage: 'MAC Authentication' })}</span>
            <Tooltip.Question
              title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
              placement='bottom'
            />
          </Form.Item>
        </Form.Item>
        {macAddressAuthentication && <>

          <Form.Item
            name={['wlan', 'isMacRegistrationList']}
            initialValue={isMacRegistrationList}
          >
            <Radio.Group disabled={editMode} defaultValue={!!isMacRegistrationList}>
              <Space direction='vertical'>
                <Radio value={true} disabled={!isCloudpathBetaEnabled}>
                  { $t({ defaultMessage: 'MAC Registration List' }) }
                </Radio>
                <Radio value={false}>
                  { $t({ defaultMessage: 'External MAC Auth' }) }
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          { isMacRegistrationList && <MacRegistrationListComponent
            inputName={['wlan']}
          />}

          { !isMacRegistrationList && <CloudpathServerForm /> }

        </>}
      </div>


      {!(editMode) && <NetworkMoreSettingsForm wlanData={data} />}
    </>
  )
}
