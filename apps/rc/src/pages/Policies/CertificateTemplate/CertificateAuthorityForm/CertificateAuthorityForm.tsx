import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                   from '@acx-ui/components'
import { PolicyOperation, PolicyType, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                              from '@acx-ui/react-router-dom'

import CertificateAuthoritySettings from './CertificateAuthoritySettings/CertificateAuthoritySettings'
import useCertificateAuthorityForm  from './useCertificateAuthorityForm'




export default function CertificateAuthorityForm () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { createCaForm, handleFinish } = useCertificateAuthorityForm()
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.CERTIFICATE_AUTHORITY,
    oper: PolicyOperation.LIST
  }))

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Certificate Authority' })}
        breadcrumb={[{
          text: $t({ defaultMessage: 'Network Control' })
        }, {
          text: $t({ defaultMessage: 'Policies & Profiles' }),
          link: getPolicyListRoutePath(true)
        }, {
          text: $t({ defaultMessage: 'Certificate Template' }),
          link: getPolicyRoutePath({
            type: PolicyType.CERTIFICATE_AUTHORITY,
            oper: PolicyOperation.LIST
          })
        }]}
      />
      <StepsForm form={createCaForm}
        onFinish={async () => {
          try {
            await handleFinish()
            navigate(linkToList, { replace: true })
          } catch (ignore) {}
        }}
        onCancel={() => navigate(linkToList)}
      >
        <StepsForm.StepForm>
          <CertificateAuthoritySettings />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
