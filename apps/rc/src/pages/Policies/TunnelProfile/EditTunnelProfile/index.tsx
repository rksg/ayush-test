
import { useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { PageHeader, StepsFormNew } from '@acx-ui/components'
import { TunnelProfileForm }        from '@acx-ui/rc/components'
import {
  getPolicyRoutePath,
  LocationExtended,
  MtuTypeEnum,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage,
  TunnelProfile
} from '@acx-ui/rc/utils'
import { useLocation, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const EditTunnelProfile = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const location = useLocation()
  const previousPath = (location as LocationExtended)?.state?.from?.pathname
  const tablePath = getPolicyRoutePath({
    type: PolicyType.TUNNEL_PROFILE,
    oper: PolicyOperation.LIST
  })
  const linkToTableView = useTenantLink(tablePath)
  // TODO need get tunnel profile data and update tunnel api
  const [form] = Form.useForm()

  useEffect(() => {

  }, [])// TODO should watch tunnel profile data

  const handleUpdateTunnelProfile = async (data: TunnelProfile) => {
    try {
      // await createTunnelProfile({ payload: data }).unwrap()
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
            text: '', // TODO tunnel name
            link: '' // TODO tunnel detail page link
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