
import { useEffect } from 'react'

import { FormInstance } from 'antd'

import { StepsForm, StepsFormGotoStepFn } from '@acx-ui/components'
import {
  ServiceOperation,
  ServiceType,
  useServicePreviousPath
} from '@acx-ui/rc/utils'
import { useNavigate } from '@acx-ui/react-router-dom'

import { EdgeSdLanFormType, MspEdgeSdLanFormType } from '../shared/type'

import { EdgeSdLanContextProvider } from './EdgeSdLanContextProvider'

interface EdgeSdLanFormStep {
  title: string
  content: React.FC
}

export interface EdgeSdLanFormProps<T = EdgeSdLanFormType | MspEdgeSdLanFormType> {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: T
  onFinish: (values: T, gotoStep: StepsFormGotoStepFn) =>
    Promise<boolean | void>
}

export const EdgeSdLanForm = <T extends EdgeSdLanFormType | MspEdgeSdLanFormType>(
  props: EdgeSdLanFormProps<T>
) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)
  // eslint-disable-next-line max-len
  const { pathname: previousPath } = useServicePreviousPath(ServiceType.EDGE_SD_LAN, ServiceOperation.LIST)

  useEffect(() => {
    if (isEditMode) {
      form.setFieldsValue(editData)
    }
  }, [isEditMode])

  const handleFinish = async (
    formData: T,
    gotoStep: StepsFormGotoStepFn
  ) => {
    await onFinish(formData, gotoStep)
  }

  return (<StepsForm
    form={form}
    onCancel={() => navigate(previousPath)}
    onFinish={handleFinish}
    editMode={isEditMode}
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

export const EdgeSdLanFormContainer = <T extends EdgeSdLanFormType>(
  props: EdgeSdLanFormProps<T>
) => {
  return <EdgeSdLanContextProvider serviceId={props.editData?.id}>
    <EdgeSdLanForm {...props}/>
  </EdgeSdLanContextProvider>
}
