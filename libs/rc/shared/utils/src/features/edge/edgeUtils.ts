/* eslint-disable max-len */
import { DefaultOptionType }                    from 'antd/lib/select'
import _, { difference, flatMap, isNil, sumBy } from 'lodash'
import { IntlShape }                            from 'react-intl'

import { getIntl, validationMessages } from '@acx-ui/utils'

import { IpUtilsService }                                                          from '../../ipUtilsService'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeServiceStatusEnum, EdgeStatusEnum } from '../../models/EdgeEnum'
import {
  ApCompatibility,
  ApIncompatibleDevice,
  ClusterNetworkSettings,
  EdgeAlarmSummary,
  EdgeIncompatibleFeature,
  EdgeIncompatibleFeatureV1_1,
  EdgeLag,
  EdgeLagStatus,
  EdgeNatPool,
  EdgePort,
  EdgePortStatus,
  EdgePortWithStatus,
  EdgeSdLanApCompatibility,
  EdgeSerialNumber,
  EdgeServiceApCompatibility,
  EdgeServiceCompatibility,
  EdgeServiceCompatibilityV1_1,
  EdgeStatus,
  EdgeSubInterface,
  EntityCompatibility,
  EntityCompatibilityV1_1,
  VenueSdLanApCompatibility
} from '../../types'
import { convertIpToLong, countIpSize, isSubnetOverlap, networkWifiIpRegExp, subnetMaskIpRegExp } from '../../validator'

const Netmask = require('netmask').Netmask
const vSmartEdgeSerialRegex = '96[0-9A-Z]{32}'
const physicalSmartEdgeSerialRegex = '(9[1-9]|[1-4][0-9]|5[0-3])\\d{10}'
export const MAX_DUAL_WAN_PORT = 2
export const MAX_NAT_POOL_TOTAL_SIZE = 128

export const edgePhysicalPortInitialConfigs = {
  portType: EdgePortTypeEnum.UNCONFIGURED,
  ipMode: EdgeIpModeEnum.DHCP,
  ip: '',
  subnet: '',
  gateway: '',
  enabled: true,
  natEnabled: true,
  corePortEnabled: false
}

export const getEdgeServiceHealth = (alarmSummary?: EdgeAlarmSummary[]) => {
  if(!alarmSummary) return EdgeServiceStatusEnum.UNKNOWN

  const hasAlarm = alarmSummary.some(item => (item?.totalCount ?? 0) > 0)
  if(!hasAlarm) return EdgeServiceStatusEnum.GOOD

  const hasCriticalAlarm = alarmSummary.some(item => (item?.severitySummary?.critical ?? 0) > 0)
  if(hasCriticalAlarm) return EdgeServiceStatusEnum.POOR

  const hasMajorAlarm = alarmSummary.some(item => (item?.severitySummary?.major ?? 0) > 0)
  if(hasMajorAlarm) return EdgeServiceStatusEnum.REQUIRES_ATTENTION

  return EdgeServiceStatusEnum.UNKNOWN
}

export const allowRebootShutdownForStatus = (edgeStatus: string) => {
  const stringStatus: string[] = rebootShutdownEdgeStatusWhiteList
  return stringStatus.includes(edgeStatus)
}

export const allowResetForStatus = (edgeStatus: string) => {
  const stringStatus: string[] = resettableEdgeStatuses
  return stringStatus.includes(edgeStatus)
}

export const allowSendOtpForStatus = (edgeStatus: string) => {
  const stringStatus: string[] = unconfiguredEdgeStatuses
  return stringStatus.includes(edgeStatus)
}

export const allowSendFactoryResetStatus = (edgeStatus: string) => {
  const stringStatus: string[] = rebootShutdownEdgeStatusWhiteList
  return stringStatus.includes(edgeStatus)
}

export const rebootShutdownEdgeStatusWhiteList = [
  EdgeStatusEnum.OPERATIONAL,
  EdgeStatusEnum.APPLYING_CONFIGURATION,
  EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED,
  EdgeStatusEnum.FIRMWARE_UPDATE_FAILED]

export const resettableEdgeStatuses = rebootShutdownEdgeStatusWhiteList

export const unconfiguredEdgeStatuses = [EdgeStatusEnum.NEVER_CONTACTED_CLOUD]

export async function edgePortIpValidator (ip: string, subnetMask: string) {
  const { $t } = getIntl()

  try {
    await networkWifiIpRegExp(ip)
  } catch (error) {
    return Promise.reject(error)
  }

  if (await isSubnetAvailable(subnetMask) && IpUtilsService.isBroadcastAddress(ip, subnetMask)) {
    return Promise.reject($t(validationMessages.switchBroadcastAddressInvalid))
  } else {
    // If the subnet is unavailable, either because it's empty or invalid, there's no need to validate broadcast IP further
    return Promise.resolve()
  }
}

async function isSubnetAvailable (subnetMask: string) {
  if (!subnetMask) {
    return false
  }

  try {
    await subnetMaskIpRegExp(subnetMask)
    return true
  } catch {
    return false
  }
}

export const getEdgePortTypeOptions = ($t: IntlShape['$t']) => ([
  {
    label: $t({ defaultMessage: 'Select port type..' }),
    value: EdgePortTypeEnum.UNCONFIGURED
  },
  {
    label: $t({ defaultMessage: 'WAN' }),
    value: EdgePortTypeEnum.WAN
  },
  {
    label: $t({ defaultMessage: 'LAN' }),
    value: EdgePortTypeEnum.LAN
  },
  {
    label: $t({ defaultMessage: 'Cluster' }),
    value: EdgePortTypeEnum.CLUSTER
  }
])

export const getEdgePortIpModeString = ($t: IntlShape['$t'], type: EdgeIpModeEnum | string) => {
  switch (type) {
    case EdgeIpModeEnum.DHCP:
      return $t({ defaultMessage: 'DHCP' })
    case EdgeIpModeEnum.STATIC:
      return $t({ defaultMessage: 'Static IP' })
    default:
      return ''
  }
}

// eslint-disable-next-line max-len
export const convertEdgeNetworkIfConfigToApiPayload = (formData: EdgePortWithStatus | EdgeLag | EdgeSubInterface) => {
  const payload = _.cloneDeep(formData)

  switch (payload.portType) {
    case EdgePortTypeEnum.WAN:
      payload.corePortEnabled = false
      break
    case EdgePortTypeEnum.LAN:
      // normal(non-corePort) LAN port
      if (payload.corePortEnabled === false) {

        // should clear all non core port LAN port's gateway.
        if (payload.gateway) {
          payload.gateway = ''
        }

        // prevent LAN port from using DHCP
        // when it had been core port before but not a core port now.
        if (payload.ipMode === EdgeIpModeEnum.DHCP) {
          payload.ipMode = EdgeIpModeEnum.STATIC
        }
      }
      break
    case EdgePortTypeEnum.UNCONFIGURED:
      payload.ipMode = EdgeIpModeEnum.DHCP
      break
    default:
      break
  }

  if (payload.ipMode === EdgeIpModeEnum.DHCP || payload.portType === EdgePortTypeEnum.CLUSTER) {
    payload.gateway = ''
  }

  // prevent DHCP mode from having IP and subnet
  if (payload.ipMode === EdgeIpModeEnum.DHCP) {
    if (payload.ip) payload.ip = ''
    if (payload.subnet) payload.subnet = ''
  }

  // disable NAT if port type is not WAN
  if (payload.portType !== EdgePortTypeEnum.WAN) {
    payload.natEnabled = false
  }

  // clear NAT pools if NAT is disabled or port type is not WAN
  if (payload.natEnabled === false || payload.portType !== EdgePortTypeEnum.WAN) {
    payload.natPools = []
  } else {
    if (payload.natPools?.length) {
      payload.natPools = payload.natPools.filter((natPool) => {
        // would be null when no existing NAT pool
        return natPool?.startIpAddress && natPool?.endIpAddress
      })
    }
  }

  return payload
}

export const convertEdgeSubInterfaceToApiPayload = (formData: EdgeSubInterface) => {
  const payload = { ...formData }
  if (payload.ipMode === EdgeIpModeEnum.DHCP) {
    if (payload.ip) payload.ip = ''
    if (payload.subnet) payload.subnet = ''
  }

  return payload
}

export const getEdgePortDisplayName = (port: EdgePort | EdgePortStatus | undefined) => {
  return _.capitalize(port?.interfaceName)
}

export const isEdgeLag = (port: EdgePortStatus | EdgePort | EdgeLagStatus | EdgeLag) => {
  return port.hasOwnProperty('lagType')
}

export const appendIsLagPortOnPortConfig =
  (portsData: EdgePortWithStatus[] | undefined,
    lags: EdgeLag[] | EdgeLagStatus[] | undefined) => {

    return portsData?.map((item) => {
      const isLagPort = lags?.some(lag =>
        lag.lagMembers?.some(lagMember =>
          lagMember.portId === item.id)) ?? false

      return { ...item, isLagPort }
    })
  }

export const isEdgeConfigurable = (data: EdgeStatus | undefined):boolean => {
  return data ? data.deviceStatus !== EdgeStatusEnum.NEVER_CONTACTED_CLOUD : false
}

export const getIpWithBitMask = (ipAddress?: string, subnetMask?: string) => {
  if(!ipAddress || !subnetMask) return ''
  if(ipAddress.includes('/')) return ipAddress
  const subnetInfo = new Netmask(ipAddress + '/' + subnetMask)
  return `${ipAddress}/ ${subnetInfo.bitmask}`
}

export const getSuggestedIpRange = (ipAddress?: string, subnetMask?: string) => {
  if(!ipAddress || !subnetMask) return ''
  if(ipAddress.includes('/')) return ipAddress
  const subnetInfo = new Netmask(ipAddress + '/' + subnetMask)
  return `${subnetInfo.base}/ ${subnetInfo.bitmask}`
}

export const edgeSerialNumberValidator = async (value: string) => {
  const { $t } = getIntl()
  if (!new RegExp(`^(${vSmartEdgeSerialRegex}|${physicalSmartEdgeSerialRegex})$`,'i').test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }
  return Promise.resolve()
}

export const isVirtualEdgeSerial = (value: string) => {
  return new RegExp(/^96[0-9A-Z]{32}$/i).test(value)
}

export const deriveEdgeModel = (serial: string) => {
  return isVirtualEdgeSerial(serial) ? 'vRUCKUS Edge' : '-'
}

export const isOtpEnrollmentRequired = (serial: string) => {
  return isVirtualEdgeSerial(serial)
}

export const optionSorter = (
  a: DefaultOptionType,
  b: DefaultOptionType
) => {
  if ( (a.label ?? '') < (b.label ?? '') ){
    return -1
  }
  if ( (a.label ?? '') > (b.label ?? '') ){
    return 1
  }
  return 0
}

export async function interfaceSubnetValidator (
  current: { ipMode: EdgeIpModeEnum, ip: string, subnetMask: string },
  allWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if (current.ipMode !== EdgeIpModeEnum.STATIC) {
    return Promise.resolve()
  }

  // eslint-disable-next-line max-len
  return lanPortSubnetValidator(current, allWithoutCurrent)
}

export async function lanPortSubnetValidator (
  currentSubnet: { ip: string, subnetMask: string },
  allSubnetWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if(!!!currentSubnet.ip || !!!currentSubnet.subnetMask) {
    return Promise.resolve()
  }

  for(let item of allSubnetWithoutCurrent) {
    try {
      await isSubnetOverlap(currentSubnet.ip, currentSubnet.subnetMask,
        item.ip, item.subnetMask)
    } catch (error) {
      return Promise.reject(error)
    }
  }
  return Promise.resolve()
}

const rangesOverlap = (range1: Omit<EdgeNatPool, 'id'>, range2: Omit<EdgeNatPool, 'id'>) => {
  const start1 = convertIpToLong(range1.startIpAddress)
  const end1 = convertIpToLong(range1.endIpAddress)
  const start2 = convertIpToLong(range2.startIpAddress)
  const end2 = convertIpToLong(range2.endIpAddress)

  return start1 <= end2 && start2 <= end1
}

export const poolRangeOverlapValidator = async (pools:
  { startIpAddress: string, endIpAddress: string }[] | undefined
) => {
  if (!pools?.length) {
    return Promise.resolve()
  }

  const { $t } = getIntl()

  // loop to check if range overlap
  for (let i=0; i < pools.length; i++) {
    if (!pools[i]) continue

    const start = convertIpToLong(pools[i].startIpAddress)
    const end = convertIpToLong(pools[i].endIpAddress)

    // check if the range is valid (ascending)
    if (start >= end) {
      // eslint-disable-next-line max-len
      return Promise.reject($t({ defaultMessage: 'Invalid NAT pool start IP and end IP' }))
    }

    for (let j=i+1; j < pools.length; j++) {
      if (i === pools.length - 1) break

      // check overlap
      if (rangesOverlap(pools[i], pools[j])) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'The selected NAT pool overlaps with other NAT pools' }))
      }
    }
  }

  return Promise.resolve()
}

export const natPoolSizeValidator = async (pools:
  Omit<EdgeNatPool, 'id'>[] | undefined
) => {
  if (!pools?.length) {
    return Promise.resolve()
  }

  const { $t } = getIntl()

  // total range cannot exceed 128 per node : MAX_NAT_POOL_TOTAL_SIZE
  const totalRange = pools?.reduce((acc: number, item) => {
    if (!item?.startIpAddress || !item?.endIpAddress) {
      return acc
    }
    const range = countIpSize(item.startIpAddress, item.endIpAddress)
    return acc += range
  }, 0) ?? 0

  // eslint-disable-next-line max-len
  return totalRange <= MAX_NAT_POOL_TOTAL_SIZE ? Promise.resolve() : Promise.reject($t({ defaultMessage: 'NAT IP address range exceeds maximum size {maxSize}' }, { maxSize: MAX_NAT_POOL_TOTAL_SIZE }))
}

export const validateSubnetIsConsistent = (
  allIps: { ip?: string, subnet?: string }[],
  value?: string
) => {
  if(!allIps || allIps.length < 2 || !value) return Promise.resolve()
  const { $t } = getIntl()
  for(let i=0; i<allIps.length; i++) {
    for(let j=i+1; j<allIps.length; j++) {
      if(i === allIps.length - 1) break
      const first = new Netmask(`${allIps[i].ip}/${allIps[i].subnet}`)
      const second = new Netmask(`${allIps[j].ip}/${allIps[j].subnet}`)
      if(first.first !== second.first || first.last !== second.last) {
        // eslint-disable-next-line max-len
        return Promise.reject($t({ defaultMessage: 'Use IP addresses in the same subnet for cluster interface on all the edges in this cluster.' }))
      }
    }
  }
  return Promise.resolve()
}

export const validateConfiguredSubnetIsConsistent = (
  allIps: { ip?: string, subnet?: string }[],
  value?: string
) => {
  const configuredIps = allIps.filter(ip => Boolean(ip.ip) && Boolean(ip.subnet))
  return validateSubnetIsConsistent(configuredIps, value)
}

const isUnique = (value: string, index: number, array: string[]) => {
  return array.indexOf(value) === array.lastIndexOf(value)
}

export const validateUniqueIp = (ips: string[], value?: string) => {
  if(!Boolean(value)) return Promise.resolve()
  const { $t } = getIntl()
  const configuredIps = ips.filter(ip => Boolean(ip))
  if(configuredIps.every(isUnique)) {
    return Promise.resolve()
  }
  return Promise.reject($t({ defaultMessage: 'IP address cannot be the same as other nodes.' }))
}

export const validateClusterInterface = (interfaceNames: string[]) => {
  if((interfaceNames?.length ?? 0) <= 1) return Promise.resolve()
  const { $t } = getIntl()
  for(let i=0; i<interfaceNames.length; i++){
    for(let j=i+1; j<interfaceNames.length; j++) {
      if (interfaceNames[i].charAt(0) !== interfaceNames[j].charAt(0)) {
        return Promise.reject(
          $t({ defaultMessage: `Make sure you select the same interface type
          (physical port or LAG) as that of another node in this cluster.` })
        )
      }
    }
  }
  return Promise.resolve()
}

export const isAllPortsLagMember = (portsData: EdgePort[], lagData: EdgeLag[]) => {
  const portIds = portsData.map(port => port.id)
  const lagMemberPortIds = flatMap(lagData, (lag => lag.lagMembers?.map(m => m.portId)))

  const isAllPortsLagMember = portIds.length && difference(portIds, lagMemberPortIds).length === 0
  return isAllPortsLagMember
}

export const validateEdgeAllPortsEmptyLag = (portsData: EdgePort[], lagData: EdgeLag[]) => {
  const { $t } = getIntl()

  const allPortsLagMember = isAllPortsLagMember(portsData, lagData)
  const lagWithGateway = getLagGatewayCount(lagData)

  if (allPortsLagMember && lagWithGateway === 0) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'At least one LAG must be enabled and configured to WAN or core port to form a cluster.' }))
  } else {
    return Promise.resolve()
  }
}

export const isLagCorePort = (data: EdgeLag) => {
  return data.corePortEnabled && data.portType === EdgePortTypeEnum.LAN
    && data.lagEnabled
    && data.lagMembers.some(member => member.portEnabled)
}

export const isPhysicalCorePort = (data: EdgePort) => {
  return data.corePortEnabled && data.portType === EdgePortTypeEnum.LAN && data.enabled
}

const hasCorePhysicalPort = (portsData: EdgePort[]) => {
  return portsData.some(isPhysicalCorePort)
}

const hasCoreLag = (lagData: EdgeLag[]) => {
  return lagData.some(isLagCorePort)
}

const getPhysicalPortGatewayCount = (portsData: EdgePort[]) => {
  return portsData.filter(port =>
    port.enabled
    && (port.portType === EdgePortTypeEnum.WAN
      || (port.portType === EdgePortTypeEnum.LAN && port.corePortEnabled))
  ).length
}
// eslint-disable-next-line max-len
export const validateEdgeGateway = (portsData: EdgePort[], lagData: EdgeLag[], isDualWanEnabled: boolean) => {
  const { $t } = getIntl()

  const hasPhysicalCorePort = hasCorePhysicalPort(portsData)
  const hasCoreLagPort = hasCoreLag(lagData)
  const hasCorePort = hasPhysicalCorePort || hasCoreLagPort

  const portWithGateway = getPhysicalPortGatewayCount(portsData)
  const lagWithGateway = getLagGatewayCount(lagData)
  const totalGateway = portWithGateway + lagWithGateway

  if (totalGateway === 0) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'At least one port must be enabled and configured to WAN or core port to form a cluster.' }))
  } else if ((hasCorePort || !isDualWanEnabled) && totalGateway > 1) {
    return Promise.reject($t({ defaultMessage: 'Please configure exactly one gateway.' }))
  } else if (!hasCorePort && isDualWanEnabled && totalGateway > MAX_DUAL_WAN_PORT) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Please configure no more than {maxWanPortCount} gateways.' }, {
      maxWanPortCount: MAX_DUAL_WAN_PORT
    }))
  } else {
    return Promise.resolve()
  }
}

// portsData: all ports in a cluster
// lagData: all lags in a cluster
// eslint-disable-next-line max-len
export const validateEdgeClusterLevelGateway = (portsData: EdgePort[], lagData: EdgeLag[], edgeNodes: EdgeStatus[], isDualWanEnabled: boolean) => {
  const { $t } = getIntl()
  const nodeCount = edgeNodes.length

  const hasPhysicalCorePort = hasCorePhysicalPort(portsData)
  const hasCoreLagPort = hasCoreLag(lagData)
  const hasCorePort = hasPhysicalCorePort || hasCoreLagPort

  const portWithGateway = getPhysicalPortGatewayCount(portsData)
  const lagWithGateway = getLagGatewayCount(lagData)
  const totalGateway = portWithGateway + lagWithGateway

  if (totalGateway < nodeCount) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Each Edge at least one port must be enabled and configured to WAN or core port to form a cluster.' }))

  } else if ((hasCorePort || !isDualWanEnabled) && totalGateway > nodeCount) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Please configure exactly one gateway on each Edge.' }))

  } else if (!hasCorePort && isDualWanEnabled && totalGateway > MAX_DUAL_WAN_PORT) {
    // eslint-disable-next-line max-len
    return Promise.reject($t({ defaultMessage: 'Please configure no more than {maxWanPortCount} gateways on each Edge.' }, {
      maxWanPortCount: MAX_DUAL_WAN_PORT
    }))

  } else {
    return Promise.resolve()
  }
}

export const validateGatewayInSubnet = (ip?: string, mask?: string, gateway?: string) => {
  const { $t } = getIntl()

  if (!ip || !mask || !gateway) {
    return Promise.resolve()
  }

  if (!IpUtilsService.validateInTheSameSubnet(ip, mask, gateway)) {
    return Promise.reject($t({
      defaultMessage: 'Gateway must be in the same subnet as the IP address.'
    }))
  }

  return Promise.resolve()
}

export const getEdgePortIpModeEnumValue = (type: string) => {
  switch (type) {
    case EdgeIpModeEnum.DHCP:
      return EdgeIpModeEnum.DHCP
    case 'Static':
    case EdgeIpModeEnum.STATIC:
      return EdgeIpModeEnum.STATIC
    default:
      return ''
  }
}

export const getEdgePortIpFromStatusIp = (statusIp?: string) => {
  return statusIp?.split('/')[0]
}

export const isInterfaceInVRRPSetting = (
  serialNumber: EdgeSerialNumber,
  interfaceName: string,
  vrrpSettings: ClusterNetworkSettings['virtualIpSettings']
) => {
  return Boolean(vrrpSettings?.some(item =>
    item.ports?.some(port =>
      port.serialNumber === serialNumber &&
      port.portName.toLowerCase() === interfaceName.toLowerCase())))
}

// eslint-disable-next-line max-len
const getTotalScopedCount = (clusterCompatibilities: EntityCompatibilityV1_1[] | EntityCompatibility[] | VenueSdLanApCompatibility[]) => {
  return sumBy(clusterCompatibilities as Record<string, unknown>[], 'total')
}

// eslint-disable-next-line max-len
export const getFeaturesIncompatibleDetailData = (compatibleData: EdgeServiceCompatibilityV1_1 | EdgeServiceCompatibility | EdgeSdLanApCompatibility | EdgeServiceApCompatibility | undefined) => {
  const resultMapping : Record<string, ApCompatibility> = {}
  if (isNil(compatibleData)) return resultMapping

  const isEdgePerspective = compatibleData.hasOwnProperty('clusterEdgeCompatibilities')

  if (isEdgePerspective) {
    // eslint-disable-next-line max-len
    const data = (compatibleData as EdgeServiceCompatibilityV1_1 | EdgeServiceCompatibility).clusterEdgeCompatibilities ?? []
    const totalScoped = getTotalScopedCount(data)

    data.forEach(clusterCompatibilities => {
      clusterCompatibilities.incompatibleFeatures?.forEach(feature => {
        if (feature.hasOwnProperty('featureType') && feature.hasOwnProperty('featureLevel')) {
          feature = feature as EdgeIncompatibleFeatureV1_1
          const featureName = feature.featureName

          if (!resultMapping[featureName]) {
            resultMapping[featureName] = {
              id: `ap_incompatible_details_${featureName}`,
              incompatibleFeatures: [{
                ...feature,
                featureName
              }],
              incompatible: 0,
              total: totalScoped
            } as ApCompatibility
          }
          // eslint-disable-next-line max-len
          resultMapping[featureName].incompatible += sumBy(feature.incompatibleDevices, (d) => d.count)
          resultMapping[featureName].incompatibleFeatures![0].incompatibleDevices = [
            { count: resultMapping[featureName].incompatible } as ApIncompatibleDevice
          ]
        } else {
          feature = feature as EdgeIncompatibleFeature
          const featureName = feature.featureRequirement.featureName

          if (!resultMapping[featureName]) {
            resultMapping[featureName] = {
              id: `edge_incompatible_details_${featureName}`,
              incompatibleFeatures: [{
                featureName,
                requiredFw: feature.featureRequirement.requiredFw
              }],
              incompatible: 0,
              // `total` should beyond features
              total: totalScoped
            } as ApCompatibility
          }
          // eslint-disable-next-line max-len
          resultMapping[featureName].incompatible += sumBy(feature.incompatibleDevices, (d) => d.count)
          resultMapping[featureName].incompatibleFeatures![0].incompatibleDevices = [
            { count: resultMapping[featureName].incompatible } as ApIncompatibleDevice
          ]
        }
      })
    })
  } else {
    const isNewDataModel = compatibleData.hasOwnProperty('venueEdgeServiceApCompatibilities')

    const data = (isNewDataModel
      ? (compatibleData as EdgeServiceApCompatibility).venueEdgeServiceApCompatibilities
      : (compatibleData as EdgeSdLanApCompatibility).venueSdLanApCompatibilities) ?? []
    const totalScoped = getTotalScopedCount(data)

    data.forEach(item => {
      item.incompatibleFeatures?.forEach(feature => {
        const featureName = feature.featureName

        if (!resultMapping[featureName]) {
          resultMapping[featureName] = {
            id: `ap_incompatible_details_${featureName}`,
            incompatibleFeatures: [{
              ...feature,
              featureName
            }],
            incompatible: 0,
            total: totalScoped
          } as ApCompatibility
        }

        // eslint-disable-next-line max-len
        resultMapping[featureName].incompatible += sumBy(feature.incompatibleDevices, (d) => d.count)
        resultMapping[featureName].incompatibleFeatures![0].incompatibleDevices = [
          { count: resultMapping[featureName].incompatible } as ApIncompatibleDevice]
      })
    })
  }

  return resultMapping
}

export const genExpireTimeString = (seconds?: number) => {
  const { $t } = getIntl()
  const days = seconds && seconds > 0 ? Math.floor(seconds/86400) : 0
  const lessThanADaySec = seconds && seconds > 0 ? Math.floor(seconds%86400) : 0
  return $t(
    { defaultMessage: '{days, plural, =0 {} one {# Day} other {# Days}} {time}' },
    {
      days,
      time: new Date(lessThanADaySec * 1000).toISOString().slice(11, 19)
    }
  )
}

export const getLagGateways = (lagData: EdgeLag[] | undefined, includeCorePort: boolean = true) => {
  if (!lagData) return []

  const lagWithGateways = lagData.filter(lag =>
    (lag.lagEnabled && lag.lagMembers.length && lag.lagMembers.some(memeber => memeber.portEnabled))
    && (lag.portType === EdgePortTypeEnum.WAN
      || (includeCorePort && lag.portType === EdgePortTypeEnum.LAN && lag.corePortEnabled))
  )
  return lagWithGateways
}

// eslint-disable-next-line max-len
export const getLagGatewayCount = (lagData: EdgeLag[] | undefined, includeCorePort: boolean = true) => {
  return getLagGateways(lagData, includeCorePort).length
}

// eslint-disable-next-line max-len
export const getEdgeWanInterfaces = (portsData: EdgePort[] | undefined, lagData: EdgeLag[] | undefined) => {
  const physicalWans= portsData ? portsData.filter(port =>
    port.enabled && port.portType === EdgePortTypeEnum.WAN
  ) : []

  const lagWans = getLagGateways(lagData, false)

  const wans: (EdgePort | EdgeLag)[] = lagWans
  wans.push(...physicalWans)

  return wans
}

// eslint-disable-next-line max-len
export const getEdgeWanInterfaceCount = (portsData: EdgePort[] | undefined, lagData: EdgeLag[] | undefined) => {
  const wans = getEdgeWanInterfaces(portsData, lagData)
  return wans.length
}

export const getEdgeModelDisplayText = (model?: string) => {
  const { $t } = getIntl()

  switch (model) {
    case 'vRUCKUS Edge':
      return $t({ defaultMessage: 'Virtual RUCKUS Edge' })
    default:
      return model?.startsWith('E') ? model.replace('E', 'RUCKUS Edge ') : (model ?? '')
  }
}