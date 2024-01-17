import { ReactNode, useEffect } from 'react'

import { FormInstance } from 'antd'

import { StepsForm } from '@acx-ui/components'
import {
  EdgeSdLanSetting,
  EdgeSdLanSettingP2,
  getServiceRoutePath,
  ServiceOperation,
  ServiceType
} from '@acx-ui/rc/utils'
import { useNavigate, useTenantLink } from '@acx-ui/react-router-dom'

import { EdgeSdLanActivatedNetwork } from './TunnelScopeForm'

export interface EdgeSdLanFormModelP2 extends EdgeSdLanSettingP2 {
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

interface EdgeSdLanFormP2Props {
  form: FormInstance,
  steps: EdgeSdLanFormStep[]
  editData?: EdgeSdLanSetting
  onFinish: (values: EdgeSdLanFormModelP2) => Promise<boolean | void>
}

const EdgeSdLanFormP2 = (props: EdgeSdLanFormP2Props) => {
  const { form, steps, editData, onFinish } = props
  const navigate = useNavigate()

  const linkToServiceList = useTenantLink(getServiceRoutePath({
    type: ServiceType.EDGE_SD_LAN,
    oper: ServiceOperation.LIST
  }))

  const handleFinish = async (formData: EdgeSdLanFormModelP2) => {
    onFinish(formData)
  }

  useEffect(() => {
    if(form && editData) {
      form.resetFields()
      form.setFieldValue('activatedNetworks', editData.networkIds
        .map(id => ({ id })))
    }
  }, [form, editData])

  return (<StepsForm
    form={form}
    onCancel={() => navigate(linkToServiceList)}
    onFinish={handleFinish}
    editMode={Boolean(editData)}
    initialValues={editData}
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