import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import {
  EdgeDhcpSettingForm
} from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import {
  ServiceOperation,
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath,
  EdgeDhcpSettingFormData,
  convertEdgeDHCPFormDataToApiPayload
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

const AddDhcp = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const [form] = Form.useForm()
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()
  const tablePath = getServiceRoutePath(
    { type: ServiceType.EDGE_DHCP, oper: ServiceOperation.LIST })

  const handleAddEdgeDhcp = async (data: EdgeDhcpSettingFormData) => {
    try {
      const payload = convertEdgeDHCPFormDataToApiPayload(data)
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
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'DHCP for SmartEdge' }), link: tablePath }
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
