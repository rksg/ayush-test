import { useState } from 'react'

import { Buffer } from 'buffer'

import { Col, Form, FormInstance, Input, Row, Space, Switch } from 'antd'
import { useWatch }                                           from 'antd/lib/form/Form'
import { cloneDeep }                                          from 'lodash'
import { useIntl }                                            from 'react-intl'

import { Button, PageHeader, Select, StepsForm, Tooltip } from '@acx-ui/components'
import { useGetServerCertificatesQuery }                  from '@acx-ui/rc/services'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  SamlIdpProfileFormType,
  SamlIdpMessages,
  getPolicyRoutePath,
  redirectPreviousPage,
  usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../../ImportFileDrawer'
import CertificateDrawer                                   from '../../CertificateUtil/CertificateDrawer'

interface SamlIdpFormProps {
    title: string
    form: FormInstance
    submitButtonLabel: string
    onFinish: (values: SamlIdpProfileFormType) => void
    onCancel?: () => void
    isEditMode?: boolean
    isEmbedded?: boolean
  }

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

  const { serverCertificateOptions } =
  useGetServerCertificatesQuery(
    { payload: { pageSize: 1000, page: 1 } },
    {
      selectFromResult ({ data }) {
        return {
          serverCertificateOptions: data?.data?.map(
            item => ({ label: item.name, value: item.id })
          ) ?? []
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
            <Col span={12}>
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
                <Input />
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
                    // eslint-disable-next-line max-len
                      title={$t(SamlIdpMessages.METADATA_TEXTAREA) + '\n' + $t({ defaultMessage: 'Note: Importing metadata from a file will overwrite any existing configuration.' })}
                      placement='bottom'
                      iconStyle={{ width: 16, height: 16 }}
                    />
                  </Space>
                  <Space>
                    <Button
                      data-testid='import-xml-button'
                      type='link'
                      onClick={() => {setUploadXmlDrawerVisible(true)}}
                    >
                      {$t({ defaultMessage: 'Import via XML' })}
                    </Button>
                    |
                    <Button
                      type='link'
                      onClick={() => formRef.setFieldsValue({ metadataContent: '' })}
                    >
                      {$t({ defaultMessage: 'Clear' })}
                    </Button>
                  </Space>
                </Space>
              </StepsForm.FieldLabel>
              <Form.Item
                name='metadataContent'
                style={{ width: '400px' }}
                rules={[
                  { required: true }
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
                maxSize={CsvSize['5MB']}
                maxEntries={1024}
                importRequest={handleImportRequest}
                formDataName={'unitImports'}
                onClose={() => setUploadXmlDrawerVisible(false)}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
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
                  required
                >
                  <Select
                    options={serverCertificateOptions}
                  />
                </Form.Item>
                <Button type='link' onClick={()=>setSigningCertFormVisible(true)}>
                  {$t({ defaultMessage: 'Generate a signing certificate' })}
                </Button>
              </>
              }
            </Col>
          </Row>
          <Row>
            <Col span={12}>
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
                  required
                >
                  <Select
                    options={serverCertificateOptions}
                  />
                </Form.Item>
                <Button type='link' onClick={()=>setEncryptCertFormVisible(true)}>
                  {$t({ defaultMessage: 'Generate an encryption certificate' })}
                </Button>
              </>
              }
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
      <CertificateDrawer
        visible={encryptCertFormVisible}
        setVisible={setEncryptCertFormVisible}
        handleSave={handleEncryptCertificateSave}
        width={1000}
      />
      <CertificateDrawer
        visible={signingCertFormVisible}
        setVisible={setSigningCertFormVisible}
        handleSave={handleSigningCertificateSave}
        width={1000}
      />
    </>
  )
}

export const requestPreProcess = (data: SamlIdpProfileFormType) => {
  const { ...result } = cloneDeep(data)

  // Convert metadata to base64 format
  result.metadata = Buffer.from(result.metadataContent?? '').toString('base64')
  delete result.metadataContent

  return result
}