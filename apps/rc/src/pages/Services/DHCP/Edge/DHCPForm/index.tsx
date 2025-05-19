import { FormInstance } from 'antd'

import { Loader, PageHeader, StepsForm } from '@acx-ui/components'
import { EdgeDhcpSettingForm }           from '@acx-ui/rc/components'
import {
  CommonResult,
  EdgeDhcpSettingFormData,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType,
  useServiceListBreadcrumb,
  useServicePreviousPath
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
  const navigate = useNavigate()
  // eslint-disable-next-line max-len
  const { pathname: previousPath } = useServicePreviousPath(ServiceType.EDGE_DHCP, ServiceOperation.LIST)
  const routeToList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_DHCP,
    oper: ServiceOperation.LIST
  }))

  const handleFinish = async (data: EdgeDhcpSettingFormData) => {
    try {
      await onFinish(data)
      navigate(routeToList, { replace: true })
    } catch (error) {
      console.log(error) // eslint-disable-line no-console
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        breadcrumb={useServiceListBreadcrumb(ServiceType.EDGE_DHCP)}
      />
      <Loader states={[{ isLoading: isDataLoading, isFetching: isSubmiting }]}>
        <StepsForm
          form={form}
          onFinish={handleFinish}
          onCancel={() => navigate(previousPath, { replace: true })}
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
