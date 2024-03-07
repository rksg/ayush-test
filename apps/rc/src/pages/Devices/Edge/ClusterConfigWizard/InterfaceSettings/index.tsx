import { useContext, useState } from 'react'

import { useIntl }                from 'react-intl'
import { useNavigate, useParams } from 'react-router-dom'

import { StepsForm, StepsFormProps }                       from '@acx-ui/components'
import { CompatibilityStatusBar, CompatibilityStatusEnum } from '@acx-ui/rc/components'
import { useGetEdgeClusterNetworkSettingsQuery }           from '@acx-ui/rc/services'
import { useTenantLink }                                   from '@acx-ui/react-router-dom'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { LagForm }  from './LagForm'
import { PortForm } from './PortForm'


export const InterfaceSettings = () => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const clusterListPage = useTenantLink('/devices/edge')
  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const [alertData, setAlertData] = useState<
  StepsFormProps<Record<string, unknown>>['alert']>({
    type: 'success',
    message: <CompatibilityStatusBar
      key='step1'
      type={CompatibilityStatusEnum.PASS}
    />
  })
  const { data: clusterNetworkSettings } = useGetEdgeClusterNetworkSettingsQuery({
    params: {
      venueId: clusterInfo?.venueId,
      clusterId: clusterInfo?.clusterId
    }
  },{
    skip: !Boolean(clusterInfo)
  })

  const steps = [
    {
      title: $t({ defaultMessage: 'LAG' }),
      content: <LagForm />
    },
    {
      title: $t({ defaultMessage: 'Port General' }),
      content: <PortForm />
    },
    {
      title: $t({ defaultMessage: 'Cluster Virtual IP' }),
      content: <>Cluster Virtual IP</>
    },
    {
      title: $t({ defaultMessage: 'Summary' }),
      content: <>Summary</>
    }
  ]

  const handleFinish = async (value: unknown) => {
    // TODO
    console.log(value)
  }

  const handleCancel = () => {
    navigate(clusterListPage)
  }

  return (
    <StepsForm
      alert={alertData}
      onFinish={handleFinish}
      onCancel={handleCancel}
      initialValues={clusterNetworkSettings}
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