import { useContext, useEffect, useMemo, useState } from 'react'

import { Form, Space, Typography } from 'antd'
import _, { flatten }              from 'lodash'
import { useIntl }                 from 'react-intl'

import { Loader, useStepFormContext }                from '@acx-ui/components'
import { Features }                                  from '@acx-ui/feature-toggle'
import { EdgePortsGeneralBase, NodesTabs, TypeForm } from '@acx-ui/rc/components'
import {
  validateEdgeClusterLevelGateway,
  EdgePort, EdgeLag, SubInterface,
  useIsEdgeFeatureReady,
  natPoolRangeClusterLevelValidator,
  edgeWanSyncIpModeValidator
} from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'

import { StyledHiddenFormItem }                                           from './styledComponents'
import { InterfaceSettingFormStepCommonProps, InterfaceSettingsFormType } from './types'
import { getAllPhysicalInterfaceFormData }                                from './utils'

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
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  const isMultiNatIpEnabled = useIsEdgeFeatureReady(Features.EDGE_MULTI_NAT_IP_TOGGLE)

  const { form } = useStepFormContext<InterfaceSettingsFormType>()
  const {
    clusterInfo,
    portsStatus,
    edgeSdLanData,
    isSupportAccessPort,
    isFetching,
    clusterNetworkSettings
  } = useContext(ClusterConfigWizardContext)
  const [activeTab, setActiveTab] = useState<string>('')
  const nodesLagData = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']
  const vipConfig = form.getFieldValue('vipConfig') as InterfaceSettingsFormType['vipConfig']
  const timeout = form.getFieldValue('timeout')
  // eslint-disable-next-line max-len
  const portSubInterfaces = form.getFieldValue('portSubInterfaces') as InterfaceSettingsFormType['portSubInterfaces']
  // eslint-disable-next-line max-len
  const lagSubInterfaces = form.getFieldValue('lagSubInterfaces') as InterfaceSettingsFormType['lagSubInterfaces']

  const allSubInterfaceMap = useMemo(() => {
    const subInterfaceMap = {} as {
        [serialNumber: string]: {
          portSubInterface?: { [portId: string]: SubInterface[] }
          lagSubInterface?: { [lagId: string]: SubInterface[] }
        }
      }
    Object.entries(portSubInterfaces ?? {}).forEach(([serialNumber, portSubInterface]) => {
      subInterfaceMap[serialNumber] = { portSubInterface }
    })
    Object.entries(lagSubInterfaces ?? {}).forEach(([serialNumber, lagSubInterface]) => {
      subInterfaceMap[serialNumber] = { ...subInterfaceMap[serialNumber], lagSubInterface }
    })
    return subInterfaceMap
  }, [portSubInterfaces, lagSubInterfaces])

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
      {
        !isEdgeCoreAccessSeparationReady &&
        <StyledHiddenFormItem
          name='clusterLevelValidate'
          rules={[
            { validator: async () => {
              // eslint-disable-next-line max-len
              const allPortsValues = portSettings ? Object.values(portSettings).flatMap(port => Object.values(port)):[]
              const allLagsValues = nodesLagData.map(lag => lag.lags)
              const allPortsData = _.flatten(allPortsValues) as EdgePort[]
              const allLagsData =_.flatten(allLagsValues) as EdgeLag[]

              return validateEdgeClusterLevelGateway(
                allPortsData, allLagsData ?? [], [],
                clusterInfo?.edgeList ?? [], isDualWanEnabled, isEdgeCoreAccessSeparationReady)
            } }
          ]}
          children={<input hidden/>}
        />
      }
      <NodesTabs
        nodeList={clusterInfo?.edgeList}
        content={
          (serialNumber) => {
            const portsConfigs = _.get(portSettings, [serialNumber])
            const lagData = _.find(nodesLagData, { serialNumber })?.lags
            // eslint-disable-next-line max-len
            const lagMemberIds = lagData?.map(lag => lag.lagMembers.map(member => member.portId)).flat()
            // eslint-disable-next-line max-len
            const portSubInterfaceList = Object.entries(allSubInterfaceMap?.[serialNumber]?.portSubInterface ?? {})
              .flatMap(([portId, subInterfaceList]) => {
                return lagMemberIds?.includes(portId) ? [] : subInterfaceList
              })
            // eslint-disable-next-line max-len
            const lagSubInterfaceList = Object.entries(allSubInterfaceMap?.[serialNumber]?.lagSubInterface ?? {})
              .flatMap(([lagId, subInterfaceList]) => {
                return lagData?.some(lag => String(lag.id) === lagId) ? subInterfaceList : []
              })
            const allSubInterface = portSubInterfaceList.concat(lagSubInterfaceList)
            // eslint-disable-next-line max-len
            const originalPortData = clusterNetworkSettings?.portSettings.find(item => item.serialNumber === serialNumber)?.ports
            // eslint-disable-next-line max-len
            const originalLagData = clusterNetworkSettings?.lagSettings.find(item => item.serialNumber === serialNumber)?.lags

            // only display when portConfig has data
            return portsConfigs
              ? <EdgePortsGeneralBase
                serialNumber={serialNumber}
                lagData={lagData}
                statusData={portsStatus?.[serialNumber]}
                isEdgeSdLanRun={!!edgeSdLanData}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                fieldHeadPath={['portSettings', serialNumber]}
                vipConfig={vipConfigArr}
                subInterfaceList={allSubInterface}
                isClusterWizard
                clusterInfo={clusterInfo!}
                isSupportAccessPort={isSupportAccessPort}
                formFieldsProps={{
                  ipMode: {
                    rules: isDualWanEnabled
                      // eslint-disable-next-line max-len
                      ? [{ validator: () => {
                        const portData = flatten(Object.values(portsConfigs))
                        return edgeWanSyncIpModeValidator(portData, lagData ?? [])
                      } }]
                      : []
                  },
                  natStartIp: {
                    rules: isMultiNatIpEnabled
                      ? [{ validator: () => {
                        // eslint-disable-next-line max-len
                        const { ports: allPortsData, lags: allLagsData } = getAllPhysicalInterfaceFormData(form)
                        // eslint-disable-next-line max-len
                        return natPoolRangeClusterLevelValidator(allPortsData, allLagsData, clusterInfo?.edgeList)
                      } }] : []
                  }
                }}
                originalInterfaceData={{
                  portSettings: originalPortData,
                  lagSettings: originalLagData
                }}
              />
              : <div />
          }
        }
      />
    </Loader>
  )
}
