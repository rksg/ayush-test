import { Form, Radio, Space } from 'antd'
import { useWatch }           from 'antd/lib/form/Form'
import { useIntl }            from 'react-intl'
import { Path }               from 'react-router-dom'

import { PageHeader, StepsForm }        from '@acx-ui/components'
import {
  getPolicyAllowedOperation,
  getPolicyRoutePath,
  getSelectPolicyRoutePath,
  LocationExtended,
  PolicyOperation,
  PolicyType, usePolicyListBreadcrumb
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { hasAllowedOperations }                    from '@acx-ui/user'

enum CertificateTypeEnum {
  DEVICE_CERTIFICATE = 'deviceCertificate',
  CERTIFICATE_AUTHORITY = 'certificateAuthority',
  SERVER_CERTIFICATE = 'serverCertificate',
  CERTIFICATE = 'certificate',
  CERTIFICATE_TEMPLATE = 'certificateTemplate'
}

export default function CreateCertificateProfile () {
  const { $t } = useIntl()
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const tenantBasePath: Path = useTenantLink('')

  const templateInstanceType = useWatch<string>('templateInstanceType', form)

  const createTemplate = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` +
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE_TEMPLATE, oper: PolicyOperation.CREATE })
  }

  const createCa = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` +
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE_AUTHORITY, oper: PolicyOperation.CREATE })
  }

  const createDeviceCert = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` +
      getPolicyRoutePath({ type: PolicyType.CERTIFICATE, oper: PolicyOperation.CREATE })
  }

  const createServerCert = {
    ...tenantBasePath,
    pathname: `${tenantBasePath.pathname}/` +
      getPolicyRoutePath({ type: PolicyType.SERVER_CERTIFICATES, oper: PolicyOperation.CREATE })
  }

  const policiesPageLink = useTenantLink(getSelectPolicyRoutePath(true))
  const fromPage = (useLocation() as LocationExtended)?.state?.from
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.CERTIFICATE_TEMPLATE)

  const hasDeviceCertOperation =
    // eslint-disable-next-line max-len
    hasAllowedOperations(getPolicyAllowedOperation(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.CREATE) ?? []) || hasAllowedOperations(getPolicyAllowedOperation(PolicyType.CERTIFICATE, PolicyOperation.CREATE) ?? [])

  const handleCreation = async () => {
    const type = form.getFieldValue('templateInstanceType')
    if (type === CertificateTypeEnum.DEVICE_CERTIFICATE) {
      const subType = form.getFieldValue('deviceCertificateInstanceType')
      navigate(subType === CertificateTypeEnum.CERTIFICATE
        ? createDeviceCert : createTemplate, { state: { from: fromPage } })
    } else {
      navigate(type === CertificateTypeEnum.CERTIFICATE_AUTHORITY
        ? createCa : createServerCert, { state: { from: fromPage } })
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Certificate Instance' })}
        breadcrumb={breadcrumb}
      />
      <StepsForm
        form={form}
        buttonLabel={{ submit: $t({ defaultMessage: 'Next' }) }}
        onFinish={handleCreation}
        onCancel={() => navigate(policiesPageLink)}>
        <StepsForm.StepForm>
          <Form.Item name='templateInstanceType'
            label={$t({ defaultMessage: 'Template Instance Type' })}
            initialValue={hasDeviceCertOperation ?
              CertificateTypeEnum.DEVICE_CERTIFICATE : CertificateTypeEnum.CERTIFICATE_AUTHORITY}>
            <Radio.Group>
              <Space direction='vertical'>
                {/* eslint-disable-next-line max-len */}
                { hasDeviceCertOperation &&
                <Radio value={CertificateTypeEnum.DEVICE_CERTIFICATE}>
                  {$t({ defaultMessage: 'Device Certificate' })}
                </Radio>
                }
                {/* eslint-disable-next-line max-len */}
                { hasAllowedOperations(getPolicyAllowedOperation(PolicyType.CERTIFICATE_AUTHORITY, PolicyOperation.CREATE) ?? []) &&
                <Radio value={CertificateTypeEnum.CERTIFICATE_AUTHORITY}>
                  {$t({ defaultMessage: 'Certificate Authorities (CA)' })}
                </Radio>
                }
                {/* eslint-disable-next-line max-len */}
                { hasAllowedOperations(getPolicyAllowedOperation(PolicyType.SERVER_CERTIFICATES, PolicyOperation.CREATE) ?? []) &&
                <Radio value={CertificateTypeEnum.SERVER_CERTIFICATE}>
                  {$t({ defaultMessage: 'Server & Client Certificate' })}
                </Radio>
                }
              </Space>
            </Radio.Group>
          </Form.Item>
          { templateInstanceType === CertificateTypeEnum.DEVICE_CERTIFICATE &&
            <Form.Item name='deviceCertificateInstanceType'
              label={$t({ defaultMessage: 'Device Certificate Type' })}
              initialValue={CertificateTypeEnum.CERTIFICATE}>
              <Radio.Group>
                <Space direction='vertical'>
                  {/* eslint-disable-next-line max-len */}
                  { hasAllowedOperations(getPolicyAllowedOperation(PolicyType.CERTIFICATE, PolicyOperation.CREATE) ?? []) &&
                  <Radio value={CertificateTypeEnum.CERTIFICATE}>
                    {$t({ defaultMessage: 'Certificate' })}
                  </Radio>
                  }
                  {/* eslint-disable-next-line max-len */}
                  { hasAllowedOperations(getPolicyAllowedOperation(PolicyType.CERTIFICATE_TEMPLATE, PolicyOperation.CREATE) ?? []) &&
                  <Radio value={CertificateTypeEnum.CERTIFICATE_TEMPLATE}>
                    {$t({ defaultMessage: 'Template' })}
                  </Radio>
                  }
                </Space>
              </Radio.Group>
            </Form.Item>
          }
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
