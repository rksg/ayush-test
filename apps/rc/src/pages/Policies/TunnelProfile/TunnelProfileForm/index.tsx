
import { Col, FormInstance, Row } from 'antd'
import { useNavigate }            from 'react-router-dom'

import { PageHeader, StepsForm }               from '@acx-ui/components'
import {
  TunnelProfileForm as TunnelProfileFormBase
} from '@acx-ui/rc/components'
import {
  CommonResult,
  usePolicyListBreadcrumb,
  PolicyOperation,
  PolicyType,
  TunnelProfileFormType as TunnelProfileFormTypeBase,
  useAfterPolicySaveRedirectPath,
  usePolicyPreviousPath
} from '@acx-ui/rc/utils'

interface TunnelProfileFormProps {
  title: string
  submitButtonLabel: string
  onFinish: (values: TunnelProfileFormTypeBase) => Promise<CommonResult | void> | void
  form?: FormInstance
  isDefaultTunnel?: boolean
  initialValues?: TunnelProfileFormTypeBase
  editMode?: boolean
}

export const TunnelProfileForm = (props: TunnelProfileFormProps) => {
  // eslint-disable-next-line max-len
  const { title, submitButtonLabel, onFinish, form, isDefaultTunnel, initialValues, editMode } = props
  const navigate = useNavigate()
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.TUNNEL_PROFILE)
  const previousPath = usePolicyPreviousPath(PolicyType.TUNNEL_PROFILE, PolicyOperation.LIST)

  const handleFinish = async (data: TunnelProfileFormTypeBase) => {
    try{
      await onFinish(data)
      navigate(redirectPathAfterSave, { replace: true })
    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={usePolicyListBreadcrumb(PolicyType.TUNNEL_PROFILE)}
      />
      <StepsForm
        form={form}
        onFinish={handleFinish}
        onCancel={() => navigate(previousPath)}
        buttonLabel={{ submit: submitButtonLabel }}
        initialValues={initialValues}
        editMode={editMode}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={10}>
              <TunnelProfileFormBase isDefaultTunnelProfile={isDefaultTunnel} />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
