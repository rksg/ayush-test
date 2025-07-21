import { useContext, useMemo } from 'react'

import { Form, Space, Typography } from 'antd'
import { useIntl }                 from 'react-intl'

import { useStepFormContext }     from '@acx-ui/components'
import { Features }               from '@acx-ui/feature-toggle'
import { NodesTabs, TypeForm }    from '@acx-ui/rc/components'
import {
  validateCoreAndAccessPortsConfiguration, validateEdgeClusterLevelGateway,
  useIsEdgeFeatureReady,
  EdgePort, EdgeLag, SubInterface, EdgeSerialNumber, EdgePortInfo,
  convertInterfaceDataToEdgePortInfo,
  doEdgeNetworkInterfacesDryRun
} from '@acx-ui/rc/utils'

import { ClusterConfigWizardContext } from '../ClusterConfigWizardDataProvider'
import { SubInterfaceSettingsForm }   from '../SubInterfaceSettings/SubInterfaceSettingsForm'

import { StyledHiddenFormItem }                                from './styledComponents'
import { InterfaceSettingsFormType }                           from './types'
import { getAllPhysicalInterfaceData, getAllSubInterfaceData } from './utils'

export const SubInterfaceForm = () => {
  const { $t } = useIntl()

  const header = <Space direction='vertical' size={5}>
    <Typography.Title level={2}>
      {$t({ defaultMessage: 'Sub-interface Settings' })}
    </Typography.Title>
    <Typography.Text>
      {$t({ defaultMessage: `Create and configure the sub-interfaces
        for all Edges in this cluster:` })}
    </Typography.Text>
  </Space>

  const content = <SubInterfaceSettingView />

  return <TypeForm
    header={header}
    content={content}
  />
}

const SubInterfaceSettingView = () => {
  const {
    clusterInfo,
    clusterNetworkSettings,
    isSupportAccessPort
  } = useContext(ClusterConfigWizardContext)
  const { form } = useStepFormContext()
  const isDualWanEnabled = useIsEdgeFeatureReady(Features.EDGE_DUAL_WAN_TOGGLE)
  // eslint-disable-next-line max-len
  const isEdgeCoreAccessSeparationReady = useIsEdgeFeatureReady(Features.EDGE_CORE_ACCESS_SEPARATION_TOGGLE)
  Form.useWatch('portSubInterfaces', form)
  Form.useWatch('lagSubInterfaces', form)

  // eslint-disable-next-line max-len
  const portSettings = form.getFieldValue('portSettings') as InterfaceSettingsFormType['portSettings']
  const lagSettings = form.getFieldValue('lagSettings') as InterfaceSettingsFormType['lagSettings']

  // eslint-disable-next-line max-len
  const portSubInterfaceSettings = form.getFieldValue('portSubInterfaces') as InterfaceSettingsFormType['portSubInterfaces']
  // eslint-disable-next-line max-len
  const lagSubInterfaceSettings = form.getFieldValue('lagSubInterfaces') as InterfaceSettingsFormType['lagSubInterfaces']

  const {
    allPortsData,
    allLagsData,
    allSubInterfaceData,
    allInterfaceMap
  } = useMemo(() => {
    // eslint-disable-next-line max-len
    const { ports: nodePortsMap, lags: nodeLagsMap } = getAllPhysicalInterfaceData(portSettings, lagSettings)
    // eslint-disable-next-line max-len
    const nodeSubInterfacesMap = getAllSubInterfaceData(portSubInterfaceSettings, lagSubInterfaceSettings)

    const allPortsData: EdgePort[] = []
    const allLagsData: EdgeLag[] = []
    const allSubInterfaceData: SubInterface[] = []
    const allInterfaceMap: Record<EdgeSerialNumber, EdgePortInfo[]> = {}

    // loop each entries of nodePortsMap to concat their values into corresponding new array
    Object.entries(nodePortsMap).forEach(([edgeId, ports]) => {
      const {
        ports: dryRunPorts,
        lags: dryRunLags,
        subInterfaces: dryRunSubInterfaces
      // eslint-disable-next-line max-len
      } = doEdgeNetworkInterfacesDryRun(nodeLagsMap[edgeId], ports, nodeSubInterfacesMap[edgeId], isEdgeCoreAccessSeparationReady)

      allPortsData.push(...dryRunPorts)
      allLagsData.push(...dryRunLags)
      allSubInterfaceData.push(...dryRunSubInterfaces)

      const {
        ports: portsInfo,
        lags: lagsInfo
      } = convertInterfaceDataToEdgePortInfo(edgeId, dryRunLags, dryRunPorts)

      allInterfaceMap[edgeId] = [...portsInfo, ...lagsInfo]
    })

    return {
      allPortsData,
      allLagsData,
      allSubInterfaceData,
      allInterfaceMap
    }
  }, [portSettings, lagSettings, portSubInterfaceSettings, lagSubInterfaceSettings])


  return <>
    <StyledHiddenFormItem
      name='clusterGatewayValidate'
      rules={[
        {
          validator: () => validateEdgeClusterLevelGateway(
            allPortsData, allLagsData, allSubInterfaceData,
            clusterInfo?.edgeList ?? [], isDualWanEnabled, isEdgeCoreAccessSeparationReady
          )
        },
        {
          validator: () => validateCoreAndAccessPortsConfiguration(
            allPortsData, allLagsData, allSubInterfaceData
          )
        }
      ]}
      children={<input hidden/>}
      validateFirst
    />
    <NodesTabs
      nodeList={clusterInfo?.edgeList}
      content={
        (serialNumber) => {
          // eslint-disable-next-line max-len
          const originalPortData = clusterNetworkSettings?.portSettings.find(item => item.serialNumber === serialNumber)?.ports
          // eslint-disable-next-line max-len
          const originalLagData = clusterNetworkSettings?.lagSettings.find(item => item.serialNumber === serialNumber)?.lags
          return <SubInterfaceSettingsForm
            serialNumber={serialNumber}
            ports={clusterNetworkSettings?.portSettings
              ?.find(settings => settings.serialNumber === serialNumber)
              ?.ports ?? []
            }
            portStatus={allInterfaceMap[serialNumber]?.filter(item => !item.isLag)}
            lagStatus={allInterfaceMap[serialNumber]?.filter(item => item.isLag)}
            isSupportAccessPort={isSupportAccessPort}
            originalInterfaceData={{
              portSettings: originalPortData,
              lagSettings: originalLagData
            }}
          />
        }
      }
    />
  </>
}
