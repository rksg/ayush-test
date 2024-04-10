import { useContext, useState } from 'react'

import { Form, Space, Typography } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader, useStepFormContext }                from '@acx-ui/components'
import { EdgePortsGeneralBase, NodesTabs, TypeForm } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { InterfaceSettingsFormType } from './types'

export const PortForm = () => {
  const { $t } = useIntl()
  const { clusterInfo } = useContext(ClusterConfigWizardContext)

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Port General Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Configure the port general settings for 
      all SmartEdges in this cluster ({clusterName}):` },
      { clusterName: clusterInfo?.name })}
    </Typography.Text>
  </Space>


  const content = <Form.Item name='portSettings'>
    <PortSettingView />
  </Form.Item>

  return (
    <TypeForm
      header={header}
      content={content}
    />
  )
}

interface PortSettingViewProps {
  value?: InterfaceSettingsFormType['portSettings']
}

const PortSettingView = (props: PortSettingViewProps) => {
  const { value: portSettings } = props
  const { form } = useStepFormContext<InterfaceSettingsFormType>()
  const {
    clusterInfo,
    portsStatus,
    edgeSdLanData,
    isFetching
  } = useContext(ClusterConfigWizardContext)
  const [activeTab, setActiveTab] = useState<string>('')
  const nodesLagData = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Loader states={[{
      isLoading: isFetching || !clusterInfo
    }]}>
      <NodesTabs
        nodeList={clusterInfo?.edgeList}
        content={
          (serialNumber) => {
            const portsConfigs = _.get(portSettings, [serialNumber])
            const lagData = _.find(nodesLagData, { serialNumber })?.lags

            // only display when portConfig has data
            return portsConfigs
              ? <EdgePortsGeneralBase
                lagData={lagData}
                statusData={portsStatus?.[serialNumber]}
                isEdgeSdLanRun={!!edgeSdLanData}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                fieldHeadPath={['portSettings', serialNumber]}
              />
              : <div />
          }
        }
      />
    </Loader>
  )
}