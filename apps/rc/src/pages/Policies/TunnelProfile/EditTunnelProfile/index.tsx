
import { useEffect } from 'react'

import { Col, Form, Row } from 'antd'
import { useIntl }        from 'react-intl'

import { PageHeader, StepsForm }                                        from '@acx-ui/components'
import { TunnelProfileForm, TunnelProfileFormType }                     from '@acx-ui/rc/components'
import { useGetTunnelProfileByIdQuery, useUpdateTunnelProfileMutation } from '@acx-ui/rc/services'
import {
  getPolicyListRoutePath,
  getPolicyRoutePath,
  LocationExtended,
  MtuTypeEnum,
  PolicyOperation,
  PolicyType,
  redirectPreviousPage
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
  const { data: tunnelProfileData } = useGetTunnelProfileByIdQuery(
    { params: { id: params.policyId } }
  )
  const [updateTunnelProfile] = useUpdateTunnelProfileMutation()

  const isDefaultTunnelProfile = params.tenantId === tunnelProfileData?.id

  useEffect(() => {
    form.setFieldValue('name', tunnelProfileData?.name)
    form.setFieldValue('mtuSize', tunnelProfileData?.mtuSize)
    form.setFieldValue('mtuType', tunnelProfileData?.mtuType)
    form.setFieldValue('forceFragmentation', tunnelProfileData?.forceFragmentation)

    const ageTime = tunnelProfileData?.ageTimeMinutes || 20
    if (ageTime % 10080 === 0) {
      form.setFieldValue('ageTimeMinutes', ageTime / 10080)
      form.setFieldValue('ageTimeUnit', 'week')
    } else if (ageTime % 1440 === 0) {
      form.setFieldValue('ageTimeMinutes', ageTime / 1440)
      form.setFieldValue('ageTimeUnit', 'days')
    } else {
      form.setFieldValue('ageTimeMinutes', ageTime)
      form.setFieldValue('ageTimeUnit', 'minutes')
    }
  }, [form, tunnelProfileData])

  const handleUpdateTunnelProfile = async (data: TunnelProfileFormType) => {
    try {
      if (data.ageTimeUnit === 'week') {
        data.ageTimeMinutes = data.ageTimeMinutes* 7 * 24 * 60
      } else if (data.ageTimeUnit === 'days') {
        data.ageTimeMinutes = data.ageTimeMinutes * 24 * 60
      }
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
        onFinish={handleUpdateTunnelProfile}
        onCancel={() => redirectPreviousPage(navigate, previousPath, linkToTableView)}
        buttonLabel={{ submit: $t({ defaultMessage: 'Apply' }) }}
        initialValues={{
          mtuType: MtuTypeEnum.AUTO
        }}
      >
        <StepsForm.StepForm>
          <Row gutter={20}>
            <Col span={8}>
              <TunnelProfileForm isDefaultTunnelProfile={isDefaultTunnelProfile}/>
            </Col>
          </Row>
        </StepsForm.StepForm>
      </StepsForm>
    </>
  )
}

export default EditTunnelProfile
