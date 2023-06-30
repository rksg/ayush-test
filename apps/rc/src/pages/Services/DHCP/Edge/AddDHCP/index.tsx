import { Form }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Loader,
  PageHeader,
  StepsForm
} from '@acx-ui/components'
import {
  EdgeDhcpSettingForm, EdgeDhcpSettingFormData
} from '@acx-ui/rc/components'
import { useAddEdgeDhcpServiceMutation } from '@acx-ui/rc/services'
import { LeaseTimeType }                 from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }    from '@acx-ui/react-router-dom'

const AddDhcp = () => {

  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const [form] = Form.useForm()
  const [addEdgeDhcp, { isLoading: isFormSubmitting }] = useAddEdgeDhcpServiceMutation()

  const handleAddEdgeDhcp = async (data: EdgeDhcpSettingFormData) => {
    try {
      if(data.leaseTimeType === LeaseTimeType.INFINITE) {
        data.leaseTime = -1 // -1 means infinite
      }
      await addEdgeDhcp({ payload: data }).unwrap()
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
