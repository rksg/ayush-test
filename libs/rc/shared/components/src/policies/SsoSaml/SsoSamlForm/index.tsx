import { Col, Form, FormInstance, Input, Row, Space, Switch } from 'antd'
import { cloneDeep }                                          from 'lodash'
import { useIntl }                                            from 'react-intl'

import { PageHeader, StepsForm, Tooltip } from '@acx-ui/components'
import {
  IdentityProviderProfileFormType,
  LocationExtended,
  PolicyOperation,
  PolicyType,
  SsoSamlMessages,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

interface SsoSamlFormProps {
    title: string
    form: FormInstance
    submitButtonLabel: string
    onFinish: (values: IdentityProviderProfileFormType) => void
    onCancel?: () => void
    isEditMode?: boolean
    isEmbedded?: boolean
  }

export const SsoSamlForm = (props: SsoSamlFormProps) => {
  const { $t } = useIntl()
  const {
    title,
    form: formRef,
    submitButtonLabel,
    onFinish,
    onCancel,
    // isEditMode = false,
    isEmbedded = false
  } = props

  const tablePath = getPolicyRoutePath({
    type: PolicyType.SSO_SAML,
    oper: PolicyOperation.LIST
  })
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const linkToTableView = useTenantLink(tablePath)

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
              text: $t({ defaultMessage: 'SSO/SAML' }),
              link: '/policies/portProfile/wifi'
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
            <Col span={12}>
              <StepsForm.FieldLabel
                width={'280px'}
              >
                {$t({ defaultMessage: 'Profile Name' })}
              </StepsForm.FieldLabel>
              <Form.Item
                name='name'
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
              <StepsForm.FieldLabel width='280px'>
                <Space>
                  {$t({ defaultMessage: 'Identity Provider (IdP) Metadata' })}
                  <Tooltip.Question
                    // eslint-disable-next-line max-len
                    title={$t(SsoSamlMessages.METADATA_TEXTAREA) + '\n' + $t({ defaultMessage: 'Note: Importing metadata from a file will overwrite any existing configuration.' })}
                    placement='bottom'
                    iconStyle={{ width: 16, height: 16 }}
                  />
                </Space>
              </StepsForm.FieldLabel>
              <Form.Item
                name='metadata'
                // label={$t({ defaultMessage: 'Identity Provider (IdP) Metadata' })}
                style={{ width: '300px' }}
                rules={[
                  { max: 180 }
                ]}
              >
                <Input.TextArea rows={4} />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <StepsForm.FieldLabel width={'280px'}>
                <Space>
                  {$t({ defaultMessage: 'Require SAML requests to be signed' })}
                  <Tooltip.Question
                    title={$t(SsoSamlMessages.AUTHN_REQUEST_TOGGLE)}
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
                    title={$t(SsoSamlMessages.RESPONSE_ENCRYPTION_TOGGLE)}
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
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export const requestPreProcess = (data: IdentityProviderProfileFormType) => {
  const { ...result } = cloneDeep(data)
  //   result.authType = (authEnabled) ?
  //     (authTypeRole ?? EthernetPortAuthType.DISABLED) : EthernetPortAuthType.DISABLED

  return result
}