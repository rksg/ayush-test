import { Form }    from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import { Features, useIsSplitOn }                from '@acx-ui/feature-toggle'
import {
  EdgeDhcpSettingForm, EdgeDhcpSettingFormData
} from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation }                                                              from '@acx-ui/rc/services'
import { LeaseTimeType, ServiceOperation, ServiceType, getServiceListRoutePath, getServiceRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                                 from '@acx-ui/react-router-dom'

const AddDhcp = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const [form] = Form.useForm()
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const tablePath = getServiceRoutePath(
    { type: ServiceType.EDGE_DHCP, oper: ServiceOperation.LIST })

  const handleAddEdgeDhcp = async (data: EdgeDhcpSettingFormData) => {
    try {
      const payload = _.cloneDeep(data)
      if(payload.leaseTimeType === LeaseTimeType.INFINITE) {
        payload.leaseTime = -1 // -1 means infinite
      }

      // should not create service with id
      payload.dhcpPools.forEach(item => item.id = '')
      payload.dhcpOptions.forEach(item => item.id = '')
      payload.hosts.forEach(item => item.id = '')

      await addEdgeDhcp({ payload }).unwrap()
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Add DHCP for SmartEdge Service' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'DHCP for SmartEdge' }), link: tablePath }
        ] : [
          { text: $t({ defaultMessage: 'Services' }), link: '/services' }
        ]}
      />
      <Loader states={[{ isLoading: false, isFetching: isFormSubmitting }]}>
        <StepsForm
          form={form}
          onFinish={handleAddEdgeDhcp}
          onCancel={() => navigate(linkToServices)}
          buttonLabel={{ submit: $t({ defaultMessage: 'Add' }) }}
        >
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}

export default AddDhcp
