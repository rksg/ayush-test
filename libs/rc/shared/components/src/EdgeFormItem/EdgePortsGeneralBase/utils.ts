import { NamePath } from 'antd/lib/form/interface'
import _            from 'lodash'

import { EdgeLag, EdgePort, EdgePortTypeEnum } from '@acx-ui/rc/utils'

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

export const getEnabledCorePortInfo = (portsData: EdgePort[], lagData: EdgeLag[]) : {
    key: string | undefined,
    isLag: boolean,
    physicalPortId: string | undefined,
    isExistingCorePortInLagMember: boolean
  } => {
  const physicalCorePort = portsData.filter(item =>
    item.corePortEnabled && item.enabled && item.portType === EdgePortTypeEnum.LAN)
  const lagCorePort = lagData.filter(item =>
    item.corePortEnabled && item.lagEnabled && item.portType === EdgePortTypeEnum.LAN)
  const lagCorePortEnabled = lagCorePort[0]?.id !== undefined
  const corePortKey = physicalCorePort[0]?.interfaceName || lagCorePort[0]?.id
  const isLag = physicalCorePort[0]?.interfaceName ? false : lagCorePort[0]?.id !== undefined
  const physicalCorePortId = isLag ? undefined : physicalCorePort[0]?.id

  const isExistingCorePortInLagMember = lagData?.some(lag => lag.lagMembers
    ? lag.lagMembers.filter(member => member?.portId === physicalCorePortId).length > 0
    : false) ?? false

  return {
    key: isExistingCorePortInLagMember
      ? (lagCorePortEnabled ? (lagCorePort[0].id + '') : undefined)
      : (corePortKey !== undefined ? (corePortKey+'') : corePortKey),
    isLag: isExistingCorePortInLagMember ? lagCorePortEnabled : isLag,
    physicalPortId: isExistingCorePortInLagMember ? undefined : physicalCorePortId,
    isExistingCorePortInLagMember
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