import { ReactNode } from 'react'

import { FormInstance } from 'antd'

import { StepsForm } from '@acx-ui/components'
import {
  EdgeSdLanSetting,
  getServiceRoutePath,
  getVlanVxlanDefaultTunnelProfileOpt,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanActivatedNetwork } from './ScopeForm'

export interface EdgeSdLanFormModel extends EdgeSdLanSetting {
  venueName?: string;
  edgeName?: string;
  tunnelProfileName?: string;
  corePortName?: string;
  activatedNetworks: EdgeSdLanActivatedNetwork[];
}

interface EdgeSdLanFormStep {
  title: string
  content: ReactNode
}

interface EdgeSdLanFormProps {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: EdgeSdLanSetting
  onFinish: (values: EdgeSdLanFormModel) => Promise<boolean | void>
}

export const getSdLanFormDefaultValues
  = (profileData?: EdgeSdLanSetting): EdgeSdLanFormModel => {
    return {
      ...profileData,
      ...(profileData
        ? {
          activatedNetworks: profileData.networkIds.map(id => ({ id }))
        }
        : {
          activatedNetworks: []
        }
      )
    } as EdgeSdLanFormModel
  }

const EdgeSdLanForm = (props: EdgeSdLanFormProps) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)

  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  }))

  const handleFinish = async (formData: EdgeSdLanFormModel) => {
    onFinish(formData)
  }

  const initFormValues = getSdLanFormDefaultValues(editData)
  const defaultSdLanTunnelProfile = getVlanVxlanDefaultTunnelProfileOpt()
  if (!isEditMode) {
    initFormValues.tunnelProfileId = defaultSdLanTunnelProfile.value
    initFormValues.tunnelProfileName = defaultSdLanTunnelProfile.label
  }

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={handleFinish}
    editMode={isEditMode}
    initialValues={initFormValues}
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

export default EdgeSdLanForm