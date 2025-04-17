import { useState } from 'react'

import { Buffer } from 'buffer'

import { Col, Form, FormInstance, Input, Row, Space, Switch } from 'antd'
import { useWatch }                                           from 'antd/lib/form/Form'
import { cloneDeep }                                          from 'lodash'
import { useIntl }                                            from 'react-intl'

import { Button, cssStr, PageHeader, Select, StepsForm, Tooltip } from '@acx-ui/components'
import { DeleteOutlined }                                         from '@acx-ui/icons'
import { useGetServerCertificatesQuery }                          from '@acx-ui/rc/services'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileFormType,
  SamlIdpMessages,
  getPolicyRoutePath,
  redirectPreviousPage,
  usePolicyListBreadcrumb,
  KeyUsages,
  ServerCertificate,
  KeyUsageType,
  HttpURLRegExp,
  getSamlIdpAttributeMappingNameTypeOptions,
  SamlIdpAttributeMappingNameType,
  AttributeMapping
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../../ImportFileDrawer'
import CertificateDrawer                                   from '../../CertificateUtil/CertificateDrawer'

import { Description } from './styledComponents'

interface SamlIdpFormProps {
    title: string
    form: FormInstance
    submitButtonLabel: string
    onFinish: (values: SamlIdpProfileFormType) => void
    onCancel?: () => void
    isEditMode?: boolean
    isEmbedded?: boolean
  }

export const excludedAttributeTypes = [
  SamlIdpAttributeMappingNameType.DISPLAY_NAME,
  SamlIdpAttributeMappingNameType.EMAIL,
  SamlIdpAttributeMappingNameType.PHONE_NUMBER
]

export const SamlIdpForm = (props: SamlIdpFormProps) => {
  const { $t } = useIntl()
  const {
    title,
    form: formRef,
    submitButtonLabel,
    onFinish,
    onCancel,
    isEmbedded = false
  } = props

  const tablePath = getPolicyRoutePath({
    type: PolicyType.SAML_IDP,
    oper: PolicyOperation.LIST
  })
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const linkToTableView = useTenantLink(tablePath)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SAML_IDP)

  const [encryptCertFormVisible, setEncryptCertFormVisible] = useState(false)
  const [signingCertFormVisible, setSigningCertFormVisible] = useState(false)

  const isSigningCertificateEnabled = useWatch('signingCertificateEnabled', formRef)
  const isEncryptionCertificateEnabled = useWatch('encryptionCertificateEnabled', formRef)
  const [uploadXmlDrawerVisible, setUploadXmlDrawerVisible ] = useState(false)
  const attributeMappings = useWatch('attributeMappings', formRef)

  const fieldColSpan = isEmbedded ? 20 : 12

  const maxMappingCount =
    getSamlIdpAttributeMappingNameTypeOptions().length - excludedAttributeTypes.length // TODO: 3 for testing, should be 64 for production

  const { encryptionCertificateOptions, signingCertificateOptions } =
    useGetServerCertificatesQuery(
      { payload: { pageSize: 1000, page: 1 } },
      {
        selectFromResult ({ data }) {
          return {
            encryptionCertificateOptions: data?.data
              ?.filter((item: ServerCertificate) =>
                item.keyUsages && item.keyUsages.includes(KeyUsageType.KEY_ENCIPHERMENT)
              )
              .map((item: ServerCertificate) => ({
                label: item.name,
                value: item.id
              })) ?? [],
            signingCertificateOptions: data?.data
              ?.filter((item: ServerCertificate) =>
                item.keyUsages && item.keyUsages.includes(KeyUsageType.DIGITAL_SIGNATURE)
              )
              .map((item: ServerCertificate) => ({
                label: item.name,
                value: item.id
              })) ?? []
          }
        }
      }
    )

  const handleFinish = async () => {
    try{
      await onFinish(formRef.getFieldsValue())
    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }

    handleCancel()
  }

  const handleCancel = () => {
    (onCancel)?
      onCancel() :
      redirectPreviousPage(navigate, previousPath, linkToTableView)
  }

  const handleImportRequest = (formData: FormData, values: object, content?: string)=> {
    formRef.setFieldsValue({ metadataContent: content })
    setUploadXmlDrawerVisible(false)
  }

  const handleEncryptCertificateSave = (createdCertId?:string) => {
    formRef.setFieldsValue({ encryptionCertificateId: createdCertId })
    setEncryptCertFormVisible(false)
  }

  const handleSigningCertificateSave = (createdCertId?:string) => {
    formRef.setFieldsValue({ signingCertificateId: createdCertId })
    setSigningCertFormVisible(false)
  }

  return (
    <>
      {!isEmbedded &&
        <PageHeader
          title={title}
          breadcrumb={breadcrumb}
        />
      }
      <StepsForm
        form={formRef}
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: submitButtonLabel }}
      >
        <StepsForm.StepForm>
          <Row>
            <Col span={fieldColSpan}>
              <Form.Item
                name='name'
                label={$t({ defaultMessage: 'Profile Name' })}
                rules={[
                  { required: true },
                  { min: 2 },
                  { max: 32 }
                ]}
                validateFirst
              >
                <Input
                  data-testid='saml-profile-name-input'
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <StepsForm.FieldLabel width='400px' className='required'>
                <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Space>
                    {$t({ defaultMessage: 'Identity Provider (IdP) Metadata' })}
                    <Tooltip.Question
                      title={
                        $t(SamlIdpMessages.METADATA_TEXTAREA) +
                        '\n' +
                        $t(SamlIdpMessages.METADATA_TEXTAREA_NOTE)
                      }
                      placement='bottom'
                      iconStyle={{ width: 16, height: 16 }}
                    />
                  </Space>
                  <Space>
                    <Button
                      data-testid='import-xml-button'
                      type='link'
                      style={{ fontSize: cssStr('--acx-body-4-font-size') }}
                      children={$t({ defaultMessage: 'Import via XML' })}
                      onClick={() => {setUploadXmlDrawerVisible(true)}}
                    />
                    |
                    <Button
                      type='link'
                      style={{ fontSize: cssStr('--acx-body-4-font-size') }}
                      children={$t({ defaultMessage: 'Clear' })}
                      onClick={() => formRef.setFieldsValue({ metadataContent: '' })}
                    />
                  </Space>
                </Space>
              </StepsForm.FieldLabel>
              <Form.Item
                name='metadataContent'
                style={{ width: '400px' }}
                rules={[
                  {
                    required: true,
                    message: $t({ defaultMessage: 'Please enter SAML metadata URL or XML content' })
                  },
                  { validator: async (_, value) => {
                    if (!value) return Promise.resolve()

                    // Check if it's a URL using HttpURLRegExp
                    try {
                      await HttpURLRegExp(value)
                      return Promise.resolve()
                    } catch {
                      // If not a URL, check if it's valid XML
                      try {
                        const parser = new DOMParser()
                        const doc = parser.parseFromString(value, 'text/xml')
                        const errors = doc.getElementsByTagName('parsererror')
                        if (errors.length > 0) {
                          return Promise.reject(
                            $t({ defaultMessage: 'Please enter a valid URL or SAML XML metadata' })
                          )
                        }
                        return Promise.resolve()
                      } catch {
                        return Promise.reject(
                          $t({ defaultMessage: 'Please enter a valid URL or SAML XML metadata' })
                        )
                      }
                    }
                  }
                  }
                ]}
              >
                <Input.TextArea
                  // eslint-disable-next-line max-len
                  placeholder={$t({ defaultMessage: 'Import metadata from an XML file, or manually enter a metadata URL or codes here from your identity provider. Importing will overwrite any existing information.' })}
                  rows={10}
                  data-testid='metadata-textarea' />
              </Form.Item>
              <ImportFileDrawer
                title={$t({ defaultMessage: 'Import via XML' })}
                visible={uploadXmlDrawerVisible}
                readAsText={true}
                type={ImportFileDrawerType.DPSK}
                acceptType={['xml']}
                maxSize={CsvSize['512KB']}
                importRequest={handleImportRequest}
                formDataName={'unitImports'}
                onClose={() => setUploadXmlDrawerVisible(false)}
              />
            </Col>
          </Row>
          <Row>
            <Col span={fieldColSpan}>
              <StepsForm.FieldLabel width={'280px'}>
                <Space>
                  {$t({ defaultMessage: 'Enable SAML Request Signature' })}
                  <Tooltip.Question
                    title={$t(SamlIdpMessages.SAML_REQUEST_SIGNATURE_TOGGLE)}
                    placement='bottom'
                    iconStyle={{ width: 16, height: 16 }}
                  />
                </Space>
                <Form.Item
                  name='signingCertificateEnabled'
                  valuePropName={'checked'}
                >
                  <Switch />
                </Form.Item>
              </StepsForm.FieldLabel>
              {isSigningCertificateEnabled &&
              <>
                <Form.Item
                  name='signingCertificateId'
                  label={<>
                    {$t({ defaultMessage: 'Select Signing Certificate' })}
                  </>
                  }
                  style={{ marginBottom: '8px' }}
                  children={
                    <Select
                      options={signingCertificateOptions}
                    />
                  }
                  required
                />
                <Button
                  type='link'
                  style={{ fontSize: cssStr('--acx-body-4-font-size'), marginBottom: '24px' }}
                  children={$t({ defaultMessage: 'Generate a signing certificate' })}
                  onClick={()=>setSigningCertFormVisible(true)}
                />
              </>
              }
            </Col>
          </Row>
          <Row>
            <Col span={fieldColSpan}>
              <StepsForm.FieldLabel width={'280px'}>
                <Space >
                  {$t({ defaultMessage: 'Enable SAML Response Encryption' })}
                  <Tooltip.Question
                    title={$t(SamlIdpMessages.SAML_RESPONSE_ENCRYPTION_TOGGLE)}
                    placement='bottom'
                    iconStyle={{ width: 16, height: 16 }}
                  />
                </Space>
                <Form.Item
                  name='encryptionCertificateEnabled'
                  valuePropName={'checked'}
                >
                  <Switch />
                </Form.Item>
              </StepsForm.FieldLabel>
              {isEncryptionCertificateEnabled &&
              <>
                <Form.Item
                  name='encryptionCertificateId'
                  label={<>
                    {$t({ defaultMessage: 'Select Encryption Certificate' })}
                  </>
                  }
                  style={{ marginBottom: '8px' }}
                  children={<Select
                    options={encryptionCertificateOptions}
                  />}
                  required
                />
                <Button
                  type='link'
                  style={{ fontSize: cssStr('--acx-body-4-font-size'), marginBottom: '24px' }}
                  children={$t({ defaultMessage: 'Generate an encryption certificate' })}
                  onClick={()=>setEncryptCertFormVisible(true)}
                />
              </>
              }
            </Col>
          </Row>
          <Row>
            <Col span={fieldColSpan}>
              <StepsForm.FieldLabel width={'280px'}>
                {$t({ defaultMessage: 'Identity Attributes & Claims Mapping' })}
              </StepsForm.FieldLabel>

              <Description>
                {$t({ defaultMessage: 'Map user attributes from your IdP to identity attributes'+
                    ' in RUCKUS One using the exact values from your IdP.'+
                    ' Claim names are available in your IdP console.' })}
              </Description>

              <Form.Item
                name='identityName'
                label={
                  <>
                    {$t({ defaultMessage: 'Identity Name' })}
                    <Tooltip.Question
                      title={$t(SamlIdpMessages.IDENTITY_NAME)}
                      placement='bottom'
                      iconStyle={{ width: 16, height: 16 }}
                    />
                  </>
                }
                initialValue={$t({ defaultMessage: 'displayName' })}
                rules={[{ max: 256 }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='identityEmail'
                label={$t({ defaultMessage: 'Identity Email' })}
                initialValue={$t({ defaultMessage: 'email' })}
                rules={[{ max: 256 }]}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name='identityPhone'
                label={$t({ defaultMessage: 'Identity Phone' })}
                initialValue={$t({ defaultMessage: 'phone' })}
                rules={[{ max: 256 }]}
              >
                <Input />
              </Form.Item>

              <Form.List
                name='attributeMappings'
              >
                {
                  (fields, { add, remove }) => (
                    <Row gutter={[16, 20]}>
                      {
                        fields.map((field, index) => (
                          <Col key={`attribute-mapping-${field.key}`} span={24}>
                            <Space style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <StepsForm.FieldLabel width='280px'>
                                {$t(
                                  { defaultMessage: 'Identity Attribute {number}' },
                                  { number: index + 1 }
                                )}
                              </StepsForm.FieldLabel>
                              <Button
                                type='link'
                                onClick={() => remove(index)}
                                icon={<DeleteOutlined />}
                              />
                            </Space>
                            <Form.Item
                              name={[index, 'name']}
                              label={$t({ defaultMessage: 'Attribute Type' })}
                              rules={[{ required: true }]}
                            >
                              <Select
                                options={
                                  getSamlIdpAttributeMappingNameTypeOptions()
                                    .filter(option => {
                                      const value = option.value as SamlIdpAttributeMappingNameType

                                      if (excludedAttributeTypes.includes(value)) return false

                                      const selectedTypes = attributeMappings
                                        ?.map((mapping: AttributeMapping, i: number) => {
                                          // Skip current row
                                          if (i === index) return null
                                          return mapping?.name
                                        })
                                        .filter(Boolean) ?? []
                                      return !selectedTypes.includes(value)
                                    })
                                }
                              />
                            </Form.Item>
                            <Form.Item
                              {...field}
                              name={[index, 'mappedByName']}
                              label={$t({ defaultMessage: 'Claim Name' })}
                              rules={[{ required: true }]}
                            >
                              <Input />
                            </Form.Item>
                          </Col>
                        ))
                      }
                      <Col span={24}>
                        {fields.length < maxMappingCount &&
                          <Button
                            type='link'
                            style={{ fontSize: cssStr('--acx-body-4-font-size') }}
                            onClick={() => add()}
                            children={$t({ defaultMessage: 'Add custom field' })}
                          />
                        }
                      </Col>
                    </Row>
                  )
                }
              </Form.List>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
      <CertificateDrawer
        visible={encryptCertFormVisible}
        setVisible={setEncryptCertFormVisible}
        handleSave={handleEncryptCertificateSave}
        width={1000}
        keyUsages={[KeyUsages.KEY_ENCIPHERMENT]}
      />
      <CertificateDrawer
        visible={signingCertFormVisible}
        setVisible={setSigningCertFormVisible}
        handleSave={handleSigningCertificateSave}
        width={1000}
        keyUsages={[KeyUsages.DIGITAL_SIGNATURE]}
      />
    </>
  )
}

export const requestPreProcess = (data: SamlIdpProfileFormType) => {
  const { ...result } = cloneDeep(data)

  // Check if metadataContent is a URL
  const urlPattern = /^https?:\/\/.+/i
  if (urlPattern.test(result.metadataContent ?? '')) {
    result.metadataUrl = result.metadataContent ?? ''
    result.metadataContent = ''
  } else {
    // Convert metadata to base64 format
    const content = result.metadataContent?.trim() ?? ''
    result.metadata = Buffer.from(content).toString('base64')
  }
  delete result.metadataContent

  //Add three identity attributes to attributeMappings
  const identityMappings = [
    { name: SamlIdpAttributeMappingNameType.DISPLAY_NAME, mappedByName: result.identityName ?? '' },
    { name: SamlIdpAttributeMappingNameType.EMAIL, mappedByName: result.identityEmail ?? '' },
    { name: SamlIdpAttributeMappingNameType.PHONE_NUMBER, mappedByName: result.identityPhone ?? '' }
  ]
  result.attributeMappings = [...(result.attributeMappings ?? []), ...identityMappings]
  delete result.identityName
  delete result.identityEmail
  delete result.identityPhone

  return result
}
