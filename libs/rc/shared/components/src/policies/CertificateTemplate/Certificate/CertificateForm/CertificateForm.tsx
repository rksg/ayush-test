import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                                         from '@acx-ui/components'
import { useGenerateCertificateToIdentityMutation }                                                      from '@acx-ui/rc/services'
import { usePolicyListBreadcrumb, getPolicyRoutePath, PolicyType, PolicyOperation, CertificateFormData } from '@acx-ui/rc/utils'
import { useTenantLink, useNavigate }                                                                    from '@acx-ui/react-router-dom'

import { Title } from '../../styledComponents'

import CertificateSettings from './CertificateSettings'



export function CertificateForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const [generateCertificate] = useGenerateCertificateToIdentityMutation()
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.CERTIFICATE,
    oper: PolicyOperation.LIST
  }))


  const handleFinish = async (formData: CertificateFormData) => {
    const { certificateTemplateId, csrType, csrString, description, ...variables } = formData
    await generateCertificate({
      // eslint-disable-next-line max-len
      params: { templateId: formData.certificateTemplateId, personaId: formData.identityId },
      payload: { csrString, description, variableValues: { ...variables } }
    })
    navigate(linkToList, { replace: true })
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Generate Certificate' })}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.CERTIFICATE)}
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
