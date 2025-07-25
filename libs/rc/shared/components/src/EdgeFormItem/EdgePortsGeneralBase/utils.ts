import { NamePath }                       from 'antd/lib/form/interface'
import { flatMap, forEach, isNil, keyBy } from 'lodash'

import {
  doEdgeNetworkInterfacesDryRun,
  EdgeLag, EdgePort, EdgePortTypeEnum, SubInterface
} from '@acx-ui/rc/utils'

import { EdgePortConfigFormType } from '.'

export const getFieldFullPath = (
  interfaceName: string, fieldName: string, fieldHeadPath?: string[]) => {
  return (fieldHeadPath ?? [])
    .concat([interfaceName, '0', fieldName]) as NamePath
}

export const transformApiDataToFormListData =
(apiData: EdgePort[]): EdgePortConfigFormType => {
  const mapByIfName = keyBy(apiData, 'interfaceName')
  const formData:EdgePortConfigFormType = {}

  forEach(mapByIfName, (val, key) => {
    formData[key] = [val]
  })
  return formData
}
export const transformFormListDataToApiData =
(formData: EdgePortConfigFormType): EdgePort[] => {
  return flatMap(formData, (v) => v)
}

export const getEnabledCorePortInfo = (
  portsData: EdgePort[], lagData: EdgeLag[], subInterfaceData: SubInterface[],
  isEdgeCoreAccessSeparationReady: boolean
) : {
    key: string | undefined,
  } => {

  const {
    lags: resolvedLags,
    ports: resolvedPorts,
    subInterfaces: resolvedSubInterfaces
    // eslint-disable-next-line max-len
  } = doEdgeNetworkInterfacesDryRun(lagData, portsData, subInterfaceData, isEdgeCoreAccessSeparationReady)

  const physicalCorePort = resolvedPorts.filter(item =>
    item.corePortEnabled && item.enabled && item.portType === EdgePortTypeEnum.LAN)
  const lagCorePort = resolvedLags.filter(item =>
    item.corePortEnabled && item.lagEnabled && item.portType === EdgePortTypeEnum.LAN)
  const subInterfaceCorePort = resolvedSubInterfaces.find(item =>
    item.corePortEnabled && item.portType === EdgePortTypeEnum.LAN)

  const corePortKey = physicalCorePort[0]?.interfaceName ||
    (!isNil(lagCorePort[0]?.id) && lagCorePort[0]?.id + '') ||
    subInterfaceCorePort?.interfaceName

  return {
    key: corePortKey
  }
}


export const getEnabledAccessPortInfo = (
  portsData: EdgePort[], lagData: EdgeLag[], subInterfaceData: SubInterface[],
  isEdgeCoreAccessSeparationReady: boolean

) : {
    key: string | undefined
  } => {
  const {
    lags: resolvedLags,
    ports: resolvedPorts,
    subInterfaces: resolvedSubInterfaces
    // eslint-disable-next-line max-len
  } = doEdgeNetworkInterfacesDryRun(lagData, portsData, subInterfaceData, isEdgeCoreAccessSeparationReady)

  const physicalAccessPort = resolvedPorts.find(item =>
    item.accessPortEnabled && item.enabled && item.portType === EdgePortTypeEnum.LAN)
  const lagAccessPort = resolvedLags.find(item =>
    item.accessPortEnabled && item.lagEnabled && item.portType === EdgePortTypeEnum.LAN)
  const subInterfaceAccessPort = resolvedSubInterfaces.find(item =>
    item.accessPortEnabled && item.portType === EdgePortTypeEnum.LAN)

  const accessPortKey = physicalAccessPort?.interfaceName ||
    (!isNil(lagAccessPort?.id) && lagAccessPort?.id + '') ||
    subInterfaceAccessPort?.interfaceName

  return {
    key: accessPortKey
  }
}

export const isWANPortExist = (portsData: EdgePort[],
  lagData: EdgeLag[]): boolean => {
  const portWAN = portsData.filter(port =>
    port.enabled && port.portType === EdgePortTypeEnum.WAN
  ).length > 0

  const lagWAN = lagData.filter(lag =>
    lag.lagEnabled && lag.portType === EdgePortTypeEnum.WAN
  ).length > 0
  return portWAN || lagWAN
}