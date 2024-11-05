import { FormInstance } from 'antd'

import { StepsForm }             from '@acx-ui/components'
import { EdgeMdnsProxyViewData } from '@acx-ui/rc/utils'

export interface EdgeMdnsProxyFormProps {
  form: FormInstance
  steps: {
    title: string
    content: React.FC
  }[]
  onFinish: (formData: EdgeMdnsProxyViewData) => Promise<void>,
  onCancel: () => void
  editData?: EdgeMdnsProxyViewData
}
export const EdgeMdnsProxyForm = (props: EdgeMdnsProxyFormProps) => {
  const { form, steps, editData, onFinish, onCancel } = props
  const isEditMode = Boolean(editData)

  return (<StepsForm
    form={form}
    onCancel={onCancel}
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
