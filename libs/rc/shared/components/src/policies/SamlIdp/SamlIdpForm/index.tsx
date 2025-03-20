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
  getPolicyListRoutePath,
  getPolicyRoutePath,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../../../ImportFileDrawer'
import CertificateDrawer                                   from '../../CertificateTemplate/Certificate/CertificateDrawer'

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
  const [certFormVisible, setCertFormVisible] = useState(false)
  const isResponseEncryptionEnabled = useWatch('responseEncryptionEnabled', formRef)
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
    formRef.setFieldsValue({ metadata: content })
    setUploadXmlDrawerVisible(false)
  }

  const handleCertificateSave = (createdCertId?:string) => {
    formRef.setFieldsValue({ encryptionCertificateId: createdCertId })
    setCertFormVisible(false)
  }

  return (
    <>
      {!isEmbedded &&
        <PageHeader
          title={title}
          breadcrumb={[
            { text: $t({ defaultMessage: 'Network Control' }) },
            {
              text: $t({ defaultMessage: 'Policies & Profiles' }),
              link: getPolicyListRoutePath(true)
            },
            {
              text: $t({ defaultMessage: 'Identity Provider' }),
              link: tablePath
            }
          ]}
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
            <Col span={isEmbedded ? 20: 12}>
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
                      onClick={() => formRef.setFieldsValue({ metadata: '' })}
                    >
                      {$t({ defaultMessage: 'Clear' })}
                    </Button>
                  </Space>
                </Space>
              </StepsForm.FieldLabel>
              <Form.Item
                name='metadata'
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
                  {$t({ defaultMessage: 'Require SAML requests to be signed' })}
                  <Tooltip.Question
                    title={$t(SamlIdpMessages.AUTHN_REQUEST_TOGGLE)}
                    placement='bottom'
                    iconStyle={{ width: 16, height: 16 }}
                  />
                </Space>
                <Form.Item
                  name='authnRequestSignedEnabled'
                  valuePropName={'checked'}
                >
                  <Switch />
                </Form.Item>
              </StepsForm.FieldLabel>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <StepsForm.FieldLabel width={'280px'}>
                <Space >
                  {$t({ defaultMessage: 'Enable SAML Response Encryption' })}
                  <Tooltip.Question
                    title={$t(SamlIdpMessages.RESPONSE_ENCRYPTION_TOGGLE)}
                    placement='bottom'
                    iconStyle={{ width: 16, height: 16 }}
                  />
                </Space>
                <Form.Item
                  name='responseEncryptionEnabled'
                  valuePropName={'checked'}
                >
                  <Switch />
                </Form.Item>
              </StepsForm.FieldLabel>
              {isResponseEncryptionEnabled &&
              <>
                <Form.Item
                  name='encryptionCertificateId'
                  label={<>
                    {$t({ defaultMessage: 'Server Certificate' })}
                  </>
                  }
                  required
                >
                  <Select
                    options={serverCertificateOptions}
                    placeholder={$t({ defaultMessage: 'Select ...' })}
                  />
                </Form.Item>
                <Button type='link' onClick={()=>setCertFormVisible(true)}>
                  {$t({ defaultMessage: 'Generate a server certificate' })}
                </Button>
                <CertificateDrawer
                  visible={certFormVisible}
                  setVisible={setCertFormVisible}
                  handleSave={handleCertificateSave}
                  width={1000}
                />
              </>
              }
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export const requestPreProcess = (data: SamlIdpProfileFormType) => {
  const { ...result } = cloneDeep(data)

  // Convert metadata to base64 format
  result.metadata = Buffer.from(result.metadata).toString('base64')

  return result
}
