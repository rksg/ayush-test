import React, { useContext, useEffect, useState } from 'react'

import { Input, Radio, Space } from 'antd'
import {
  Col,
  Form,
  Row,
  Switch
} from 'antd'
import { isEmpty } from 'lodash'
import { useIntl } from 'react-intl'

import {
  Button,
  GridCol,
  GridRow,
  Modal,
  ModalType,
  StepsFormLegacy,
  Subtitle,
  Tooltip,
  Select
} from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { InformationSolid }                                       from '@acx-ui/icons'
import { useGetCertificateTemplatesQuery }                        from '@acx-ui/rc/services'
import {
  AAAWlanSecurityEnum,
  MacAuthMacFormatEnum,
  ManagementFrameProtectionEnum,
  NetworkSaveData,
  PolicyOperation,
  PolicyType,
  Radius,
  WifiNetworkMessages,
  WlanSecurityEnum,
  hasPolicyPermission,
  macAuthMacFormatOptions,
  useConfigTemplate,
  SecurityOptionsDescription,
  CertificateUrls
} from '@acx-ui/rc/utils'
import { useParams }            from '@acx-ui/react-router-dom'
import { hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }            from '@acx-ui/utils'

import {
  ApCompatibilityDrawer,
  ApCompatibilityToolTip,
  ApCompatibilityType,
  InCompatibilityFeatures
} from '../../ApCompatibility'
import { CertificateTemplateForm, MAX_CERTIFICATE_PER_TENANT, MAX_CERTIFICATE_TEMPLATE_PER_NETWORK } from '../../policies'
import { AAAInstance }                                                                               from '../AAAInstance'
import { NetworkDiagram }                                                                            from '../NetworkDiagram/NetworkDiagram'
import { MLOContext }                                                                                from '../NetworkForm'
import NetworkFormContext                                                                            from '../NetworkFormContext'
import { NetworkMoreSettingsForm }                                                                   from '../NetworkMoreSettings/NetworkMoreSettingsForm'
import * as UI                                                                                       from '../styledComponents'

import { IdentityGroup } from './SharedComponent/IdentityGroup/IdentityGroup'


const { Option } = Select

const { useWatch } = Form

export function AaaSettingsForm () {
  const { editMode, cloneMode, data, setData, isRuckusAiMode } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const isWifiRbacEnabledFF = useIsSplitOn(Features.WIFI_RBAC_API)
  const isWifiRbacEnabled = !isRuckusAiMode && isWifiRbacEnabledFF
  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabledFF = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const isRadsecFeatureEnabled = !isRuckusAiMode && isRadsecFeatureEnabledFF
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && isRadSecFeatureTierAllowed && !isTemplate
  const [hasSetRuckusAiFields, setRuckusAiFields] = useState(false)

  // TODO: Remove deprecated codes below when RadSec feature is delivery
  useEffect(()=>{
    if(!supportRadsec && !isRuckusAiMode && data && (editMode || cloneMode)) {
      setFieldsValue()
    }
  }, [data])

  useEffect(() => {
    if (isRuckusAiMode && (!isEmpty(data?.accountingRadiusId))
      && !hasSetRuckusAiFields && editMode) {
      setRuckusAiFields(true)
      form.setFieldValue('enableAccountingService', true)
      setData && setData({ ...data, enableAccountingService: true })
    }
  }, [data?.accountingRadiusId])

  useEffect(()=>{
    if(supportRadsec && data && (editMode || cloneMode)) {
      setFieldsValue()
    }
  }, [data?.id])

  const setFieldsValue = () => {
    data && form.setFieldsValue({
      enableAuthProxy: data.enableAuthProxy,
      enableAccountingProxy: data.enableAccountingProxy,
      enableAccountingService: data.enableAccountingService,
      authRadius: data.authRadius,
      accountingRadius: data.accountingRadius,
      accountingRadiusId: data.accountingRadiusId,
      authRadiusId: data.authRadiusId,
      useCertificateTemplate: data.useCertificateTemplate,
      certificateTemplateId: data.certificateTemplateId,
      certificateTemplateIds: data.certificateTemplateIds,
      wlan: {
        wlanSecurity: data.wlan?.wlanSecurity,
        managementFrameProtection: data.wlan?.managementFrameProtection,
        // eslint-disable-next-line max-len
        macAddressAuthenticationConfiguration: resolveMacAddressAuthenticationConfiguration(data, isWifiRbacEnabled)
      }
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
  const { $t } = useIntl()
  const { editMode, cloneMode, isRuckusAiMode } = useContext(NetworkFormContext)
  const { disableMLO } = useContext(MLOContext)
  const form = Form.useFormInstance()
  const wlanSecurity = useWatch(['wlan', 'wlanSecurity'])
  const useCertificateTemplate = useWatch('useCertificateTemplate')
  const isCertificateTemplateEnabledFF = useIsSplitOn(Features.CERTIFICATE_TEMPLATE)
  const isMultipleCertificateTemplatesEnabled
  = useIsSplitOn(Features.MULTIPLE_CERTIFICATE_TEMPLATE)
  const isCertificateTemplateEnabled = !isRuckusAiMode && isCertificateTemplateEnabledFF
  // eslint-disable-next-line max-len
  const isWifiIdentityManagementEnable = useIsSplitOn(Features.WIFI_IDENTITY_AND_IDENTITY_GROUP_MANAGEMENT_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const wpa2Description = <>
    {$t(WifiNetworkMessages.WPA2_DESCRIPTION)}
    <Space align='start'>
      <InformationSolid />
      {$t(SecurityOptionsDescription.WPA2_DESCRIPTION_WARNING)}
    </Space>
  </>

  const wpa3Description = $t(SecurityOptionsDescription.WPA3)

  useEffect(() => {
    if (!editMode && !cloneMode) {
      if (!wlanSecurity || !Object.keys(AAAWlanSecurityEnum).includes(wlanSecurity)) {
        form.setFieldValue(['wlan', 'wlanSecurity'], WlanSecurityEnum.WPA2Enterprise)
        // eslint-disable-next-line max-len
        form.setFieldValue(['wlan', 'managementFrameProtection'], ManagementFrameProtectionEnum.Disabled)
      }
    }

    if (wlanSecurity === WlanSecurityEnum.WPA3){
      disableMLO(false)
    } else {
      disableMLO(true)
      form.setFieldValue(['wlan', 'advancedCustomization', 'multiLinkOperationEnabled'], false)
    }


  }, [cloneMode, editMode, form, wlanSecurity])

  const handleWlanSecurityChanged = (v: WlanSecurityEnum) => {
    const managementFrameProtection = (v === WlanSecurityEnum.WPA3)
      ? ManagementFrameProtectionEnum.Required
      : ManagementFrameProtectionEnum.Disabled

    form.setFieldValue(['wlan', 'managementFrameProtection'], managementFrameProtection)
  }

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <StepsFormLegacy.Title>{ $t({ defaultMessage: 'AAA Settings' }) }</StepsFormLegacy.Title>
        <Form.Item
          label='Security Protocol'
          name={['wlan', 'wlanSecurity']}
          extra={
            wlanSecurity === WlanSecurityEnum.WPA2Enterprise
              ? wpa2Description
              : wpa3Description
          }
        >
          <Select onChange={handleWlanSecurityChanged}>
            <Option value={WlanSecurityEnum.WPA2Enterprise}>
              { $t({ defaultMessage: 'WPA2 (Recommended)' }) }
            </Option>
            <Option value={WlanSecurityEnum.WPA3}>{ $t({ defaultMessage: 'WPA3' }) }</Option>
          </Select>
        </Form.Item>
        <Form.Item name={['wlan', 'managementFrameProtection']} noStyle>
          <Input type='hidden' />
        </Form.Item>
      </div>
      {!isTemplate && isCertificateTemplateEnabled ? <>
        <div>
          <Form.Item name='useCertificateTemplate' initialValue={!!useCertificateTemplate}>
            <Radio.Group disabled={editMode}>
              <Space direction={'vertical'}>
                <Radio value={false}>{$t({ defaultMessage: 'Use External AAA Service' })}</Radio>
                <Radio value={true}>{$t({ defaultMessage: 'Use Certificate Auth' })}</Radio>
              </Space>
            </Radio.Group>
          </Form.Item>
        </div>
        {
          (!useCertificateTemplate && isWifiIdentityManagementEnable && !isTemplate) &&
          <Form.Item>
            <IdentityGroup comboWidth='210px' />
          </Form.Item>
        }
        <div>
          {useCertificateTemplate
            ? isMultipleCertificateTemplatesEnabled ? <CertsAuth /> : <CertAuth />
            : <AaaService />}
        </div>
      </> : <AaaService />}
    </Space>
  )
}

/**
 * @deprecated: Support multiple selection in the future for AAA network
 * Use the new `CertsAuth` component instead.
 * This component can be removed once Features.MULTIPLE_CERTIFICATE_TEMPLATE is removed.
 * */
function CertAuth () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [certTempModalVisible, setCertTempModalVisible] = useState(false)
  const { certTemplateOptions } =
  useGetCertificateTemplatesQuery({ payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 } },
    { selectFromResult: ({ data }) => {
      return {
        certTemplateOptions: data?.data.map(d => ({ value: d.id, label: d.name })) }} })
  return (
    <>
      <GridRow>
        <GridCol col={{ span: 12 }}>
          <Form.Item
            label={$t({ defaultMessage: 'Certificate Template' })}
            name='certificateTemplateId'
            rules={[{ required: true }]}
          >
            <Select
              placeholder={$t({ defaultMessage: 'Select...' })}
              options={certTemplateOptions}>
            </Select>
          </Form.Item>
        </GridCol>
        { hasPolicyPermission({
          type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE }) &&
          hasAllowedOperations([getOpsApi(CertificateUrls.addCertificateTemplate)]) &&
        <Button
          type='link'
          style={{ top: '28px' }}
          onClick={() => setCertTempModalVisible(true)}
        >
          { $t({ defaultMessage: 'Add' }) }
        </Button> }
      </GridRow>
      <Modal
        title={$t({ defaultMessage: 'Add Certificate Template' })}
        visible={certTempModalVisible}
        type={ModalType.ModalStepsForm}
        children={<CertificateTemplateForm
          modalMode={true}
          modalCallBack={(id) => {
            if (id) {
              form.setFieldValue('certificateTemplateId', id)
            }
            setCertTempModalVisible(false)
          }}
        />}
        onCancel={() => setCertTempModalVisible(false)}
        width={1200}
        destroyOnClose={true}
      />
    </ >
  )
}

function CertsAuth () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()
  const [certTempModalVisible, setCertTempModalVisible] = useState(false)
  const { certTemplateOptions } =
    useGetCertificateTemplatesQuery({ payload: { pageSize: MAX_CERTIFICATE_PER_TENANT, page: 1 } },
      { selectFromResult: ({ data }) => {
        return {
          certTemplateOptions: data?.data.map(d => ({ value: d.id, label: d.name })) }} })
  return (
    <>
      <GridRow>
        <GridCol col={{ span: 20 }}>
          <Form.Item
            label={$t({ defaultMessage: 'Certificate Template' })}
            name='certificateTemplateIds'
            rules={[
              { required: true },
              { max: MAX_CERTIFICATE_TEMPLATE_PER_NETWORK, type: 'array' }
            ]}
          >
            <Select
              placeholder={$t({ defaultMessage: 'Select...' })}
              optionFilterProp='label'
              mode='multiple'
              allowClear
              showArrow
              showSearch
              options={certTemplateOptions}
            >
            </Select>
          </Form.Item>
        </GridCol>
        { hasPolicyPermission({
          type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE }) &&
          <Button
            type='link'
            style={{ top: '28px' }}
            onClick={() => setCertTempModalVisible(true)}
          >
            { $t({ defaultMessage: 'Add' }) }
          </Button> }
      </GridRow>
      <Modal
        title={$t({ defaultMessage: 'Add Certificate Template' })}
        visible={certTempModalVisible}
        type={ModalType.ModalStepsForm}
        children={<CertificateTemplateForm
          modalMode={true}
          modalCallBack={(id) => {
            if (id) {
              const existingIds = form.getFieldValue('certificateTemplateIds') ?? []
              form.setFieldValue('certificateTemplateIds', [...existingIds, id])
            }
            setCertTempModalVisible(false)
          }}
        />}
        onCancel={() => setCertTempModalVisible(false)}
        width={1200}
        destroyOnClose={true}
      />
    </ >
  )
}

function AaaService () {
  const { $t } = useIntl()
  const { networkId } = useParams()
  const { editMode, setData, data, isRuckusAiMode } = useContext(NetworkFormContext)
  const form = Form.useFormInstance()
  const [ drawerVisible, setDrawerVisible ] = useState(false)
  const enableAccountingService = useWatch('enableAccountingService', form)
  const enableMacAuthentication = useWatch<boolean>(
    ['wlan', 'macAddressAuthenticationConfiguration', 'macAddressAuthentication'])
  const [selectedAuthRadius, selectedAcctRadius] =
    [useWatch<Radius>('authRadius'), useWatch<Radius>('accountingRadius')]
  const support8021xMacAuth = useIsSplitOn(Features.WIFI_8021X_MAC_AUTH_TOGGLE)
  const isR370UnsupportedFeatures = useIsSplitOn(Features.WIFI_R370_TOGGLE)
  const isWifiRbacEnabledFF = useIsSplitOn(Features.WIFI_RBAC_API)
  const isWifiRbacEnabled = !isRuckusAiMode && isWifiRbacEnabledFF

  const isRadSecFeatureTierAllowed = useIsTierAllowed(TierFeatures.PROXY_RADSEC)
  const isRadsecFeatureEnabledFF = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const isRadsecFeatureEnabled = !isRuckusAiMode && isRadsecFeatureEnabledFF
    && isRadSecFeatureTierAllowed

  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const labelWidth = '250px'

  const onProxyChange = (value: boolean, fieldName: string) => {
    setData && setData({ ...data, [fieldName]: value })
  }

  const onMacAuthChange = (checked: boolean) => {
    setData && setData({
      ...data,
      ...{
        wlan: {
          ...data?.wlan,
          ...(isWifiRbacEnabled
            ? { macAddressAuthentication: checked }
            : { macAddressAuthenticationConfiguration: {
              ...data?.wlan?.macAddressAuthenticationConfiguration,
              macAddressAuthentication: checked
            } })
        }
      }
    })
  }

  useEffect(() => {
    // This workaround is due to the other network type will set form fields and cause the proxy mode default value be effected
    if(data) {
      form.setFieldValue('enableAuthProxy', data.enableAuthProxy)
      form.setFieldValue('enableAccountingProxy', data.enableAccountingProxy)
    }
  },[data])

  useEffect(() => {
    if (supportRadsec && selectedAuthRadius?.radSecOptions?.tlsEnabled) {
      setData && setData({ ...data, enableAuthProxy: true })
    }
  }, [supportRadsec, selectedAuthRadius])

  useEffect(() => {
    if (supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled) {
      setData && setData({ ...data, enableAccountingProxy: true })
    }
  }, [supportRadsec, selectedAcctRadius])

  const proxyServiceTooltip = <Tooltip.Question
    placement='bottom'
    title={$t(WifiNetworkMessages.ENABLE_PROXY_TOOLTIP)}
    iconStyle={{ height: '16px', width: '16px', marginBottom: '-3px' }}
  />

  const macAuthOptions = Object.keys(macAuthMacFormatOptions).map((key =>
    <Option key={key}>
      { macAuthMacFormatOptions[key as keyof typeof macAuthMacFormatOptions] }
    </Option>
  ))

  return (
    <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
      <div>
        <Subtitle level={3}>{ $t({ defaultMessage: 'Authentication Service' }) }</Subtitle>
        <AAAInstance serverLabel={$t({ defaultMessage: 'Authentication Server' })}
          type='authRadius'/>
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            { $t({ defaultMessage: 'Proxy Service' }) }
            {proxyServiceTooltip}
          </Space>
          <Form.Item
            name='enableAuthProxy'
            valuePropName='checked'
            initialValue={false}
            children={<Switch
              onChange={(value) => onProxyChange(value,'enableAuthProxy')}
              disabled={supportRadsec && selectedAuthRadius?.radSecOptions?.tlsEnabled}/>}
          />
        </UI.FieldLabel>
      </div>
      <div>
        <UI.FieldLabel width={labelWidth}>
          <Subtitle level={3}>{ $t({ defaultMessage: 'Accounting Service' }) }</Subtitle>
          <Form.Item
            name='enableAccountingService'
            valuePropName='checked'
            initialValue={false}
            style={{ marginTop: '-5px', marginBottom: '0' }}
            children={<Switch
              onChange={(value)=>onProxyChange(value,'enableAccountingService')}
            />}
          />
        </UI.FieldLabel>
        {enableAccountingService && <>
          <AAAInstance serverLabel={$t({ defaultMessage: 'Accounting Server' })}
            type='accountingRadius'/>
          <UI.FieldLabel width={labelWidth}>
            <Space align='start'>
              { $t({ defaultMessage: 'Proxy Service' }) }
              {proxyServiceTooltip}
            </Space>
            <Form.Item
              name='enableAccountingProxy'
              valuePropName='checked'
              initialValue={false}
              children={<Switch
                onChange={(value) => onProxyChange(value,'enableAccountingProxy')}
                disabled={supportRadsec && selectedAcctRadius?.radSecOptions?.tlsEnabled}/>}
            />
          </UI.FieldLabel>
        </>}
      </div>
      {support8021xMacAuth && <>
        <UI.FieldLabel width={labelWidth}>
          <Space align='start'>
            { $t({ defaultMessage: 'MAC Authentication' }) }
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
          <Form.Item
            name={['wlan', 'macAddressAuthenticationConfiguration', 'macAddressAuthentication']}
            initialValue={false}
            valuePropName='checked'
            children={<Switch
              disabled={editMode}
              onChange={onMacAuthChange}
              data-testid='macAuth8021x'/>}
          />
        </UI.FieldLabel>
        {enableMacAuthentication &&
          <Form.Item
            label={$t({ defaultMessage: 'MAC Address Format' })}
            name={['wlan', 'macAddressAuthenticationConfiguration', 'macAuthMacFormat']}
            initialValue={MacAuthMacFormatEnum.UpperDash}
            children={<Select children={macAuthOptions} />}
          />
        }
      </>}
    </Space>
  )
}

export function resolveMacAddressAuthenticationConfiguration (
  data: NetworkSaveData,
  isWifiRbacEnabled: boolean
) : NonNullable<NetworkSaveData['wlan']>['macAddressAuthenticationConfiguration'] {
  const config = data.wlan?.macAddressAuthenticationConfiguration

  if (!isWifiRbacEnabled) return config

  return {
    ...(config ?? {}),
    macAddressAuthentication: data.wlan?.macAddressAuthentication
  }
}
