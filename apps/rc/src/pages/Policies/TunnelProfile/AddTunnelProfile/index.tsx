
import { Col, Row } from 'antd'
import { useIntl }  from 'react-intl'

import { PageHeader, StepsForm }                    from '@acx-ui/components'
import { TunnelProfileForm, TunnelProfileFormType } from '@acx-ui/rc/components'
import { useCreateTunnelProfileMutation }           from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  LocationExtended,
  MtuTypeEnum,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const AddTunnelProfile = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)
  const [createTunnelProfile] = useCreateTunnelProfileMutation()

  const handleAddTunnelProfile = async (data: TunnelProfileFormType) => {
    try {
      if (data.ageTimeUnit === 'week') {
        data.ageTimeMinutes = data.ageTimeMinutes* 7 * 24 * 60
      } else if (data.ageTimeUnit === 'days') {
        data.ageTimeMinutes = data.ageTimeMinutes * 24 * 60
      }
      await createTunnelProfile({ payload: data }).unwrap()
      redirectPreviousPage(navigate, previousPath, linkToTableView)
    } catch (error) {
      // TODO Error message TBD
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add Tunnel Profile' })}
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
        onFinish={handleAddTunnelProfile}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
        initialValues={{
          mtuType: MtuTypeEnum.AUTO
        }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={10}>
              <TunnelProfileForm />
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default AddTunnelProfile
