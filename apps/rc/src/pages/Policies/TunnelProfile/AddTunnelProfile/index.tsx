
import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { PageHeader, StepsFormNew }                                                    from '@acx-ui/components'
import { TunnelProfileForm }                                                           from '@acx-ui/rc/components'
import { useCreateTunnelProfileMutation }                                              from '@acx-ui/rc/services'
import { getPolicyRoutePath, MtuTypeEnum, PolicyOperation, PolicyType, TunnelProfile } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                  from '@acx-ui/react-router-dom'

const AddTunnelProfile = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)
  const [createTunnelProfile] = useCreateTunnelProfileMutation()

  const handleAddTunnelProfile = async (data: TunnelProfile) => {
    try {
      await createTunnelProfile({ payload: data }).unwrap()
      navigate(linkToTableView, { replace: true })
    } catch (error) {
      // TODO Error message TBD
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Tunnel Profile' })}
        breadcrumb={[
          {
            text: $t({ defaultMessage: 'Tunnel Profile' }),
            link: tablePath
          }
        ]}
      />
      <StepsFormNew
        onFinish={handleAddTunnelProfile}
        onCancel={() => navigate(linkToTableView)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
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

export default AddTunnelProfile