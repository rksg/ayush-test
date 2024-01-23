import { ReactNode } from 'react'

import { FormInstance } from 'antd'

import { StepsForm } from '@acx-ui/components'
import {
  EdgeSdLanSettingP2,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanActivatedNetwork } from './TunnelScopeForm'

const sdLanFormDefaultValues = {
  isGuestTunnelEnabled: false,
  activatedNetworks: [],
  activatedGuestNetworks: []
}

export const getSdLanFormDefaultValues
  = (profileData?: EdgeSdLanSettingP2): EdgeSdLanFormModelP2 => {
    return {
      ...sdLanFormDefaultValues,
      ...profileData,
      ...(profileData
        ? {
          activatedNetworks: profileData.networkIds.map(id => ({ id })),
          activatedGuestNetworks: profileData.guestNetworkIds.map(id => ({ id }))
        }
        : {}
      )
    } as EdgeSdLanFormModelP2
  }

export interface EdgeSdLanFormModelP2 extends EdgeSdLanSettingP2 {
  venueName?: string;
  edgeName?: string;
  tunnelProfileName?: string;
  corePortName?: string;
  activatedNetworks: EdgeSdLanActivatedNetwork[];
  activatedGuestNetworks: EdgeSdLanActivatedNetwork[];
}

interface EdgeSdLanFormStep {
  title: string
  content: ReactNode
}

interface EdgeSdLanFormP2Props {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: EdgeSdLanSettingP2
  onFinish: (values: EdgeSdLanFormModelP2) => Promise<boolean | void>
}

const EdgeSdLanFormP2 = (props: EdgeSdLanFormP2Props) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)

  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN_P2,
    oper: ServiceOperation.LIST
  }))

  const handleFinish = async (formData: EdgeSdLanFormModelP2) => {
    onFinish(formData)
  }

  const initFormValues = getSdLanFormDefaultValues(editData)

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

export default EdgeSdLanFormP2