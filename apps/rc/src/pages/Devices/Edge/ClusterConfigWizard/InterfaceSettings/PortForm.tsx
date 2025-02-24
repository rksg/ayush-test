import { useContext, useEffect, useMemo, useState } from 'react'

import { Form, Space, Typography } from 'antd'
import _                           from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader, useStepFormContext }                from '@acx-ui/components'
import { EdgePortsGeneralBase, NodesTabs, TypeForm } from '@acx-ui/rc/components'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

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
  // eslint-disable-next-line max-len
  const portSubInterfaces = form.getFieldValue('portSubInterfaces') as InterfaceSettingsFormType['portSubInterfaces']
  // eslint-disable-next-line max-len
  const lagSubInterfaces = form.getFieldValue('lagSubInterfaces') as InterfaceSettingsFormType['lagSubInterfaces']

  const allSubInterface = useMemo(() =>[
    ...Object.values(portSubInterfaces ?? {}).flat().flatMap(item => Object.values(item)).flat(),
    ...Object.values(lagSubInterfaces ?? {}).flat().flatMap(item => Object.values(item)).flat()
  ], [portSubInterfaces, lagSubInterfaces])

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
                subInterfaceList={allSubInterface}
              />
              : <div />
          }
        }
      />
    </Loader>
  )
}