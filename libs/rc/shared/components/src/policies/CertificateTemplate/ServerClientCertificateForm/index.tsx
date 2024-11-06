import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                   from '@acx-ui/components'
import { PolicyOperation, PolicyType, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                              from '@acx-ui/react-router-dom'

import GenerateCertificateFormSelection from './CertificateStepForms/GenerateCertificateFormSelection'
import useCertificateForm               from './useCertificateForm'

export function ServerClientCertificateForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { generateCertificateForm, handleFinish } = useCertificateForm()
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.SERVER_CERTIFICATES,
    oper: PolicyOperation.LIST
  }))

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
            type: PolicyType.SERVER_CERTIFICATES,
            oper: PolicyOperation.LIST
          })
        }]}
      />
      <StepsForm form={generateCertificateForm}
        onFinish={async () => {
          try {
            await handleFinish()
            navigate(linkToList, { replace: true })
          } catch (ignore) {}
        }}
        onCancel={() => navigate(linkToList)}
      >
        <StepsForm.StepForm>
          <GenerateCertificateFormSelection />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
