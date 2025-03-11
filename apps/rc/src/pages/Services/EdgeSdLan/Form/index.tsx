import { useEffect, useMemo } from 'react'

import { FormInstance } from 'antd'
import { find }         from 'lodash'

import { StepsForm, StepsFormGotoStepFn } from '@acx-ui/components'
import {
  EdgeMvSdLanExtended,
  getServiceRoutePath,
  getVlanVxlanDefaultTunnelProfileOpt,
  ServiceOperation,
  ServiceType,
  EdgeMvSdLanNetworks,
  EdgeMvSdLanViewData,
  EdgeSdLanTunneledWlan,
  EdgeMvSdLanFormModel,
  EdgeMvSdLanFormNetwork
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanContextProvider, useEdgeSdLanContext } from './EdgeSdLanContextProvider'

export const sdLanFormDefaultValues = {
  isGuestTunnelEnabled: false,
  activatedNetworks: {} as EdgeMvSdLanFormNetwork,
  activatedGuestNetworks: {} as EdgeMvSdLanFormNetwork
}

const getFormNetworksType = (
  networks: EdgeMvSdLanNetworks,
  wlans?: EdgeSdLanTunneledWlan[]
): EdgeMvSdLanFormNetwork => {
  const result: EdgeMvSdLanFormNetwork = {}
  Object.entries(networks).forEach(([venueId, networkIds]) => {
    result[venueId] = networkIds.map(id => ({
      id,
      name: find(wlans, { venueId, networkId: id })?.networkName
    }))
  })

  return result
}

export const getSdLanFormDefaultValues
  = (profileData?: EdgeMvSdLanExtended, viewData?: EdgeMvSdLanViewData): EdgeMvSdLanFormModel => {
    return {
      ...sdLanFormDefaultValues,
      ...profileData,
      ...(profileData
        ? {
          activatedNetworks: getFormNetworksType(profileData.networks, viewData?.tunneledWlans),
          // eslint-disable-next-line max-len
          activatedGuestNetworks: getFormNetworksType(profileData.guestNetworks, viewData?.tunneledGuestWlans)
        }
        : {}
      )
    } as EdgeMvSdLanFormModel
  }

interface EdgeSdLanFormStep {
  title: string
  content: React.FC
}

export interface EdgeSdLanFormProps {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: EdgeMvSdLanExtended
  onFinish: (values: EdgeMvSdLanFormModel, gotoStep: StepsFormGotoStepFn) => Promise<boolean | void>
}

const EdgeSdLanForm = (props: EdgeSdLanFormProps) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const { allSdLans } = useEdgeSdLanContext()
  const isEditMode = Boolean(editData)
  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  }))

  const handleFinish = async (formData: EdgeMvSdLanFormModel, gotoStep: StepsFormGotoStepFn) => {
    await onFinish(formData, gotoStep)
  }

  const editDataViewData = editData ? find(allSdLans, { id: editData?.id }) : undefined
  const initFormValues = useMemo(() => {
    const result = getSdLanFormDefaultValues(editData, editDataViewData)
    const defaultSdLanTunnelProfile = getVlanVxlanDefaultTunnelProfileOpt()
    if (!isEditMode) {
      result.tunnelProfileId = defaultSdLanTunnelProfile.value
      result.tunnelProfileName = defaultSdLanTunnelProfile.label
    }
    return result
  }, [isEditMode, editData, editDataViewData])

  useEffect(() => {
    form.setFieldsValue(initFormValues)
    // need to separately set `activatedNetworks`, `activatedGuestNetworks`
    // https://github.com/ant-design/ant-design/issues/30212
    form.setFieldValue('activatedNetworks', initFormValues.activatedNetworks)
    form.setFieldValue('activatedGuestNetworks', initFormValues.activatedGuestNetworks)
  }, [initFormValues])

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
          <item.content />
        </StepsForm.StepForm>)
    }
  </StepsForm>
  )
}

export const EdgeSdLanFormContainer = (props: EdgeSdLanFormProps) => {
  return <EdgeSdLanContextProvider>
    <EdgeSdLanForm {...props}/>
  </EdgeSdLanContextProvider>
}
