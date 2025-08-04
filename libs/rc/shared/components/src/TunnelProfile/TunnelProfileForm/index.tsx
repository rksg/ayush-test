import { Col, FormInstance, Row } from 'antd'
import { useNavigate }            from 'react-router-dom'

import { PageHeader, StepsForm }      from '@acx-ui/components'
import {
  CommonResult,
  usePolicyListBreadcrumb,
  PolicyOperation,
  PolicyType,
  TunnelProfileFormType,
  useAfterPolicySaveRedirectPath,
  usePolicyPreviousPath,
  useConfigTemplateTenantLink,
  generateConfigTemplateBreadcrumb

} from '@acx-ui/rc/utils'

import { TunnelProfileFormItems } from './TunnelProfileFormItems'

interface TunnelProfileFormProps {
  title: string
  submitButtonLabel: string
  onFinish: (values: TunnelProfileFormType) => Promise<CommonResult | void> | void
  form?: FormInstance
  isDefaultTunnel?: boolean
  initialValues?: TunnelProfileFormType
  editMode?: boolean
  isTemplate?: boolean
}

export const TunnelProfileForm = (props: TunnelProfileFormProps) => {
  const {
    title, submitButtonLabel,
    onFinish,
    form,
    isDefaultTunnel,
    initialValues, editMode,
    isTemplate
  } = props

  const navigate = useNavigate()
  const redirectPathAfterSave = useAfterPolicySaveRedirectPath(PolicyType.TUNNEL_PROFILE)
  const templateFallbackPath = useConfigTemplateTenantLink('')
  const previousPath = usePolicyPreviousPath(PolicyType.TUNNEL_PROFILE, PolicyOperation.LIST)
  const redirectPath = isTemplate ? templateFallbackPath : redirectPathAfterSave
  const policyBreadcrumb = usePolicyListBreadcrumb(PolicyType.TUNNEL_PROFILE)
  const breadcrumb = isTemplate ? generateConfigTemplateBreadcrumb() : policyBreadcrumb

  const handleFinish = async (data: TunnelProfileFormType) => {
    try{
      await onFinish(data)
      navigate(redirectPath, { replace: true })
    } catch(error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  const handleCancel = () => {
    navigate(isTemplate ? templateFallbackPath : previousPath)
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={breadcrumb}
      />
      <StepsForm
        form={form}
        onFinish={handleFinish}
        onCancel={handleCancel}
        buttonLabel={{ submit: submitButtonLabel }}
        initialValues={initialValues}
        editMode={editMode}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={10}>
              <TunnelProfileFormItems isDefaultTunnelProfile={isDefaultTunnel} />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}
