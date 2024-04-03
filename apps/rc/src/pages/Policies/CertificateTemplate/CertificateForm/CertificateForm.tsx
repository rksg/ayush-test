import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                                        from '@acx-ui/components'
import { useGenerateCertificateMutation }                                                               from '@acx-ui/rc/services'
import { getPolicyListRoutePath, getPolicyRoutePath, PolicyType, PolicyOperation, CertificateFormData } from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                                                   from '@acx-ui/react-router-dom'

import { Title } from '../styledComponents'

import CertificateSettings from './CertificateSettings'



export default function CertificateForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [generateCertificate] = useGenerateCertificateMutation()
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.CERTIFICATE,
    oper: PolicyOperation.LIST
  }))


  const handleFinish = async (formData: CertificateFormData) => {
    const { certificateTemplateId, csrType, ...rest } = formData
    await generateCertificate({
      params: { templateId: formData.certificateTemplateId },
      payload: { ...rest }
    })
    navigate(linkToList, { replace: true })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Generate Certificate' })}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Network Control' })
        }, {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }, {
          text: $t({ defaultMessage: 'Certificate Template' }),
          link: getPolicyRoutePath({
            type: PolicyType.CERTIFICATE,
            oper: PolicyOperation.LIST
          })
        }]}
      />
      <StepsForm
        buttonLabel={{ submit: $t({ defaultMessage: 'Generate' }) }}
        onFinish={handleFinish}
        onCancel={() => navigate(linkToList)}
      >
        <StepsForm.StepForm>
          <Title>{$t({ defaultMessage: 'Certificate Data' })}</Title>
          <CertificateSettings />
        </StepsForm.StepForm>
      </StepsForm >
    </>
  )
}
