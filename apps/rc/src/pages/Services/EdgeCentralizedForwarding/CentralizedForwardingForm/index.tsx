import { ReactNode, useEffect } from 'react'

import { Form } from 'antd'


import { StepsForm }                                          from '@acx-ui/components'
import { EdgeCentralizeForwardingSetting }                    from '@acx-ui/rc/utils'
import { getServiceRoutePath, ServiceOperation, ServiceType } from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink }                         from '@acx-ui/react-router-dom'

import { ActivatedNetwork } from './ScopeForm'

export interface CentralizedForwardingFormModel extends EdgeCentralizeForwardingSetting {
  corePort?: string;
  activatedNetworks: ActivatedNetwork[];
}

interface CentralizedForwardingFormStep {
  title: string
  content: ReactNode
}

interface CentralizedForwardingFormProps {
  steps: CentralizedForwardingFormStep[]
  editMode?: boolean
  editData?: EdgeCentralizeForwardingSetting
  onFinish: (values: CentralizedForwardingFormModel) => Promise<boolean | void>
}

const CentralizedForwardingForm = (props: CentralizedForwardingFormProps) => {
  const { steps, editMode, editData, onFinish } = props
  const navigate = useNavigate()
  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_CENTRALIZED_FORWARDING,
    oper: ServiceOperation.LIST
  }))
  const [form] = Form.useForm()

  const handleFinish = async (formData: CentralizedForwardingFormModel) => {
    onFinish(formData)
  }

  useEffect(() => {
    if(form && editData) {
      form.resetFields()
      form.setFieldsValue(editData)
    }
  }, [form, editData])

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={handleFinish}
    editMode={editMode}
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

