import { FormInstance } from 'antd'

import { StepsForm }                                                                 from '@acx-ui/components'
import { EdgeMdnsProxyViewData, ServiceOperation, ServiceType, getServiceRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                                from '@acx-ui/react-router-dom'

interface EdgeMdnsProxyFormProps {
  form: FormInstance
  steps: {
    title: string
    content: React.FC
  }[]
  editData?: EdgeMdnsProxyViewData
  onFinish: (formData: EdgeMdnsProxyViewData) => Promise<void>
}
export const EdgeMdnsProxyForm = (props: EdgeMdnsProxyFormProps) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)
  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_MDNS_PROXY,
    oper: ServiceOperation.LIST
  }))

  // const initFormValues = useMemo(() => {

  //   if (isEditMode) {

  //   }
  //   return result
  // }, [isEditMode, editData])

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={onFinish}
    editMode={isEditMode}
    initialValues={editData}
  >
    {
      steps.map((item, index) =>
        <StepsForm.StepForm
          key={`step-${index}`}
          name={index.toString()}
          title={item.title}
        >
          <item.content />
        </StepsForm.StepForm>)
    }
  </StepsForm>
  )
}
