
import { Col, FormInstance, Row }   from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageHeader, StepsForm }               from '@acx-ui/components'
import {
  TunnelProfileForm as TunnelProfileFormBase
} from '@acx-ui/rc/components'
import {
  CommonResult,
  usePolicyListBreadcrumb,
  getPolicyRoutePath,
  LocationExtended,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage,
  TunnelProfileFormType as TunnelProfileFormTypeBase
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

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
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)

  const handleFinish = async (data: TunnelProfileFormTypeBase) => {
    try{
      await onFinish(data)
      redirectPreviousPage(navigate, previousPath, linkToTableView)
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
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
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
