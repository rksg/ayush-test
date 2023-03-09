import React, { useContext, useEffect } from 'react'

import {
  Col,
  Form, Radio,
  Row, Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsForm, Tooltip }     from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { WifiNetworkMessages }    from '@acx-ui/rc/utils'

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
        wlan: {
          isMacRegistrationList: !!data.wlan?.macRegistrationListId,
          macAddressAuthentication: data.wlan?.macAddressAuthentication,
          macRegistrationListId: data.wlan?.macRegistrationListId
        },
        isCloudpathEnabled: data.authRadius ?? false,
        enableAccountingService: data.accountingRadius,
        authRadius: data.authRadius,
        accountingRadius: data.accountingRadius,
        accountingRadiusId: data.accountingRadiusId||data.accountingRadius?.id,
        authRadiusId: data.authRadiusId||data.authRadius?.id
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

  const macRegistrationEnabled = useIsSplitOn(Features.MAC_REGISTRATION)

  return (
    <>
      <StepsForm.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsForm.Title>

      <div>
        <Form.Item>
          <Form.Item>
            <Form.Item noStyle
              name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'>
              <Switch onChange={onMacAuthChange} />
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
            initialValue={false}
          >
            <Radio.Group disabled={editMode}>
              <Space direction='vertical'>
                <Radio value={true} disabled={!macRegistrationEnabled}>
                  { $t({ defaultMessage: 'MAC Registration List' }) }
                </Radio>
                <Radio value={false}>
                  { $t({ defaultMessage: 'External MAC Auth' }) }
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          { isMacRegistrationList && <MacRegistrationListComponent
            editMode={editMode}
            inputName={['wlan']}
          />}

          { !isMacRegistrationList && <CloudpathServerForm /> }

        </>}
      </div>


      {!(editMode) && <NetworkMoreSettingsForm wlanData={data} />}
    </>
  )
}
