
import { useEffect } from 'react'

import { FormInstance } from 'antd'

import { StepsForm, StepsFormGotoStepFn } from '@acx-ui/components'
import {
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanContextProvider } from './EdgeSdLanContextProvider'
import { NetworkActivationType }    from './NetworkSelectionForm/VenueNetworkTable/NetworksDrawer'

interface EdgeSdLanFormStep {
  title: string
  content: React.FC
}

export interface EdgeSdLanFormType {
  id?: string
  name: string
  tunnelProfileId: string
  activatedNetworks: NetworkActivationType
}

export interface EdgeSdLanFormProps {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: EdgeSdLanFormType
  onFinish: (values: EdgeSdLanFormType, gotoStep: StepsFormGotoStepFn) => Promise<boolean | void>
}

const EdgeSdLanForm = (props: EdgeSdLanFormProps) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)
  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  }))

  useEffect(() => {
    if (isEditMode) {
      form.setFieldsValue(editData)
    }
  }, [isEditMode])

  const handleFinish = async (formData: EdgeSdLanFormType, gotoStep: StepsFormGotoStepFn) => {
    await onFinish(formData, gotoStep)
  }

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
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

export const EdgeSdLanFormContainer = (props: EdgeSdLanFormProps) => {
  return <EdgeSdLanContextProvider serviceId={props.editData?.id}>
    <EdgeSdLanForm {...props}/>
  </EdgeSdLanContextProvider>
}
