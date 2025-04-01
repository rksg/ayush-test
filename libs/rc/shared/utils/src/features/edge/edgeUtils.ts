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
import { isSubnetOverlap, networkWifiIpRegExp, subnetMaskIpRegExp } from '../../validator'

const Netmask = require('netmask').Netmask
const vSmartEdgeSerialRegex = '96[0-9A-Z]{32}'
const physicalSmartEdgeSerialRegex = '(9[1-9]|[1-4][0-9]|5[0-3])\\d{10}'
const MAX_DUAL_WAN_PORT = 2

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
  const stringStatus: string[] = resettabaleEdgeStatuses
  return stringStatus.includes(edgeStatus)
}

export const allowSendOtpForStatus = (edgeStatus: string) => {
  const stringStatus: string[] = unconfigedEdgeStatuses
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

export const resettabaleEdgeStatuses = rebootShutdownEdgeStatusWhiteList

export const unconfigedEdgeStatuses = [EdgeStatusEnum.NEVER_CONTACTED_CLOUD]

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
export const convertEdgePortsConfigToApiPayload = (formData: EdgePortWithStatus | EdgeLag | EdgeSubInterface) => {
  const payload = _.cloneDeep(formData)

  if (payload.ipMode === EdgeIpModeEnum.DHCP || payload.portType === EdgePortTypeEnum.CLUSTER) {
    payload.gateway = ''
  }

  // prevent DHCP mode from having IP and subnet
  if (payload.ipMode === EdgeIpModeEnum.DHCP) {
    if (payload.ip) payload.ip = ''
    if (payload.subnet) payload.subnet = ''
  }


  if (payload.portType === EdgePortTypeEnum.LAN) {

    // LAN port is not allowed to configure NAT enable
    if (payload.natEnabled) {
      payload.natEnabled = false
    }

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
  }

  return payload
}

export const convertEdgeSubinterfaceToApiPayload = (formData: EdgeSubInterface) => {
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

export async function lanPortsubnetValidator (
  currentSubnet: { ip: string, subnetMask: string },
  allSubnetWithoutCurrent: { ip: string, subnetMask: string } []
) {
  if(!!!currentSubnet.ip || !!!currentSubnet.subnetMask) {
    return
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
        return Promise.reject($t({ defaultMessage: 'The selected port is not in the same subnet as other nodes.' }))
      }
    }
  }
  return Promise.resolve()
}

const isUnique = (value: string, index: number, array: string[]) => {
  return array.indexOf(value) === array.lastIndexOf(value)
}

export const validateUniqueIp = (ips: string[], value?: string) => {
  if(!Boolean(value)) return Promise.resolve()
  const { $t } = getIntl()

  if(ips.every(isUnique)) {
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

export const getLagGatewayCount = (lagData: EdgeLag[]) => {
  const lagWithGateway = lagData.filter(lag =>
    (lag.lagEnabled && lag.lagMembers.length && lag.lagMembers.some(memeber => memeber.portEnabled))
    && (lag.portType === EdgePortTypeEnum.WAN
      || (lag.portType === EdgePortTypeEnum.LAN && lag.corePortEnabled))
  ).length
  return lagWithGateway
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

// eslint-disable-next-line max-len
export const validateEdgeGateway = (portsData: EdgePort[], lagData: EdgeLag[], isDualWanEnabled: boolean) => {
  const { $t } = getIntl()

  // eslint-disable-next-line max-len
  const hasCorePhysicalPort = portsData.some(port => port.portType === EdgePortTypeEnum.LAN && port.corePortEnabled)
  const hasCoreLag = lagData.some(lag =>
    (lag.lagEnabled && lag.lagMembers.length && lag.lagMembers.some(memeber => memeber.portEnabled))
    && (lag.portType === EdgePortTypeEnum.LAN && lag.corePortEnabled))

  const hasCorePort = hasCorePhysicalPort || hasCoreLag

  const portWithGateway = portsData.filter(port =>
    port.enabled
    && (port.portType === EdgePortTypeEnum.WAN
      || (port.portType === EdgePortTypeEnum.LAN && port.corePortEnabled))
  ).length

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
              // `total` should beyound features
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