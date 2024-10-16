import { useEffect, useState } from 'react'

import { Form, Input, InputNumber, Radio, RadioChangeEvent, Space, Switch } from 'antd'
import { useIntl }                                                          from 'react-intl'

import { Button, Fieldset, GridCol, GridRow, StepsFormLegacy, PasswordInput, Tooltip, Select } from '@acx-ui/components'
import { Features, useIsSplitOn }                                                              from '@acx-ui/feature-toggle'
import { useGetCertificateAuthoritiesQuery, useGetCertificateListQuery }                       from '@acx-ui/rc/services'
import {
  AAAPolicyType, checkObjectNotExists, servicePolicyNameRegExp,
  networkWifiIpRegExp, networkWifiSecretRegExp,
  policyTypeLabelMapping, PolicyType,
  URLRegExp,
  useConfigTemplate,
  hasPolicyPermission,
  PolicyOperation,
  CertificateStatusType
} from '@acx-ui/rc/utils'
import { useParams } from '@acx-ui/react-router-dom'

import { CERTIFICATE_AUTHORITY_MAX_COUNT, CERTIFICATE_MAX_COUNT } from '../CertificateTemplate'

import { useGetAAAPolicyInstanceList } from './aaaPolicyQuerySwitcher'
import CertificateAuthorityDrawer      from './CertificateAuthorityDrawer'
import CertificateDrawer               from './CertificateDrawer'
import { MessageMapping }              from './messageMapping'
import * as UI                         from './styledComponents'




type AAASettingFormProps = {
  edit: boolean,
  saveState: AAAPolicyType,
  type?: string,
  tlsEnabled?: boolean,
  networkView?: boolean
}

export const AAASettingForm = (props: AAASettingFormProps) => {
  const { $t } = useIntl()
  const { edit, saveState } = props
  const { data: instanceListResult } = useGetAAAPolicyInstanceList({
    queryOptions: {
      refetchOnMountOrArgChange: 30,
      pollingInterval: 30000
    }
  })
  const params = useParams()
  const { radiusId } = params
  const form = Form.useFormInstance()
  const { useWatch } = Form
  const isRadsecFeatureEnabled = useIsSplitOn(Features.WIFI_RADSEC_TOGGLE)
  const { isTemplate } = useConfigTemplate()
  const supportRadsec = isRadsecFeatureEnabled && !isTemplate
  const [enableSecondaryServer, type ] = [useWatch('enableSecondaryServer'), useWatch('type')]
  // eslint-disable-next-line max-len
  const [tlsEnabled, ocspValidationEnabled ] = [useWatch<boolean>(['radSecOptions', 'tlsEnabled']), useWatch<boolean>(['radSecOptions', 'ocspValidationEnabled'])]

  const [showCertificateAuthorityDrawer, setShowCertificateAuthorityDrawer] = useState(false)
  const [showCertificateDrawer, setShowCertificateDrawer] = useState(false)

  // TODO handle certificate expired
  // const certificateWarningMessage =
  //   $t({ defaultMessage: 'This certificate has expired. Please go to Server & Client Certificates to renew it.' })

  const defaultPayload = {
    fields: ['name', 'id', 'wifiNetworkIds'],
    pageSize: 100,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  // TODO : item.radiusIds
  const { caSelectOptions, selectedCaId } = useGetCertificateAuthoritiesQuery(
    { payload: defaultPayload }, {
      selectFromResult: ({ data }) => {
        // const d = edit ? data?.data
        //   : data?.data.filter(item => item.status?.includes(CertificateStatusType.VALID))
        const d = data?.data
        const caOptions = d?.map(item => ({ label: item.name, value: item.id })) ?? []
        const selectedCa = radiusId && d?.filter(item => item.id
          ?.includes(radiusId)).map(item => item.id)?.at(0)
        return { caSelectOptions: caOptions, selectedCaId: selectedCa }
      }
    })

  // const { certificateSelectOptions, selectedCertificateId } = useGetCertificateListQuery(
  // TODO 1. should return radius ID on CertificateListQuery
  // TODO 1.1 in addition, how to identity radius ID which is bind to client or server cert?
  // TODO 3. Generate Certificate: if a certificate is generated from here, the Client or Server auth option in Extended key usage area should be forced to ‘enabled’,
  //         depending on which selector user generates, “Certificate with Client Auth Key” or “Certificate with Server Auth Key”.
  //         so that user can select it from the dropdown list then
  const { clientCertSelectOptions, selectedClientCertId } = useGetCertificateListQuery(
    { payload: defaultPayload }, {
      selectFromResult: ({ data }) => {
        const d = edit ? data?.data
          : data?.data.filter(item => item.status?.includes(CertificateStatusType.VALID))
        const clientCertOptions = d?.map(item => ({ label: item.name, value: item.id })) ?? []
        const selectedClientCert = radiusId && d?.filter(item => item.name
          ?.includes(radiusId)).map(item => item.id)?.at(0)
        return { clientCertSelectOptions: clientCertOptions,
          selectedClientCertId: selectedClientCert }
      }
    })

  const nameValidator = async (value: string) => {
    const policyList = instanceListResult?.data!

    return checkObjectNotExists(policyList.filter(
      policy => edit ? policy.id !== saveState.id : true
    ).map(policy => ({ name: policy.name })), { name: value } ,
    $t(policyTypeLabelMapping[PolicyType.AAA]))
  }

  const radiusIpPortValidator = async (isPrimary: boolean) => {
    const primaryValue =
      `${form.getFieldValue(['primary', 'ip'])}:${form.getFieldValue(['primary', 'port'])}`
    const secondaryValue =
      `${form.getFieldValue(['secondary', 'ip'])}:${form.getFieldValue(['secondary', 'port'])}`
    const value = isPrimary ? primaryValue : secondaryValue
    if (!isPrimary && value === primaryValue) {
      return Promise.reject($t({
        defaultMessage: 'IP address and Port combinations must be unique'
      }))
    }

    let stateValue = ''
    if (saveState && edit) {
      stateValue = isPrimary
        ? `${saveState.primary!.ip}:${saveState.primary!.port}`
        : `${saveState.secondary?.ip}:${saveState.secondary?.port}`
    }

    const existingPrimaryIpList = (instanceListResult?.data ?? []).map(policy => policy.primary)
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
      form.setFieldValue(['primary', 'port'], 2083)
    } else {
      if (type === 'ACCOUNTING') {
        form.setFieldValue(['primary', 'port'], 1812)
      } else {
        form.setFieldValue(['primary', 'port'], 1813)
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

  const handleSaveCertificateAuthority = (id?: string) => {
    if (id) {
      form.setFieldValue('certificateAuthorityId', id)
      form.validateFields()
    }
    setShowCertificateAuthorityDrawer(false)
  }

  const handleAddClientCertificate = () => {
    setShowCertificateDrawer(true)
  }

  const handleSaveClientCertificate = (id?: string) => {
    if (id) {
      form.setFieldValue('clientCertificateId', id)
      form.validateFields()
    }
    setShowCertificateDrawer(false)
  }

  // TODO handle certificate expired
  // const isValidCert = (options: any, certId: any) => {
  //   return clientCertSelectOptions.find(option => selectedClientCertId === option.value)?.status
  // }

  useEffect(() => {
    form.setFieldValue('certificateAuthorityId', selectedCaId)
  }, [selectedCaId])

  useEffect(() => {
    form.setFieldValue('clientCertificateId', selectedClientCertId)
  }, [selectedClientCertId])


  useEffect(() => {
    if (edit && saveState) {
      if(saveState.secondary?.ip){
        form.setFieldValue('enableSecondaryServer', true)
      }
    }
  }, [saveState])

  const ACCT_FORBIDDEN_PORT = 1812
  const AUTH_FORBIDDEN_PORT = 1813
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
            valuePropName='checked'
            children={<Switch
              disabled={props.tlsEnabled? true: false}
              onChange={handleTlsEnabledOnChange} />}
          />
        </UI.StyledSpace>}
        {tlsEnabled &&
        <UI.RacSecDiv>
          <Form.Item
            name={['radSecOptions', 'cnSanIdentity']}
            label={<>{$t({ defaultMessage: 'CN/SAN Identity' })}
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
            />
          </UI.StyledSpace>
          {ocspValidationEnabled && <Form.Item
            name={['radSecOptions', 'ocspUrl']}
            label={$t({ defaultMessage: 'OCSP URL' })}
            rules={[
              { required: true },
              { max: 1024 },
              { validator: (_, value) => URLRegExp(value) }
            ]}
            initialValue={''}
            children={<Input />}
          />}
          <Space>
            <Form.Item
              label={$t({ defaultMessage: 'Trusted Certificate Authority' })}
              name={['radSecOptions', 'certificateAuthorityId']}
              rules={[
                { required: true,
                  message: $t({ defaultMessage: 'Select...' })
                }
              ]}>
              <Select
                style={{ width: '280px' }}
                options={caSelectOptions} />
            </Form.Item>
            { hasPolicyPermission({
              type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE }) &&
          <Button type='link'
            disabled={caSelectOptions.length >= CERTIFICATE_AUTHORITY_MAX_COUNT}
            onClick={handleAddCertificateAuthority}
            children={$t({ defaultMessage: 'Add' })} />
            }
          </Space>
          {/* <Space> */}
          <Form.Item
            label={$t({ defaultMessage: 'Certificate with Client Auth Key' })}
            name={['radSecOptions', 'clientCertificateId']}
            initialValue={null}
            rules={[
              // { required: false,
              //   message: $t({ defaultMessage: 'Select Certificate...' })
              // }
            ]}>
            <Select
              style={{ width: '280px' }}
              options={[
                { label: $t({ defaultMessage: 'None' }), value: null },
                ...clientCertSelectOptions
              ]} />
          </Form.Item>
          {/* </Space> */}
          {/* <label>{
            // TODO handle certificate expired
            // clientCertSelectOptions.find(option => selectedClientCertId === option.value)?.status !== CertificareStatusEnum.VALID
            (isValidCert(clientCertSelectOptions, selectedClientCertId) === CertificateStatusType.REVOKED ||
              isValidCert(clientCertSelectOptions, selectedClientCertId) === CertificateStatusType.EXPIRED)
            && certificateWarningMessage}</label> */}
          {/* <Space> */}
          <Button type='link'
            disabled={clientCertSelectOptions.length >= CERTIFICATE_MAX_COUNT} // TODO
            onClick={handleAddClientCertificate}
            children={$t({ defaultMessage: 'Generate New Certificate' })} />
          {/* </Space> */}
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
          handleSave={handleSaveClientCertificate}
        />

      </GridCol>
      <GridCol col={props.networkView ? { span: 0 } :{ span: 14 }}>
      </GridCol>
    </GridRow>
  )
}
