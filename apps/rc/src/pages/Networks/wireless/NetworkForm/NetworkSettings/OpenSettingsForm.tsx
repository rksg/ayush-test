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
import { WifiNetworkMessages, WlanSecurityEnum }    from '@acx-ui/rc/utils'

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
    isMacRegistrationList,
    enableOwe
  ] = [
    useWatch<boolean>(['wlan', 'macAddressAuthentication']),
    useWatch(['wlan', 'isMacRegistrationList']),
    useWatch('enableOwe')
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
  const onOweChange = (checked: boolean) => {
    setData && setData({
      ...data,
      wlan: {
        ...data?.wlan,
        wlanSecurity: checked ? WlanSecurityEnum.OWE : WlanSecurityEnum.Open
      }
    })
  }
  const onOweTransitionChange = (checked: boolean) => {
    setData && setData({
      ...data,
      wlan: {
        ...data?.wlan,
        wlanSecurity: checked ? WlanSecurityEnum.OWETransition : WlanSecurityEnum.OWE
      }
    })
  }
  useEffect(()=>{
    if (data && 'enableOwe' in data) {
      delete data['enableOwe']
    }
    if (data && 'enableOweTransition' in data) {
      delete data['enableOweTransition']
    }
    form.setFieldsValue(data)
    if(data?.wlan?.wlanSecurity){
      form.setFieldValue('enableOwe',
        (data.wlan.wlanSecurity === WlanSecurityEnum.OWE ||
        data.wlan.wlanSecurity === WlanSecurityEnum.OWETransition) ? true : false)
      form.setFieldValue('enableOweTransition',
        data.wlan.wlanSecurity === WlanSecurityEnum.OWETransition ? true : false)
    }
  },[data])

  const disablePolicies = !useIsSplitOn(Features.POLICIES)
  const supportOweEncryption = useIsSplitOn(Features.WIFI_EDA_OWE_TOGGLE)
  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const supportOweTransition = useIsSplitOn(Features.WIFI_EDA_OWE_TRANSITION_TOGGLE)

  return (
    <>
      <StepsFormLegacy.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsFormLegacy.Title>

      <div>
        <Form.Item>
          {supportOweEncryption && <Form.Item>
            <Form.Item noStyle
              name='enableOwe'
              initialValue={false}
              valuePropName='checked'
              children={<Switch
                onChange={onOweChange} />}
            />
            <span>{$t({ defaultMessage: 'Enable OWE encryption' })}</span>
            <Tooltip.Question
              title={$t(WifiNetworkMessages.ENABLE_OWE_TOOLTIP)}
              placement='bottom'
            />
          </Form.Item>}
          {enableOwe && supportOweTransition && <Form.Item>
            <Form.Item noStyle
              name='enableOweTransition'
              initialValue={false}
              valuePropName='checked'
              children={<Switch
                onChange={onOweTransitionChange} />}
            />
            <span>{$t({ defaultMessage: 'Enable OWE Transition mode' })}</span>
            <Tooltip.Question
              title={$t(WifiNetworkMessages.ENABLE_OWE_TRANSITION_TOOLTIP)}
              placement='bottom'
            />
          </Form.Item>}
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
