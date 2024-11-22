import { useIntl } from 'react-intl'

import { PageHeader, StepsForm }                                                                      from '@acx-ui/components'
import { ExtendedKeyUsages, PolicyOperation, PolicyType, getPolicyListRoutePath, getPolicyRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                                 from '@acx-ui/react-router-dom'

import { GenerateCertificateFormSelection } from './CertificateStepForms/GenerateCertificateFormSelection'
import useCertificateForm                   from './useCertificateForm'

type ServerClientCertificateFormProps = {
  modalMode?: boolean,
  modalCallBack?: (id?: string) => void,
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
  const { modalMode=false, modalCallBack } = props

  return (
    <>
      {!modalMode && <PageHeader
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
          <GenerateCertificateFormSelection extendedKeyUsages={props?.extendedKeyUsages}/>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
