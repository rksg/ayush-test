
import { useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { PageHeader, StepsFormNew }                                 from '@acx-ui/components'
import { TunnelProfileForm }                                        from '@acx-ui/rc/components'
import { useGetTunnelProfileQuery, useUpdateTunnelProfileMutation } from '@acx-ui/rc/services'
import {
  getPolicyDetailsLink,
  getPolicyRoutePath,
  LocationExtended,
  MtuTypeEnum,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage,
  TunnelProfile
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

const EditTunnelProfile = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)
  const [form] = Form.useForm()
  const { data: tunnelProfileData } = useGetTunnelProfileQuery({ params: { id: params.policyId } })
  const [updateTunnelProfile] = useUpdateTunnelProfileMutation()

  useEffect(() => {
    form.setFieldsValue(tunnelProfileData)
  }, [tunnelProfileData])

  const handleUpdateTunnelProfile = async (data: TunnelProfile) => {
    try {
      let pathParams = { id: params.policyId }
      await updateTunnelProfile({ params: pathParams, payload: data }).unwrap()
      redirectPreviousPage(navigate, previousPath, linkToTableView)
    } catch (error) {
      // TODO Error message TBD
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Edit Tunnel Profile' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Tunnel Profile' }),
            link: tablePath
          },
          {
            text: tunnelProfileData?.name || '',
            link: getPolicyDetailsLink({
              type: PolicyType.TUNNEL_PROFILE,
              oper: PolicyOperation.DETAIL,
              policyId: tunnelProfileData?.id || ''
            })
          }
        ]}
      />
      <StepsFormNew
        form={form}
        onFinish={handleUpdateTunnelProfile}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        initialValues={{
          mtuType: MtuTypeEnum.AUTO
        }}
      >
        <StepsFormNew.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <TunnelProfileForm />
            </Col>
          </Row>
        </StepsFormNew.StepForm>
      </StepsFormNew>
    </>
  )
}

export default EditTunnelProfile