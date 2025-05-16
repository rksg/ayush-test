import React, { useContext, useEffect, useState } from 'react'

import {
  Col,
  Form, Radio,
  Row, Select, Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormLegacy, Tooltip }                               from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  MacAuthMacFormatEnum,
  macAuthMacFormatOptions,
  useConfigTemplate,
  WifiNetworkMessages,
  WlanSecurityEnum
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../../ApCompatibility'
import { NetworkDiagram }          from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }              from '../NetworkForm'
import NetworkFormContext          from '../NetworkFormContext'
import { NetworkMoreSettingsForm } from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                     from '../styledComponents'

import { CloudpathServerForm }      from './CloudpathServerForm'
import MacRegistrationListComponent from './MacRegistrationListComponent'
import { IdentityGroup }            from './SharedComponent/IdentityGroup/IdentityGroup'

const { useWatch } = Form

export function OpenSettingsForm () {
  const { editMode, cloneMode, data, isRuckusAiMode } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

  // TODO: Remove deprecated codes below when RadSec feature is delivery
  useEffect(()=>{
    if(!supportRadsec && (editMode || cloneMode) && data){
      setFieldsValue()
    }
  }, [supportRadsec, data])

  useEffect(()=>{
    if(supportRadsec && (editMode || cloneMode) && data){
      setFieldsValue()
    }
  }, [supportRadsec, data?.id])

  const setFieldsValue = () => {
    data && form.setFieldsValue({
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
  }

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram />
      </Col>
    </Row>
    {!(editMode) && !(isRuckusAiMode) && <Row>
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
  const { networkId } = useParams()
  const { editMode, data, setData } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  // eslint-disable-next-line max-len
  const isOpenNetworkIntegrateIdentityGroupEnable = useIsSplitOn(Features.WIFI_OPEN_NETWORK_INTEGRATE_IDENTITY_GROUP_TOGGLE)
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate

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
    // TODO: Remove deprecated codes below when RadSec feature is delivery
    if (!supportRadsec) {
      form.setFieldsValue(data)
    }
    if(data?.wlan?.wlanSecurity){
      form.setFieldValue('enableOwe',
        (data.wlan.wlanSecurity === WlanSecurityEnum.OWE ||
        data.wlan.wlanSecurity === WlanSecurityEnum.OWETransition) ? true : false)
      form.setFieldValue('enableOweTransition',
        data.wlan.wlanSecurity === WlanSecurityEnum.OWETransition ? true : false)
    }
  },[data])

  useEffect(()=>{
    if (supportRadsec) {
      form.setFieldsValue(data)
    }
  },[data?.id, data?.wlan?.wlanSecurity])

  const isCloudpathBetaEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)

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
          </UI.FieldLabel>
          {enableOwe &&
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
              {!isR370UnsupportedFeatures && <Tooltip.Question
                title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
                placement='bottom'
                iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
              />}
              {isR370UnsupportedFeatures && <ApCompatibilityToolTip
                title={$t(WifiNetworkMessages.ENABLE_MAC_AUTH_TOOLTIP)}
                showDetailButton
                placement='bottom'
                onClick={() => setDrawerVisible(true)}
              />}
              {isR370UnsupportedFeatures && <ApCompatibilityDrawer
                visible={drawerVisible}
                type={ApCompatibilityType.ALONE}
                networkId={networkId}
                featureName={InCompatibilityFeatures.MAC_AUTH}
                onClose={() => setDrawerVisible(false)}
              />}
            </Space>
            <Form.Item name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'
              children={<Switch
                data-testid='mac-auth-switch'
                onChange={onMacAuthChange}
                disabled={editMode}
              />}
            />
          </UI.FieldLabel>
        </Form.Item>
        {macAddressAuthentication && <>
          {!isTemplate && <Form.Item
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
          </Form.Item>}

          { isMacRegistrationList && <MacRegistrationListComponent
            inputName={['wlan']}
          />}

          { (isTemplate || !isMacRegistrationList) && <>
            <Form.Item
              label={$t({ defaultMessage: 'MAC Address Format' })}
              name={['wlan', 'macAuthMacFormat']}
              initialValue={MacAuthMacFormatEnum.UpperDash}
              children={<Select children={macAuthOptions} />}
            />
            <CloudpathServerForm />
          </>}

        </>}
        {(isOpenNetworkIntegrateIdentityGroupEnable &&
          !isMacRegistrationList &&
          !isTemplate ) &&
          <IdentityGroup />}
      </div>
    </>
  )
}
