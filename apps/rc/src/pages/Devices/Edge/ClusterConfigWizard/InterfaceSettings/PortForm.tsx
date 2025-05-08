import { useContext, useEffect, useState } from 'react'

import { Form, Space, Typography } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader, useStepFormContext }                                       from '@acx-ui/components'
import { Features }                                                         from '@acx-ui/feature-toggle'
import { EdgePortsGeneralBase, NodesTabs, TypeForm, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import { validateEdgeClusterLevelGateway, EdgePort, EdgeLag }               from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { StyledHiddenFormItem }                                           from './styledComponents'
import { InterfaceSettingFormStepCommonProps, InterfaceSettingsFormType } from './types'

export const PortForm = ({ onInit }: InterfaceSettingFormStepCommonProps) => {
  const { $t } = useIntl()

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Port General Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Configure the port general settings for 
      all RUCKUS Edges in this cluster:` })}
    </Typography.Text>
  </Space>


  const content = <Form.Item name='portSettings'>
    <PortSettingView />
  </Form.Item>

  useEffect(() => onInit?.(), [onInit])

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
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)

  const { form } = useStepFormContext<InterfaceSettingsFormType>()
  const {
    clusterInfo,
    portsStatus,
    edgeSdLanData,
    isFetching
  } = useContext(ClusterConfigWizardContext)
  const [activeTab, setActiveTab] = useState<string>('')
  const nodesLagData = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
  const vipConfig = form.getFieldValue('vipConfig') as InterfaceSettingsFormType['vipConfig']
  const timeout = form.getFieldValue('timeout')
  const vipConfigArr = vipConfig?.map(item => ({
    virtualIp: item.vip,
    ports: item.interfaces,
    timeoutSeconds: timeout
  }))

  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  return (
    <Loader states={[{
      isLoading: isFetching || !clusterInfo
    }]}>
      <StyledHiddenFormItem
        name='clusterGatewayValidate'
        rules={[
          { validator: () => {
            // eslint-disable-next-line max-len
            const allPortsValues = portSettings?Object.values(portSettings).flatMap(port => Object.values(port)):[]
            const allLagsValues = nodesLagData.map(lag => lag.lags)
            const allPortsData = _.flatten(allPortsValues) as EdgePort[]
            const allLagsData =_.flatten(allLagsValues) as EdgeLag[]
            // eslint-disable-next-line max-len
            return validateEdgeClusterLevelGateway(allPortsData, allLagsData ?? [], clusterInfo?.edgeList ?? [], isDualWanEnabled)
          } }
        ]}
        children={<input hidden/>}
      />
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
                vipConfig={vipConfigArr}
                isClusterWizard
                clusterInfo={clusterInfo!}
              />
              : <div />
          }
        }
      />
    </Loader>
  )
}