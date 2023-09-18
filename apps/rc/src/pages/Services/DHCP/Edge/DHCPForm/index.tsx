import { FormInstance } from 'antd'
import { useIntl }      from 'react-intl'

import { Loader, PageHeader, StepsForm } from '@acx-ui/components'
import { EdgeDhcpSettingForm }           from '@acx-ui/rc/components'
import {
  CommonResult,
  EdgeDhcpSettingFormData,
  ServiceOperation,
  ServiceType,
  getServiceListRoutePath,
  getServiceRoutePath
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

interface EdgeDhcpFormProps {
  title: string
  submitButtonLabel: string
  onFinish: (values: EdgeDhcpSettingFormData) => Promise<CommonResult>
  isSubmiting: boolean
  isDataLoading?: boolean
  form?: FormInstance
}

export const EdgeDhcpForm = (props: EdgeDhcpFormProps) => {
  const {
    title, submitButtonLabel, onFinish, isSubmiting, form,
    isDataLoading = false
  } = props
  const { $t } = useIntl()
  const navigate = useNavigate()
  const linkToServices = useTenantLink('/services')
  const tablePath = getServiceRoutePath(
    { type: ServiceType.EDGE_DHCP, oper: ServiceOperation.LIST })

  const handleFinish = async (data: EdgeDhcpSettingFormData) => {
    try {
      await onFinish(data)
      navigate(linkToServices, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={[
          { text: $t({ defaultMessage: 'Network Control' }) },
          { text: $t({ defaultMessage: 'My Services' }), link: getServiceListRoutePath(true) },
          { text: $t({ defaultMessage: 'DHCP for SmartEdge' }), link: tablePath }
        ]}
      />
      <Loader states={[{ isLoading: isDataLoading, isFetching: isSubmiting }]}>
        <StepsForm
          form={form}
          onFinish={handleFinish}
          onCancel={() => navigate(linkToServices)}
          buttonLabel={{ submit: submitButtonLabel }}
        >
          <StepsForm.StepForm>
            <EdgeDhcpSettingForm />
          </StepsForm.StepForm>
        </StepsForm>
      </Loader>
    </>
  )
}