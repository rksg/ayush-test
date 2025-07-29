
import { Col, Form, Row }                      from 'antd'
import { useIntl }                             from 'react-intl'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { PageHeader, StepsForm }                              from '@acx-ui/components'
import { useCreateSoftGreMutation, useUpdateSoftGreMutation } from '@acx-ui/rc/services'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  getPolicyRoutePath,
  redirectPreviousPage,
  SoftGre,
  usePolicyListBreadcrumb,
  useAfterPolicySaveRedirectPath
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

import { SoftGreSettingForm } from './SoftGreSettingForm'

interface SoftGreFormProps {
  editMode: boolean
}

export const SoftGreForm = (props: SoftGreFormProps) => {
  const { editMode } = props
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [form] = Form.useForm()

  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.SOFTGRE)
  const breadcrumb = usePolicyListBreadcrumb(PolicyType.SOFTGRE)
  const tablePath = getPolicyRoutePath({
    type: PolicyType.SOFTGRE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)

  const [ updateSoftGre ] = useUpdateSoftGreMutation()
  const [ createSoftGre ] = useCreateSoftGreMutation()

  const handleFinish = async (data: SoftGre) => {
    try {
      if (editMode) {
        await updateSoftGre({ params, payload: data }).unwrap()
      } else {
        await createSoftGre({ params, payload: data }).unwrap()
      }

      navigate(redirectPathAfterSave, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={editMode
          ? $t({ defaultMessage: 'Edit SoftGRE' })
          : $t({ defaultMessage: 'Add SoftGRE' })
        }
        breadcrumb={breadcrumb}
      />
      <StepsForm<SoftGre>
        form={form}
        onFinish={handleFinish}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
        buttonLabel={{
          submit: editMode
            ? $t({ defaultMessage: 'Apply' })
            : $t({ defaultMessage: 'Add' })
        }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={10}>
              <SoftGreSettingForm
                editMode={editMode}
                readMode={false}
                policyId={params?.policyId}
              />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
