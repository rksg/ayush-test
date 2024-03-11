import { DefaultOptionType } from 'antd/lib/select'
import _                     from 'lodash'
import { IntlShape }         from 'react-intl'

import { getIntl, validationMessages } from '@acx-ui/utils'

import { IpUtilsService }                                                                                                                from '../../ipUtilsService'
import { EdgeIpModeEnum, EdgePortTypeEnum, EdgeServiceStatusEnum, EdgeStatusEnum }                                                       from '../../models/EdgeEnum'
import { EdgeAlarmSummary, EdgeLag, EdgeLagStatus, EdgePort, EdgePortStatus, EdgePortWithStatus, EdgeStatus, PRODUCT_CODE_VIRTUAL_EDGE } from '../../types'
import { isSubnetOverlap, networkWifiIpRegExp, subnetMaskIpRegExp }                                                                      from '../../validator'

const Netmask = require('netmask').Netmask

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

export const allowRebootForStatus = (edgeStatus: string) => {
  const stringStatus: string[] = rebootableEdgeStatuses
  return stringStatus.includes(edgeStatus)
}

export const allowResetForStatus = (edgeStatus: string) => {
  const stringStatus: string[] = resettabaleEdgeStatuses
  return stringStatus.includes(edgeStatus)
}

export const rebootableEdgeStatuses = [
  EdgeStatusEnum.OPERATIONAL,
  EdgeStatusEnum.APPLYING_CONFIGURATION,
  EdgeStatusEnum.CONFIGURATION_UPDATE_FAILED,
  EdgeStatusEnum.FIRMWARE_UPDATE_FAILED]

export const resettabaleEdgeStatuses = rebootableEdgeStatuses

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

export const convertEdgePortsConfigToApiPayload = (formData: EdgePortWithStatus | EdgeLag) => {
  const payload = _.cloneDeep(formData)

  if (payload.portType === EdgePortTypeEnum.LAN) {

    // LAN port is not allowed to configure NAT enable
    if (payload.natEnabled) {
      payload.natEnabled = false
    }

    // should clear gateway when core port using DHCP.
    if (payload.corePortEnabled === true && payload.ipMode === EdgeIpModeEnum.DHCP) {
      payload.gateway = ''
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
  if (value.startsWith(PRODUCT_CODE_VIRTUAL_EDGE)) {
    return validateVirtualEdgeSerialNumber(value)
  }
  return Promise.reject($t(validationMessages.invalid))
}

const validateVirtualEdgeSerialNumber = (value: string) => {
  const { $t } = getIntl()

  if (!new RegExp(/^[0-9a-z]+$/i).test(value)) {
    return Promise.reject($t(validationMessages.invalid))
  }

  if (value.length !== 34) {
    return Promise.reject($t({
      defaultMessage: 'Field must be exactly 34 characters'
    }))
  }

  return Promise.resolve()
}

const isVirtualEdgeSerial = (value: string) => {
  return new RegExp(/^96[0-9A-Z]{32}$/i).test(value)
}

export const deriveEdgeModel = (serial: string) => {
  return isVirtualEdgeSerial(serial) ? 'vSmartEdge' : '-'
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