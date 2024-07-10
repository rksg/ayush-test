import { ReactNode } from 'react'

import { FormInstance } from 'antd'

import { StepsForm, StepsFormGotoStepFn } from '@acx-ui/components'
import {
  EdgeMvSdLanExtended,
  getServiceRoutePath,
  getVlanVxlanDefaultTunnelProfileOpt,
  ServiceOperation,
  ServiceType,
  EdgeMvSdLanNetworks
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeMvSdLanFormNetwork  } from './TunnelNetworkForm'

export const sdLanFormDefaultValues = {
  isGuestTunnelEnabled: false,
  activatedNetworks: {},
  activatedGuestNetworks: {}
}

const getFormNetworksType = (networks: EdgeMvSdLanNetworks): EdgeMvSdLanFormNetwork => {
  const result: EdgeMvSdLanFormNetwork = {}
  Object.entries(networks).forEach(([venueId, networkIds]) => {
    result[venueId] = networkIds.map(id => ({ id, name: '' }))
  })

  return result
}

export const getSdLanFormDefaultValues
  = (profileData?: EdgeMvSdLanExtended): EdgeMvSdLanFormModel => {
    return {
      ...sdLanFormDefaultValues,
      ...profileData,
      ...(profileData
        ? {
          activatedNetworks: getFormNetworksType(profileData.networks),
          activatedGuestNetworks: getFormNetworksType(profileData.guestNetworks)
        }
        : {}
      )
    } as EdgeMvSdLanFormModel
  }

export interface EdgeMvSdLanFormModel extends EdgeMvSdLanExtended {
  edgeClusterName?: string;
  tunnelProfileName?: string;
  activatedNetworks: EdgeMvSdLanFormNetwork;
  activatedGuestNetworks: EdgeMvSdLanFormNetwork;
}

interface EdgeSdLanFormStep {
  title: string
  content: ReactNode
}

interface EdgeMvSdLanFormProps {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: EdgeMvSdLanExtended
  onFinish: (values: EdgeMvSdLanFormModel, gotoStep: StepsFormGotoStepFn) => Promise<boolean | void>
}

const EdgeMvSdLanForm = (props: EdgeMvSdLanFormProps) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)

  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  }))

  const handleFinish = async (formData: EdgeMvSdLanFormModel, gotoStep: StepsFormGotoStepFn) => {
    await onFinish(formData, gotoStep)
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

export default EdgeMvSdLanForm