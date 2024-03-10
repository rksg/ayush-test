import { useContext, useState } from 'react'

import { Form, Space, Typography } from 'antd'
import { FormInstance }            from 'antd/es/form/Form'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader, useStepFormContext }                                     from '@acx-ui/components'
import { Features, useIsSplitOn }                                         from '@acx-ui/feature-toggle'
import { EdgePortsGeneralBase, NodesTabs, TypeForm }                      from '@acx-ui/rc/components'
import { useGetEdgeSdLanP2ViewDataListQuery, useGetEdgesPortStatusQuery } from '@acx-ui/rc/services'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { InterfaceSettingsFormType } from '.'

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
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)
  const { form } = useStepFormContext<InterfaceSettingsFormType>()

  const { clusterInfo } = useContext(ClusterConfigWizardContext)
  const [activeTab, setActiveTab] = useState<string>('')
  const nodesLagData = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
  const { data: portsStatus, isFetching } = useGetEdgesPortStatusQuery({
    payload: {
      edgeIds: clusterInfo?.edgeList?.map(node => node.serialNumber)
    }
  }, {
    skip: !Boolean(clusterInfo?.edgeList?.length)
  })

  const { edgeSdLanData, isEdgeSdLanFetching }
    = useGetEdgeSdLanP2ViewDataListQuery(
      { payload: {
        filters: { edgeClusterId: [clusterInfo?.clusterId] },
        fields: ['id', 'edgeClusterId']
      } },
      {
        skip: !isEdgeSdLanHaReady,
        selectFromResult: ({ data, isFetching }) => ({
          edgeSdLanData: data?.data?.[0],
          isEdgeSdLanFetching: isFetching
        })
      }
    )

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Loader states={[{
      isLoading: isEdgeSdLanFetching || !clusterInfo || isFetching
    }]}>
      <NodesTabs
        nodeList={clusterInfo?.edgeList}
        content={
          (serialNumber) => {
            const portsConfigs = _.get(portSettings, [serialNumber])
            const lagData = _.get(nodesLagData, [serialNumber])


            // only display when portConfig has data
            return portsConfigs
              ? <EdgePortsGeneralBase<InterfaceSettingsFormType>
                form={form}  // configWizard's formInstance
                lagData={lagData}
                statusData={portsStatus?.[serialNumber] ?? []}
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