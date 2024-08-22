import { ReactNode } from 'react'

import { FormInstance } from 'antd'
import _                from 'lodash'

import { StepsForm } from '@acx-ui/components'
import {
  EdgeQosViewData,
  getDefaultTrafficClassListData,
  getPolicyRoutePath,
  PolicyOperation,
  PolicyType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

interface EdgeQosFormStep {
  title: string
  content: ReactNode
}

interface EdgeQosFormProps {
  form: FormInstance,
  steps: EdgeQosFormStep[]
  editData?: EdgeQosViewData
  onFinish: (values: QosBandwidthFormModel) => Promise<boolean | void>
}

export interface QosBandwidthFormModel extends EdgeQosViewData {
  activateChangedClusters?:{ [key:string]:boolean }
  activateChangedClustersInfo?:{ [key:string]:
    { clusterName:string, venueId:string, venueName:string } }
}

export const getEdgeQosFormDefaultValues
  = (profileData?: EdgeQosViewData): QosBandwidthFormModel => {
    return {
      ...profileData,
      activateChangedClusters: profileData?.edgeClusterIds?.reduce((acc, curr) => {
        return { ...acc, [curr]: true }
      }, {} as { [clusterId: string]: boolean })
    } as QosBandwidthFormModel
  }

const QosBandwidthForm = (props: EdgeQosFormProps) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()
  const isEditMode = Boolean(editData)

  const linkToServiceList = useTenantLink(getPolicyRoutePath({
    type: PolicyType.QOS_BANDWIDTH,
    oper: PolicyOperation.LIST
  }))

  const handleFinish = async (formData: QosBandwidthFormModel) => {
    onFinish(formData)
  }

  const defaultQosData:EdgeQosViewData = {
    trafficClassSettings: getDefaultTrafficClassListData()
  }

  const mergeData = (data ?: EdgeQosViewData) => {
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

export default QosBandwidthForm
