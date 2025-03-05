import { useEffect, useRef, useState } from 'react'

import { Form, Input, InputNumber, Radio, RadioChangeEvent, Space, Switch } from 'antd'
import { useIntl }                                                          from 'react-intl'
import { useParams }                                                        from 'react-router-dom'

import { Button, Fieldset, GridCol, GridRow, StepsFormLegacy, PasswordInput, Tooltip, Select } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { useGetCertificateAuthoritiesQuery,
  useGetCertificateAuthorityOnRadiusQuery,
  useGetCertificateListQuery,
  useGetClientCertificateOnRadiusQuery,
  useGetServerCertificateOnRadiusQuery
} from '@acx-ui/rc/services'
import {
  AAAPolicyType, checkObjectNotExists, servicePolicyNameRegExp,
  networkWifiIpRegExp, networkWifiSecretRegExp,
  policyTypeLabelMapping, PolicyType,
  useConfigTemplate,
  hasPolicyPermission,
  PolicyOperation,
  CertificateStatusType,
  ExtendedKeyUsages,
  URLRegExp,
  CertificateUrls
} from '@acx-ui/rc/utils'
import { hasAllowedOperations } from '@acx-ui/user'
import { getOpsApi }            from '@acx-ui/utils'

import { CertificateWarning }                                     from '../AAAUtil/CertificateWarning'
import { CERTIFICATE_AUTHORITY_MAX_COUNT, CERTIFICATE_MAX_COUNT } from '../CertificateTemplate'
import CertificateDrawer                                          from '../CertificateTemplate/Certificate/CertificateDrawer'

import { useGetAAAPolicyInstanceList } from './aaaPolicyQuerySwitcher'
import CertificateAuthorityDrawer      from './CertificateAuthorityDrawer'
import { MessageMapping }              from './messageMapping'
import * as UI                         from './styledComponents'


type AAASettingFormProps = {
  edit: boolean,
  saveState: AAAPolicyType,
  type?: string,
  networkView?: boolean,
  forceDisableRadsec?: boolean
}

export const AAASettingForm = (props: AAASettingFormProps) => {
  const { $t } = useIntl()
  const { edit, saveState, forceDisableRadsec } = props
  const { data: instanceListResult } = useGetAAAPolicyInstanceList({
    queryOptions: {
      refetchOnMountOrArgChange: 30,
      pollingInterval: 30000
    }
  })
  const form = Form.useFormInstance()
  const params = useParams()
  const { useWatch } = Form
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const [enableSecondaryServer, type, tlsEnabled, ocspValidationEnabled]
    = [useWatch('enableSecondaryServer'),
      useWatch('type'),
      useWatch<boolean>(['radSecOptions', 'tlsEnabled']),
      useWatch<boolean>(['radSecOptions', 'ocspValidationEnabled'])]

  const [showCertificateAuthorityDrawer, setShowCertificateAuthorityDrawer] = useState(false)
  const [showCertificateDrawer, setShowCertificateDrawer] = useState(false)
  const [isGenerateClientCert, setIsGenerateClientCert] = useState(true)
  const createdCaId = useRef<string>()
  const createdClientCertId = useRef<string>()
  const createdServerCertId = useRef<string>()

  const defaultPayload = {
    fields: ['name', 'id', 'wifiNetworkIds'],
    pageSize: 100,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const { caRef } = useGetCertificateAuthorityOnRadiusQuery(
    { params }, {
      skip: !edit,
      selectFromResult: ({ data }) => {
        return { caRef: data?.data?.[0]?.id }
      }
    })

  const { clientCertRef } = useGetClientCertificateOnRadiusQuery(
    { params }, {
      skip: !edit,
      selectFromResult: ({ data }) => {
        return { clientCertRef: data?.data?.[0]?.id }
      }
    })

  const { serverCertRef } = useGetServerCertificateOnRadiusQuery(
    { params }, {
      skip: !edit,
      selectFromResult: ({ data }) => {
        return { serverCertRef: data?.data?.[0]?.id }
      }
    })

  const { caSelectOptions } = useGetCertificateAuthoritiesQuery(
    { payload: defaultPayload }, {
      skip: !supportRadsec,
      selectFromResult: ({ data }) => {
        const caOptions = data?.data?.filter(c =>
          saveState?.radSecOptions?.certificateAuthorityId?.includes(c.id) ||
          c.status.includes(CertificateStatusType.VALID))
          ?.map(item => ({ label: item.name, value: item.id })) ?? []
        return { caSelectOptions: caOptions }
      }
    })

  const { clientCertOptions, serverCertOptions, certTotalCount } = useGetCertificateListQuery(
    { payload: defaultPayload },
    {
      skip: !supportRadsec,
      selectFromResult: ({ data }) => {
        const certOptions = data?.data?.filter(c =>
          [saveState?.radSecOptions?.clientCertificateId,
            saveState?.radSecOptions?.serverCertificateId].includes(c.id) ||
          c.status.includes(CertificateStatusType.VALID))?.map(item => ({
          label: item.name,
          value: item.id,
          certStates: item.status,
          certType: item.extendedKeyUsages
        })) ?? []
        const clientCerts = certOptions?.filter(
          c => c.certType?.includes(ExtendedKeyUsages.CLIENT_AUTH))
        const serverCerts = certOptions?.filter(
          c => c.certType?.includes(ExtendedKeyUsages.SERVER_AUTH))
        return {
          clientCertOptions: clientCerts,
          serverCertOptions: serverCerts,
          certTotalCount: data?.totalCount ?? 0 }
      }
    })

  const certificateStatusValidator = (certStates: CertificateStatusType[] | undefined) => {
    if (certStates && !certStates.includes(CertificateStatusType.VALID)) {
      return Promise.reject(<CertificateWarning status={certStates}/>)
    }
    return Promise.resolve()
  }

  const nameValidator = async (value: string) => {
    const policyList = instanceListResult?.data!

    return checkObjectNotExists(policyList.filter(
      policy => edit ? policy.id !== saveState.id : true
    ).map(policy => ({ name: policy.name })), { name: value } ,
    $t(policyTypeLabelMapping[PolicyType.AAA]))
  }

  const radiusIpPortValidator = async (isPrimary: boolean) => {
    const primaryValue =
      `${type}:${form.getFieldValue(['primary', 'ip'])}:${form.getFieldValue(['primary', 'port'])}`
    const secondaryValue =
      // eslint-disable-next-line max-len
      `${type}:${form.getFieldValue(['secondary', 'ip'])}:${form.getFieldValue(['secondary', 'port'])}`
    const value = isPrimary ? primaryValue : secondaryValue
    if (!isPrimary && value === primaryValue) {
      return Promise.reject($t({
        defaultMessage: 'IP address and Port combinations must be unique'
      }))
    }

    let stateValue = ''
    if (saveState && edit) {
      stateValue = isPrimary
        ? `${type}:${saveState.primary!.ip}:${saveState.primary!.port}`
        : `${type}:${saveState.secondary?.ip}:${saveState.secondary?.port}`
    }

    const existingPrimaryIpList = (instanceListResult?.data ?? [])
      .map(policy => `${policy.type}:${policy.primary}`)
    // eslint-disable-next-line max-len
    if (existingPrimaryIpList.filter(primaryIp => edit ? primaryIp !== stateValue : true).includes(value) ) {
      return Promise.reject($t({
        // eslint-disable-next-line max-len
        defaultMessage: 'IP address and Port combinations must be unique, there is an existing combination in the list.'
      }))
    }
    return Promise.resolve()
  }

  const handleTlsEnabledOnChange = (checked: boolean) => {
    if (checked) {
      form.setFieldValue(['primary', 'port'], DEFAULT_RADSEC_PORT)
    } else {
      if (type === 'ACCOUNTING') {
        form.setFieldValue(['primary', 'port'], AUTH_FORBIDDEN_PORT)
      } else {
        form.setFieldValue(['primary', 'port'], ACCT_FORBIDDEN_PORT)
      }
    }
  }

  const handleTypeOnChange = (event: RadioChangeEvent) => {
    if (!tlsEnabled) {
      if(event.target.value==='ACCOUNTING'){
        form.setFieldValue(['primary', 'port'], AUTH_FORBIDDEN_PORT)
        form.setFieldValue(['secondary', 'port'], AUTH_FORBIDDEN_PORT)
      }else{
        form.setFieldValue(['primary', 'port'], ACCT_FORBIDDEN_PORT)
        form.setFieldValue(['secondary', 'port'], ACCT_FORBIDDEN_PORT)
      }
    }
  }

  const handleAddCertificateAuthority = () => {
    setShowCertificateAuthorityDrawer(true)
  }

  const handleAddClientCertificate = () => {
    setIsGenerateClientCert(true)
    setShowCertificateDrawer(true)
  }

  const handleAddServerCertificate = () => {
    setIsGenerateClientCert(false)
    setShowCertificateDrawer(true)
  }

  const handleSaveCertificateAuthority = (id?: string) => {
    if (id) {
      createdCaId.current = id
    }
    setShowCertificateAuthorityDrawer(false)
  }

  const handleSaveClientCertificate = (id?: string) => {
    if (id) {
      createdClientCertId.current = id
    }
    setShowCertificateDrawer(false)
  }

  const handleSaveServerCertificate = (id?: string) => {
    if (id) {
      createdServerCertId.current = id
    }
    setShowCertificateDrawer(false)
  }

  useEffect(() => {
    if (edit && saveState) {
      if(saveState.secondary?.ip){
        form.setFieldValue('enableSecondaryServer', true)
      }
      if (saveState.radSecOptions?.ocspUrl) {
        form.setFieldValue(['radSecOptions', 'ocspValidationEnabled'], true)
        form.setFieldValue(['radSecOptions', 'ocspUrl'],
          saveState.radSecOptions?.ocspUrl?.replace('http://', ''))
      }
      if (saveState.radSecOptions) {
        form.setFieldValue(['radSecOptions', 'certificateAuthorityId'],
          caRef ?? saveState.radSecOptions.certificateAuthorityId ?? null)
        form.setFieldValue(['radSecOptions', 'clientCertificateId'],
          clientCertRef ?? saveState.radSecOptions.clientCertificateId ?? null)
        form.setFieldValue(['radSecOptions', 'serverCertificateId'],
          serverCertRef ?? saveState.radSecOptions.serverCertificateId ?? null)
        form.setFieldValue(['radSecOptions', 'originalCertificateAuthorityId'],
          saveState.radSecOptions.certificateAuthorityId)
        form.setFieldValue(['radSecOptions', 'originalClientCertificateId'],
          saveState.radSecOptions.clientCertificateId)
        form.setFieldValue(['radSecOptions', 'originalServerCertificateId'],
          saveState.radSecOptions.serverCertificateId)
        form.validateFields([
          ['radSecOptions', 'certificateAuthorityId'],
          ['radSecOptions', 'clientCertificateId'],
          ['radSecOptions', 'serverCertificateId']])
      }
    }
  }, [saveState, caRef, clientCertRef, serverCertRef, edit, form])

  useEffect(() => {
    if (createdCaId.current && caSelectOptions.find(ca => ca.value === createdCaId.current)) {
      form.setFieldValue(['radSecOptions', 'certificateAuthorityId'], createdCaId.current)
      createdCaId.current = undefined
    }
  }, [caSelectOptions])

  useEffect(() => {
    if (createdClientCertId.current &&
      clientCertOptions.find(c => c.value === createdClientCertId.current)) {
      form.setFieldValue(['radSecOptions', 'clientCertificateId'], createdClientCertId.current)
      createdClientCertId.current = undefined
    }
  }, [clientCertOptions])

  useEffect(() => {
    if (createdServerCertId.current &&
      serverCertOptions.find(c => c.value === createdServerCertId.current)) {
      form.setFieldValue(['radSecOptions', 'serverCertificateId'], createdServerCertId.current)
      createdServerCertId.current = undefined
    }
  }, [serverCertOptions])

  const ACCT_FORBIDDEN_PORT = 1812
  const AUTH_FORBIDDEN_PORT = 1813
  const DEFAULT_RADSEC_PORT = 2083
  const validateRadiusPort = async (value: number)=>{
    if((value === ACCT_FORBIDDEN_PORT && type === 'ACCOUNTING')||
    (value === AUTH_FORBIDDEN_PORT && type === 'AUTHENTICATION')){
      return Promise.reject(
        $t({ defaultMessage: 'Authentication radius port '+
        'cannot be {authForbiddenPort} and Accounting radius '+
        'port cannot be {acctForbiddenPort} ' },
        { acctForbiddenPort: ACCT_FORBIDDEN_PORT, authForbiddenPort: AUTH_FORBIDDEN_PORT }))
    }
    return Promise.resolve()
  }
  return (
    <GridRow>
      <GridCol col={props.networkView ? { span: 24 } :{ span: 8 }}>
        <StepsFormLegacy.Title>{$t({ defaultMessage: 'Settings' })}</StepsFormLegacy.Title>
        <Form.Item
          name='name'
          label={$t({ defaultMessage: 'Profile Name' })}
          rules={[
            { required: true },
            { min: 2 },
            { max: 32 },
            { validator: (rule, value) => nameValidator(value) },
            { validator: (_, value) => servicePolicyNameRegExp(value) }
          ]}
          validateFirst
          hasFeedback
          initialValue={''}
          children={<Input/>}
          validateTrigger={'onBlur'}
        />
        <Form.Item
          name='type'
          label={$t({ defaultMessage: 'Type' })}
          initialValue={props.type || 'AUTHENTICATION'}
          children={<Radio.Group disabled={props.type? true: false}
            onChange={handleTypeOnChange}>
            <Space direction='vertical'>
              <Radio key='authentication' value={'AUTHENTICATION'}>
                {$t({ defaultMessage: 'Authentication RADIUS Server' })}
              </Radio>
              <Radio key='accounting' value={'ACCOUNTING'}>
                {$t({ defaultMessage: 'Accounting RADIUS Server' })}
              </Radio>
            </Space>
          </Radio.Group>}
        />
        {supportRadsec &&
        <UI.StyledSpace align='center'>
          <UI.FormItemWrapper>
            <Form.Item
              label={<>{$t({ defaultMessage: 'Enable RadSec (over TLS)' })}</>}
            />
          </UI.FormItemWrapper>
          <Form.Item
            name={['radSecOptions', 'tlsEnabled']}
            initialValue={props.saveState.radSecOptions?.tlsEnabled}
            valuePropName='checked'
            children={
              <Switch
                disabled={
                  showCertificateAuthorityDrawer || showCertificateDrawer || !!forceDisableRadsec
                }
                onChange={handleTlsEnabledOnChange}
              />
            }
          />
        </UI.StyledSpace>}
        {tlsEnabled &&
        <UI.RacSecDiv>
          <Form.Item
            name={['radSecOptions', 'cnSanIdentity']}
            label={<>{$t({ defaultMessage: 'SAN Identity' })}
              <Tooltip.Question
                placement='right'
                title={$t(MessageMapping.cn_san_identity_tooltip)}
              />
            </>}
            rules={[
              { required: true },
              { max: 1023 }
            ]}
            initialValue={''}
            children={<Input />}
          />
          <UI.StyledSpace align='center'>
            <UI.FormItemWrapper>
              <Form.Item
                label={$t({ defaultMessage: 'OSCP Validation' })}
              />
            </UI.FormItemWrapper>
            <Form.Item
              name={['radSecOptions', 'ocspValidationEnabled']}
              valuePropName='checked'
              children={
                <Switch checked={ocspValidationEnabled}
                  disabled={showCertificateAuthorityDrawer || showCertificateDrawer}/>
              }
            />
          </UI.StyledSpace>
          {ocspValidationEnabled && <Form.Item
            name={['radSecOptions', 'ocspUrl']}
            label={$t({ defaultMessage: 'OCSP URL' })}
            rules={[
              { required: true },
              { max: 1017 }, // 1024 - 7 ('http://')
              { validator: (_, value) => URLRegExp(value) }
            ]}
            initialValue={''}
            children={<Input addonBefore='http://'/>}
          />}
          <Space>
            <Form.Item
              label={$t({ defaultMessage: 'Trusted Certificate Authority' })}
              name={['radSecOptions', 'certificateAuthorityId']}
              initialValue={saveState.radSecOptions?.certificateAuthorityId ?? null}
              rules={[
                { required: true }
              ]}
              children={
                <Select
                  disabled={!hasAllowedOperations([
                    getOpsApi(CertificateUrls.activateCertificateAuthorityOnRadius),
                    getOpsApi(CertificateUrls.deactivateCertificateAuthorityOnRadius)
                  ])}
                  options={[
                    { label: $t({ defaultMessage: 'Select...' }), value: null },
                    ...caSelectOptions]} />
              } />
            { hasPolicyPermission({
              type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE }) &&
              hasAllowedOperations([
                getOpsApi(CertificateUrls.addCA),
                getOpsApi(CertificateUrls.addSubCA)
              ]) &&
                <Button type='link'
                  disabled={caSelectOptions.length >= CERTIFICATE_AUTHORITY_MAX_COUNT
                    || (showCertificateAuthorityDrawer || showCertificateDrawer)
                  }
                  onClick={handleAddCertificateAuthority}
                  children={$t({ defaultMessage: 'Add CA' })} />}
          </Space>
          <Form.Item
            label={$t({ defaultMessage: 'Client Certificate' })}
            name={['radSecOptions', 'clientCertificateId']}
            initialValue={null}
            rules={[
              { required: false },
              { validator: (_, certId) => {
                const certStates = clientCertOptions.find(cert => cert.value === certId)?.certStates
                return certificateStatusValidator(certStates)
              } }
            ]}
            extra={
              <div>
                { hasPolicyPermission({
                  type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE }) &&
                  hasAllowedOperations([
                    getOpsApi(CertificateUrls.generateClientServerCertificate),
                    getOpsApi(CertificateUrls.uploadCertificate)
                  ]) &&
                <Button type='link'
                  disabled={certTotalCount >= CERTIFICATE_MAX_COUNT
                    || (showCertificateAuthorityDrawer || showCertificateDrawer)}
                  onClick={handleAddClientCertificate}
                  children={$t({ defaultMessage: 'Generate new client certificate' })} />}
              </div>
            }>
            <Select
              disabled={!hasAllowedOperations([
                getOpsApi(CertificateUrls.activateClientCertificateOnRadius),
                getOpsApi(CertificateUrls.deactivateClientCertificateOnRadius)
              ])}
              options={[
                { label: $t({ defaultMessage: 'None' }), value: null },
                ...clientCertOptions
              ]} />
          </Form.Item>
          <Form.Item
            label={
              <>{$t({ defaultMessage: 'Server Certificate' })}
                <Tooltip.Question
                  placement='right'
                  title={$t(MessageMapping.server_certificate_tooltip)}/>
              </>}
            name={['radSecOptions', 'serverCertificateId']}
            initialValue={null}
            rules={[
              { required: false },
              { validator: (_, certId) => {
                const certStates = serverCertOptions.find(cert => cert.value === certId)?.certStates
                return certificateStatusValidator(certStates)
              } }
            ]}
            extra={
              <div>
                { hasPolicyPermission({
                  type: PolicyType.SERVER_CERTIFICATES, oper: PolicyOperation.CREATE }) &&
                  hasAllowedOperations([
                    getOpsApi(CertificateUrls.generateClientServerCertificate),
                    getOpsApi(CertificateUrls.uploadCertificate)
                  ]) &&
                <Button type='link'
                  disabled={certTotalCount >= CERTIFICATE_MAX_COUNT
                    || (showCertificateAuthorityDrawer || showCertificateDrawer)
                  }
                  onClick={handleAddServerCertificate}
                  children={$t({ defaultMessage: 'Generate new server certificate' })} />}
              </div>
            }>
            <Select
              disabled={!hasAllowedOperations([
                getOpsApi(CertificateUrls.activateServerCertificateOnRadius),
                getOpsApi(CertificateUrls.deactivateServerCertificateOnRadius)
              ])}
              options={[
                { label: $t({ defaultMessage: 'None' }), value: null },
                ...serverCertOptions
              ]} />
          </Form.Item>
          <Form.Item
            name={['radSecOptions', 'originalCertificateAuthorityId']}
            children={<Input />}
            hidden={true} />
          <Form.Item
            name={['radSecOptions', 'originalClientCertificateId']}
            children={<Input />}
            hidden={true} />
          <Form.Item
            name={['radSecOptions', 'originalServerCertificateId']}
            children={<Input />}
            hidden={true} />
        </UI.RacSecDiv>
        }
        <Space direction='vertical' size='middle' style={{ display: 'flex' }}>
          <Fieldset label={$t({ defaultMessage: 'Primary Server' })}
            checked={true}
            switchStyle={{ display: 'none' }}
          >
            <div>
              <Form.Item
                name={['primary', 'ip']}
                style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                rules={[
                  { required: true },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(true)
                    return networkWifiIpRegExp(value)
                  } }
                ]}
                label={$t({ defaultMessage: 'IP Address' })}
                initialValue={''}
                children={<Input/>}
              />
              <Form.Item
                name={['primary', 'port']}
                style={{ display: 'inline-block', width: 'calc(43%)' }}
                label={$t({ defaultMessage: 'Port' })}
                rules={[
                  { required: true },
                  { type: 'number', min: 1 },
                  { type: 'number', max: 65535 },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(true)
                    return validateRadiusPort(value)
                  } }
                ]}
                initialValue={type === 'ACCOUNTING'? AUTH_FORBIDDEN_PORT:ACCT_FORBIDDEN_PORT}
                children={<InputNumber min={1} max={65535} />}
              />
            </div>
            {!tlsEnabled && <Form.Item
              name={['primary', 'sharedSecret']}
              label={$t({ defaultMessage: 'Shared Secret' })}
              initialValue={''}
              rules={[
                { required: true },
                { max: 255 },
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<PasswordInput />}
            />}
          </Fieldset>
          {!tlsEnabled && <Form.Item noStyle name='enableSecondaryServer'>
            <Button
              type='link'
              onClick={() => {
                form.setFieldValue('enableSecondaryServer',!enableSecondaryServer)
              }}
            >
              {enableSecondaryServer ? $t({ defaultMessage: 'Remove Secondary Server' }):
                $t({ defaultMessage: 'Add Secondary Server' })}
            </Button>
          </Form.Item>}
          {(enableSecondaryServer && !tlsEnabled) &&
          <Fieldset label={$t({ defaultMessage: 'Secondary Server' })}
            checked={true}
            switchStyle={{ display: 'none' }}
          >
            <div>
              <Form.Item
                name={['secondary', 'ip']}
                style={{ display: 'inline-block', width: 'calc(57%)' , paddingRight: '20px' }}
                rules={[
                  { required: true },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(false)
                    return networkWifiIpRegExp(value)
                  } }
                ]}
                label={$t({ defaultMessage: 'IP Address' })}
                initialValue={''}
                children={<Input/>}
              />
              <Form.Item
                name={['secondary', 'port']}
                style={{ display: 'inline-block', width: 'calc(43%)' }}
                label={$t({ defaultMessage: 'Port' })}
                rules={[
                  { required: true },
                  { type: 'number', min: 1 },
                  { type: 'number', max: 65535 },
                  { validator: async (_, value) => {
                    await radiusIpPortValidator(false)
                    return validateRadiusPort(value)
                  } }
                ]}
                initialValue={type === 'ACCOUNTING'? AUTH_FORBIDDEN_PORT:ACCT_FORBIDDEN_PORT}
                children={<InputNumber min={1} max={65535} />}
              />
            </div>
            <Form.Item
              name={['secondary', 'sharedSecret']}
              label={$t({ defaultMessage: 'Shared Secret' })}
              initialValue={''}
              rules={[
                { required: true },
                { max: 255 },
                { validator: (_, value) => networkWifiSecretRegExp(value) }
              ]}
              children={<PasswordInput />}
            /></Fieldset>}
        </Space>

        <CertificateAuthorityDrawer
          visible={showCertificateAuthorityDrawer}
          setVisible={setShowCertificateAuthorityDrawer}
          handleSave={handleSaveCertificateAuthority}
        />

        <CertificateDrawer
          visible={showCertificateDrawer}
          setVisible={setShowCertificateDrawer}
          handleSave={
            isGenerateClientCert ? handleSaveClientCertificate : handleSaveServerCertificate}
          extendedKeyUsages={isGenerateClientCert ?
            [ExtendedKeyUsages.CLIENT_AUTH] : [ExtendedKeyUsages.SERVER_AUTH]}
        />

      </GridCol>
      <GridCol col={props.networkView ? { span: 0 } :{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
