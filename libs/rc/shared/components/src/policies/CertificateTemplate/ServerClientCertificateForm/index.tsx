import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                                                  from '@acx-ui/components'
import { ExtendedKeyUsages, KeyUsages, PolicyOperation, PolicyType, usePolicyListBreadcrumb, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                                             from '@acx-ui/react-router-dom'

import { GenerateCertificateFormSelection } from './CertificateStepForms/GenerateCertificateFormSelection'
import useCertificateForm                   from './useCertificateForm'

type ServerClientCertificateFormProps = {
  modalMode?: boolean,
  modalCallBack?: (id?: string) => void,
  keyUsages?: KeyUsages[],
  extendedKeyUsages?: ExtendedKeyUsages[]
}

export const ServerClientCertificateForm = (props: ServerClientCertificateFormProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const { generateCertificateForm, handleFinish } = useCertificateForm()
  const linkToList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.SERVER_CERTIFICATES,
    oper: PolicyOperation.LIST
  }))
  const { modalMode=false, modalCallBack, keyUsages, extendedKeyUsages } = props
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SERVER_CERTIFICATES)

  return (
    <>
      {!modalMode && <PageHeader
        title={$t({ defaultMessage: 'Generate Certificate' })}
        breadcrumb={breadcrumb}
      />}
      <StepsForm form={generateCertificateForm}
        onFinish={async () => {
          try {
            const id = await handleFinish()
            if (modalMode) {
              if (id) {
                modalCallBack?.(id)
              }
              return
            }
            navigate(linkToList, { replace: true })
          } catch (ignore) {}
        }}
        onCancel={() => modalMode ? modalCallBack?.() : navigate(linkToList)}
      >
        <StepsForm.StepForm>
          <GenerateCertificateFormSelection
            keyUsages={keyUsages}
            extendedKeyUsages={extendedKeyUsages}
          />
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
