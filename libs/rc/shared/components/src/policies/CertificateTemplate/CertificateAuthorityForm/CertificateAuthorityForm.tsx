import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                    from '@acx-ui/components'
import { PolicyOperation, PolicyType, usePolicyListBreadcrumb, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                               from '@acx-ui/react-router-dom'

import CertificateAuthoritySettings from './CertificateAuthoritySettings/CertificateAuthoritySettings'
import useCertificateAuthorityForm  from './useCertificateAuthorityForm'


type CertificateAuthorityFormProps = {
  modalMode?: boolean,
  modalCallBack?: (id?: string) => void
}

export const CertificateAuthorityForm = (props: CertificateAuthorityFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { createCaForm, handleFinish } = useCertificateAuthorityForm()
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.CERTIFICATE_AUTHORITY,
    oper: PolicyOperation.LIST
  }))
  const { modalMode=false, modalCallBack } = props
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.CERTIFICATE_AUTHORITY)

  return (
    <>
      {!modalMode && <PageHeader
        title={$t({ defaultMessage: 'Add Certificate Authority' })}
        breadcrumb={breadcrumb}
      />}
      <StepsForm form={createCaForm}
        onFinish={async () => {
          try {
            const id = await handleFinish()
            if (modalMode) {
              modalCallBack?.(id)
              return
            }
            navigate(linkToList, { replace: true })
          } catch (ignore) {}
        }}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToList)}
      >
        <StepsForm.StepForm>
          <CertificateAuthoritySettings />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
