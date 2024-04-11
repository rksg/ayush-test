import React, { useContext, useEffect } from 'react'

import {
  Col,
  Form, Radio,
  Row, Select, Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormLegacy, Tooltip }                                                             from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                                             from '@acx-ui/feature-toggle'
import { MacAuthMacFormatEnum, macAuthMacFormatOptions, WifiNetworkMessages, WlanSecurityEnum } from '@acx-ui/rc/utils'

import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }              from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                     from '../styledComponents'

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
          macRegistrationListId: data.wlan?.macRegistrationListId,
          macAuthMacFormat: data.wlan?.macAuthMacFormat
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

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
    {!(editMode) && <Row>
      <Col span={24}>
        <NetworkMoreSettingsForm wlanData={data} />
      </Col>
    </Row>}
  </>)
}

function SettingsForm () {
  const labelWidth = '250px'
  const form = Form.useFormInstance()
  const { Option } = Select
  const [
    macAddressAuthentication,
    isMacRegistrationList,
    enableOwe,
    enableOweTransition
  ] = [
    useWatch<boolean>(['wlan', 'macAddressAuthentication']),
    useWatch(['wlan', 'isMacRegistrationList']),
    useWatch('enableOwe'),
    useWatch('enableOweTransition')
  ]
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
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

  const onMacAuthTypeChange = (checked: boolean) => {
    setData && setData({
      ...data,
      ...{
        wlan: {
          ...data?.wlan,
          isMacRegistrationList: checked
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

  useEffect(()=> {
    if (enableOwe === true && enableOweTransition === false) {
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }
  }, [enableOwe,enableOweTransition])

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

  const macAuthOptions = Object.keys(macAuthMacFormatOptions).map((key =>
    <Option key={key}>
      { macAuthMacFormatOptions[key as keyof typeof macAuthMacFormatOptions] }
    </Option>
  ))

  return (
    <>
      <StepsFormLegacy.Title>{$t({ defaultMessage: 'Open Settings' })}</StepsFormLegacy.Title>
      <div>
        <Form.Item>
          {supportOweEncryption &&
          <UI.FieldLabel width={labelWidth}>
            <Space align='start'>
              {$t({ defaultMessage: 'OWE encryption' })}
              <Tooltip.Question
                title={$t(WifiNetworkMessages.ENABLE_OWE_TOOLTIP)}
                placement='bottom'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />
            </Space>
            <Form.Item
              name='enableOwe'
              initialValue={false}
              valuePropName='checked'
              children={<Switch onChange={onOweChange} />}
            />
          </UI.FieldLabel>}
          {enableOwe && supportOweTransition &&
          <UI.FieldLabel width={labelWidth}>
            <Space align='start'>
              {$t({ defaultMessage: 'OWE Transition mode' })}
              <Tooltip.Question
                title={$t(WifiNetworkMessages.ENABLE_OWE_TRANSITION_TOOLTIP)}
                placement='bottom'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />
            </Space>
            <Form.Item name='enableOweTransition'
              initialValue={false}
              valuePropName='checked'
              children={<Switch onChange={onOweTransitionChange} />}
            />
          </UI.FieldLabel>}
          <UI.FieldLabel width={labelWidth}>
            <Space align='start'>
              {$t({ defaultMessage: 'MAC Authentication' })}
              <Tooltip.Question
                title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
                placement='bottom'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />
            </Space>
            <Form.Item name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'
              children={<Switch id={'macAuthSwitch'}
                onChange={onMacAuthChange}
                disabled={editMode || disablePolicies}
              />}
            />
          </UI.FieldLabel>
        </Form.Item>
        {macAddressAuthentication && <>
          <Form.Item
            name={['wlan', 'isMacRegistrationList']}
            initialValue={!!isMacRegistrationList}
          >
            <Radio.Group
              disabled={editMode}
              onChange={e => onMacAuthTypeChange(e.target.value)}>
              <Space direction='vertical'>
                <Radio value={true}
                  disabled={!isCloudpathBetaEnabled}
                  children={$t({ defaultMessage: 'MAC Registration List' })}
                />
                <Radio value={false}
                  children={$t({ defaultMessage: 'External MAC Auth' })}
                />
              </Space>
            </Radio.Group>
          </Form.Item>

          { isMacRegistrationList
            ? <MacRegistrationListComponent inputName={['wlan']} />
            : <>
              <Form.Item
                label={$t({ defaultMessage: 'MAC Address Format' })}
                name={['wlan', 'macAuthMacFormat']}
                initialValue={MacAuthMacFormatEnum.UpperDash}
                children={<Select children={macAuthOptions} />}
              />
              <CloudpathServerForm />
            </>}
        </>}
      </div>
    </>
  )
}
