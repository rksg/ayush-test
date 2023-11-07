import { ReactNode, useEffect } from 'react'

import { FormInstance } from 'antd'

import { StepsForm }                                                 from '@acx-ui/components'
import { EdgeCentralizedForwardingSetting, getServiceListRoutePath } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                                from '@acx-ui/react-router-dom'

import { ActivatedNetwork } from './ScopeForm'

export interface CentralizedForwardingFormModel extends EdgeCentralizedForwardingSetting {
  venueName?: string;
  edgeName?: string;
  tunnelProfileName?: string;
  corePortName?: string;
  activatedNetworks: ActivatedNetwork[];
}

interface CentralizedForwardingFormStep {
  title: string
  content: ReactNode
}

interface CentralizedForwardingFormProps {
  form: FormInstance,
  steps: CentralizedForwardingFormStep[]
  editMode?: boolean
  editData?: EdgeCentralizedForwardingSetting
  onFinish: (values: CentralizedForwardingFormModel) => Promise<boolean | void>
}

const CentralizedForwardingForm = (props: CentralizedForwardingFormProps) => {
  const { form, steps, editMode, editData, onFinish } = props
  const navigate = useNavigate()

  // TODO: this should redirect to CF service list when page is ready
  // const linkToServiceList = useTenantLink(getServiceRoutePath({
  //   type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
  //   oper: ServiceOperation.LIST
  // }))
  const linkToServiceList = useTenantLink(getServiceListRoutePath())

  const handleFinish = async (formData: CentralizedForwardingFormModel) => {
    onFinish(formData)
  }

  useEffect(() => {
    if(form && editData) {
      form.resetFields()
      // form.setFieldsValue(editData)
    }
  }, [form, editData])

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={handleFinish}
    editMode={editMode}
    initialValues={editData}
  >
    {
      steps.map((item, index) =>
        <StepsForm.StepForm
          key={`step-${index}`}
          name={index.toString()}
          title={item.title}
        >
          {item.content}
        </StepsForm.StepForm>)
    }
  </StepsForm>
  )
}

export default CentralizedForwardingForm

