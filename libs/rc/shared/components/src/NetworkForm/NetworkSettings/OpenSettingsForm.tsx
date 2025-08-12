import React, { useContext, useEffect, useState } from 'react'

import {
  Col,
  Form, Radio,
  Row, Select, Space,
  Switch
} from 'antd'
import { useIntl } from 'react-intl'

import { StepsFormLegacy, Tooltip }                 from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ConfigTemplateType,
  MacAuthMacFormatEnum,
  macAuthMacFormatOptions,
  NetworkTypeEnum,
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
import { useIsConfigTemplateEnabledByType } from '../../configTemplates'
import { NetworkDiagram }                   from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }                       from '../NetworkForm'
import NetworkFormContext                   from '../NetworkFormContext'
import { NetworkMoreSettingsForm }          from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                              from '../styledComponents'

import MacRegistrationListComponent from './MacRegistrationListComponent'
import { IdentityGroup }            from './SharedComponent/IdentityGroup/IdentityGroup'
import { RadiusSettings }           from './SharedComponent/RadiusSettings/RadiusSettings'

const { useWatch } = Form

export function OpenSettingsForm () {
  const { editMode, cloneMode, data, isRuckusAiMode } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const enableOwe = useWatch('enableOwe', form)
  const enableMACAuth = useWatch(['wlan', 'macAddressAuthentication'], form)
  const isMacRegistrationList = useWatch(['wlan', 'isMacRegistrationList'], form)
  const enableAccountingProxy = useWatch('enableAccountingProxy', form)
  const enableAccountingService = useWatch('enableAccountingService', form)
  const enableAuthProxy = useWatch('enableAuthProxy', form)

  useEffect(()=>{
    if((editMode || cloneMode) && data){
      setFieldsValue()
    }
  }, [data?.id])

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
      authRadiusId: data.authRadiusId||data.authRadius?.id,
      // eslint-disable-next-line max-len
      enableOwe: [WlanSecurityEnum.OWE, WlanSecurityEnum.OWETransition].includes(data.wlan?.wlanSecurity!),
      enableOweTransition: data.wlan?.wlanSecurity === WlanSecurityEnum.OWETransition
    })
  }

  return (<>
    <Row gutter={20}>
      <Col span={10}>
        <SettingsForm />
      </Col>
      <Col span={14} style={{ height: '100%' }}>
        <NetworkDiagram
          type={NetworkTypeEnum.OPEN}
          enableOwe={enableOwe}
          enableMACAuth={enableMACAuth}
          isMacRegistrationList={isMacRegistrationList}
          enableAccountingService={enableAccountingService}
          enableAccountingProxy={enableAccountingProxy}
          enableAuthProxy={enableAuthProxy}
        />
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
  const { editMode } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const { $t } = useIntl()
  const { isTemplate } = useConfigTemplate()
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  // eslint-disable-next-line max-len
  const isIdentityGroupTemplateEnabled = useIsConfigTemplateEnabledByType(ConfigTemplateType.IDENTITY_GROUP)
  // eslint-disable-next-line max-len
  const isOpenNetworkIntegrateIdentityGroupEnable = useIsSplitOn(Features.WIFI_OPEN_NETWORK_INTEGRATE_IDENTITY_GROUP_TOGGLE)

  // eslint-disable-next-line max-len
  const isSupportNetworkRadiusAccounting = useIsSplitOn(Features.WIFI_NETWORK_RADIUS_ACCOUNTING_TOGGLE)

  useEffect(()=> {
    if (enableOwe === true && enableOweTransition === false) {
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }
  }, [enableOwe, enableOweTransition])

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
              children={<Switch />}
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
              children={<Switch />}
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
              {isR370UnsupportedFeatures &&
              <ApCompatibilityDrawer
                visible={drawerVisible}
                type={ApCompatibilityType.ALONE}
                networkId={networkId}
                featureNames={[InCompatibilityFeatures.MAC_AUTH]}
                onClose={() => setDrawerVisible(false)}
              />}
            </Space>
            <Form.Item name={['wlan', 'macAddressAuthentication']}
              valuePropName='checked'
              children={<Switch
                data-testid='mac-auth-switch'
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
            <Radio.Group disabled={editMode}>
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
            <RadiusSettings
              isDisplayAccounting={!isSupportNetworkRadiusAccounting}
            />
          </>}
        </>}
        {isSupportNetworkRadiusAccounting &&
          <div>
            <RadiusSettings
              isDisplayAuth={false}
            />
          </div>
        }
        {(isOpenNetworkIntegrateIdentityGroupEnable &&
          !isMacRegistrationList &&
            (isTemplate ? isIdentityGroupTemplateEnabled : true) ) &&
          <div>
            <IdentityGroup comboWidth='200px' />
          </div>}
      </div>
    </>
  )
}
