
import { Col, FormInstance, Row }   from 'antd'
import { useIntl }                  from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'

import { PageHeader, StepsForm }                       from '@acx-ui/components'
import {
  TunnelProfileForm as TunnelProfileFormBase,
  TunnelProfileFormType as TunnelProfileFormTypeBase
} from '@acx-ui/rc/components'
import {
  LocationExtended,
  PolicyOperation,
  PolicyType,
  getPolicyListRoutePath,
  getPolicyRoutePath,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useTenantLink } from '@acx-ui/react-router-dom'

interface TunnelProfileFormProps {
  title: string
  submitButtonLabel: string
  onFinish: (values: TunnelProfileFormTypeBase) => Promise<boolean | void>
  form?: FormInstance
  isDefaultTunnel?: boolean
}

export const TunnelProfileForm = (props: TunnelProfileFormProps) => {
  const { title, submitButtonLabel, onFinish, form, isDefaultTunnel } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)

  const handleFinish = async (data: TunnelProfileFormTypeBase) => {
    await onFinish(data)
    redirectPreviousPage(navigate, previousPath, linkToTableView)
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          {
            text: $t({ defaultMessage: 'Policies & Profiles' }),
            link: getPolicyListRoutePath(true)
          },
          {
            text: $t({ defaultMessage: 'Tunnel Profile' }),
            link: tablePath
          }
        ]}
      />
      <StepsForm
        form={form}
        onFinish={handleFinish}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
        buttonLabel={{ submit: submitButtonLabel }}
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