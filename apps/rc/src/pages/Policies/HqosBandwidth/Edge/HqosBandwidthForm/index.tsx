import { ReactNode } from 'react'

import { FormInstance } from 'antd'
import _                from 'lodash'

import { StepsForm }               from '@acx-ui/components'
import {
  EdgeHqosViewData,
  getDefaultTrafficClassListData
} from '@acx-ui/rc/utils'

interface EdgeHqosFormStep {
  title: string
  content: ReactNode
}

interface EdgeHqosFormProps {
  form: FormInstance,
  steps: EdgeHqosFormStep[]
  editData?: EdgeHqosViewData
  onFinish: (values: HqosBandwidthFormModel) => Promise<boolean | void>
  onCancel?: () => void
}

export interface HqosBandwidthFormModel extends EdgeHqosViewData {
  activateChangedClusters?:{ [key:string]:boolean }
  activateChangedClustersInfo?:{ [key:string]:
    { clusterName:string, venueId:string, venueName:string } }
}

export const getEdgeQosFormDefaultValues
  = (profileData?: EdgeHqosViewData): HqosBandwidthFormModel => {
    return {
      ...profileData,
      activateChangedClusters: profileData?.edgeClusterIds?.reduce((acc, curr) => {
        return { ...acc, [curr]: true }
      }, {} as { [clusterId: string]: boolean })
    } as HqosBandwidthFormModel
  }

const HqosBandwidthForm = (props: EdgeHqosFormProps) => {
  const { form, steps, editData, onFinish, onCancel } = props
  const isEditMode = Boolean(editData)

  const handleFinish = async (formData: HqosBandwidthFormModel) => {
    await onFinish(formData)
  }

  const defaultQosData:EdgeHqosViewData = {
    trafficClassSettings: getDefaultTrafficClassListData()
  }

  const mergeData = (data ?: EdgeHqosViewData) => {
    if(!data) {
      return defaultQosData
    }

    const mergedData = _.cloneDeep(data)
    const trafficClassListData = _.cloneDeep(getDefaultTrafficClassListData())
    trafficClassListData.forEach(item1 => {
      const setting = mergedData.trafficClassSettings?.find(
        item2 => (item1.trafficClass === item2.trafficClass
            && item1.priority === item2.priority))
      item1.priorityScheduling = setting?.priorityScheduling
      item1.maxBandwidth = setting?.maxBandwidth
      item1.minBandwidth = setting?.minBandwidth
    })
    mergedData.trafficClassSettings = trafficClassListData
    return mergedData
  }

  const initFormValues = getEdgeQosFormDefaultValues(mergeData(editData))

  return (<StepsForm
    form={form}
    onCancel={onCancel}
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

export default HqosBandwidthForm
