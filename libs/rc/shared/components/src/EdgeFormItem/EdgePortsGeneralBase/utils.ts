import { NamePath } from 'antd/lib/form/interface'
import _            from 'lodash'

import { EdgeLag, EdgePort, EdgePortTypeEnum, SubInterface } from '@acx-ui/rc/utils'

import { EdgePortConfigFormType } from '.'

export const getFieldFullPath = (
  interfaceName: string, fieldName: string, fieldHeadPath?: string[]) => {
  return (fieldHeadPath ?? [])
    .concat([interfaceName, '0', fieldName]) as NamePath
}

export const transformApiDataToFormListData =
(apiData: EdgePort[]): EdgePortConfigFormType => {
  const mapByIfName = _.keyBy(apiData, 'interfaceName')
  const formData:EdgePortConfigFormType = {}

  _.forEach(mapByIfName, (val, key) => {
    formData[key] = [val]
  })
  return formData
}
export const transformFormListDataToApiData =
(formData: EdgePortConfigFormType): EdgePort[] => {
  return _.flatMap(formData, (v) => v)
}

export const getEnabledCorePortInfo = (
  portsData: EdgePort[], lagData: EdgeLag[], subInterfaceData: SubInterface[]
) : {
    key: string | undefined,
    isLag: boolean,
    physicalPortId: string | undefined,
    isExistingCorePortInLagMember: boolean
  } => {
  const physicalCorePort = portsData.filter(item =>
    item.corePortEnabled && item.enabled && item.portType === EdgePortTypeEnum.LAN)
  const lagCorePort = lagData.filter(item =>
    item.corePortEnabled && item.lagEnabled && item.portType === EdgePortTypeEnum.LAN)
  const subInterfaceCorePort = subInterfaceData.find(item =>
    item.corePortEnabled && item.portType === EdgePortTypeEnum.LAN)
  const lagCorePortEnabled = lagCorePort[0]?.id !== undefined
  const corePortKey = physicalCorePort[0]?.interfaceName ||
    (lagCorePort[0]?.id !== undefined && lagCorePort[0]?.id + '') ||
    subInterfaceCorePort?.interfaceName
  const isLag = physicalCorePort[0]?.interfaceName ? false : lagCorePort[0]?.id !== undefined
  const physicalCorePortId = isLag ? undefined : physicalCorePort[0]?.id
  const isExistingCorePortInLagMember = lagData?.some(lag => lag.lagMembers
    ? lag.lagMembers.filter(member => member?.portId === physicalCorePortId).length > 0
    : false) ?? false

  return {
    key: isExistingCorePortInLagMember
      ? (lagCorePortEnabled ? (lagCorePort[0].id + '') : undefined)
      : corePortKey,
    isLag: isExistingCorePortInLagMember ? lagCorePortEnabled : isLag,
    physicalPortId: isExistingCorePortInLagMember ? undefined : physicalCorePortId,
    isExistingCorePortInLagMember
  }
}


export const getEnabledAccessPortInfo = (
  portsData: EdgePort[], lagData: EdgeLag[], subInterfaceData: SubInterface[]
) : {
    key: string | undefined
  } => {
  const lagMemberIds = lagData.flatMap(lag => lag.lagMembers?.map(member => member.portId))
  const physicalAccessPort = portsData.find(item =>
    item.accessPortEnabled && item.enabled && item.portType === EdgePortTypeEnum.LAN &&
    !lagMemberIds.includes(item.id))
  const lagAccessPort = lagData.find(item =>
    item.accessPortEnabled && item.lagEnabled && item.portType === EdgePortTypeEnum.LAN)
  const subInterfaceAccessPort = subInterfaceData.find(item =>
    item.accessPortEnabled && item.portType === EdgePortTypeEnum.LAN)
  const accessPortKey = physicalAccessPort?.interfaceName || lagAccessPort?.id ||
    subInterfaceAccessPort?.interfaceName

  return {
    key: accessPortKey !== undefined ? (accessPortKey + '') : accessPortKey
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