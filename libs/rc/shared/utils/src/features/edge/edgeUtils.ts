/* eslint-disable max-len */
import { DefaultOptionType }                    from 'antd/lib/select'
import _, { difference, flatMap, isNil, sumBy } from 'lodash'
import { IntlShape }                            from 'react-intl'

import { getIntl } from '@acx-ui/utils'

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
  SubInterface,
  VenueSdLanApCompatibility
} from '../../types'

const Netmask = require('netmask').Netmask


export const edgePhysicalPortInitialConfigs = {
  portType: EdgePortTypeEnum.UNCONFIGURED,
  ipMode: EdgeIpModeEnum.DHCP,
  ip: '',
  subnet: '',
  gateway: '',
  enabled: true,
  natEnabled: true,
  corePortEnabled: false,
  accessPortEnabled: false,
  natPools: []
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
export const convertEdgeNetworkIfConfigToApiPayload = (
  formData: EdgePortWithStatus | EdgeLag | EdgeSubInterface,
  isEdgeCoreAccessSeparationReady?: boolean
) => {
  const payload = _.cloneDeep(formData)

  switch (payload.portType) {
    case EdgePortTypeEnum.WAN:
      payload.corePortEnabled = false
      if(payload.accessPortEnabled !== undefined) {
        payload.accessPortEnabled = false
      }
      break
    case EdgePortTypeEnum.LAN:
      if(isEdgeCoreAccessSeparationReady) {
        // normal(non-accessPort) LAN port
        if (!payload.accessPortEnabled) {
          // should clear all non core port LAN port's gateway.
          if (payload.gateway) {
            payload.gateway = ''
          }
        }
        if(!payload.corePortEnabled && !payload.accessPortEnabled) {
          // prevent LAN port from using DHCP
          // when it had been core port before but not a core port now.
          if (payload.ipMode === EdgeIpModeEnum.DHCP) {
            payload.ipMode = EdgeIpModeEnum.STATIC
          }
        }
      } else {
        // normal(non-corePort) LAN port
        if (!payload.corePortEnabled) {

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

export const isAllPortsLagMember = (portsData: EdgePort[], lagData: EdgeLag[]) => {
  const portIds = portsData.map(port => port.id)
  const lagMemberPortIds = flatMap(lagData, (lag => lag.lagMembers?.map(m => m.portId)))

  const isAllPortsLagMember = portIds.length && difference(portIds, lagMemberPortIds).length === 0
  return isAllPortsLagMember
}

export const isLagCorePort = (data: EdgeLag) => {
  return data.corePortEnabled && data.portType === EdgePortTypeEnum.LAN
    && data.lagEnabled
    && data.lagMembers.some(member => member.portEnabled)
}

export const isPhysicalCorePort = (data: EdgePort) => {
  return data.corePortEnabled && data.portType === EdgePortTypeEnum.LAN && data.enabled
}

export const hasCorePhysicalPort = (portsData: EdgePort[]) => {
  return portsData.some(isPhysicalCorePort)
}

export const hasCoreLag = (lagData: EdgeLag[]) => {
  return lagData.some(isLagCorePort)
}

const isAccessLag = (data: EdgeLag) => {
  return data.accessPortEnabled && data.portType === EdgePortTypeEnum.LAN
    && data.lagEnabled
    && data.lagMembers.some(member => member.portEnabled)
}

const isAccessPhysicalPort = (data: EdgePort) => {
  return data.accessPortEnabled && data.portType === EdgePortTypeEnum.LAN && data.enabled
}

const isAccessSubInterface = (data: SubInterface) => {
  return data.accessPortEnabled && data.portType === EdgePortTypeEnum.LAN
}

export const hasAccessLag = (lagData: EdgeLag[]) => {
  return lagData.some(isAccessLag)
}

export const hasAccessPhysicalPort = (portsData: EdgePort[]) => {
  return portsData.some(isAccessPhysicalPort)
}

export const hasAccessSubInterface = (subInterfaceData: SubInterface[]) => {
  return subInterfaceData.some(isAccessSubInterface)
}

export const getPhysicalPortGatewayCount = (portsData: EdgePort[], isCoreAccessEnabled?: boolean) => {
  return portsData.filter(port =>
    port.enabled
    && (port.portType === EdgePortTypeEnum.WAN
      || (port.portType === EdgePortTypeEnum.LAN && (isCoreAccessEnabled ? port.accessPortEnabled : port.corePortEnabled)))
  ).length
}

export const getSubInterfaceGatewayCount = (subInterfaceData: SubInterface[]) => {
  return subInterfaceData.filter(subInterface => subInterface.accessPortEnabled).length
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

export const getLagGateways = (lagData: EdgeLag[] | undefined, includeCorePort: boolean = true, isCoreAccessEnabled?: boolean) => {
  if (!lagData) return []

  const lagWithGateways = lagData.filter(lag =>
    (lag.lagEnabled && lag.lagMembers.length && lag.lagMembers.some(memeber => memeber.portEnabled))
    && (lag.portType === EdgePortTypeEnum.WAN
      || (includeCorePort && lag.portType === EdgePortTypeEnum.LAN && (isCoreAccessEnabled ? lag.accessPortEnabled : lag.corePortEnabled)))
  )
  return lagWithGateways
}

// eslint-disable-next-line max-len
export const getLagGatewayCount = (lagData: EdgeLag[] | undefined, includeCorePort: boolean = true, isCoreAccessEnabled?: boolean) => {
  return getLagGateways(lagData, includeCorePort, isCoreAccessEnabled).length
}

// eslint-disable-next-line max-len
export const getEdgeWanInterfaces = (portsData: EdgePort[] | undefined, lagData: EdgeLag[] | undefined) => {
  const lagWans = getLagGateways(lagData, false)

  // should exclude lagMember ports
  const physicalWans= portsData ? portsData.filter(port => {
    const isLagPort = lagData?.some(lag =>
      lag.lagMembers?.some(lagMember => lagMember.portId === port.id))

    return port.enabled && port.portType === EdgePortTypeEnum.WAN && !isLagPort
  }) : []


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