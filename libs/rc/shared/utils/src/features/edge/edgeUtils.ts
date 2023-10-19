import { getIntl, validationMessages } from '@acx-ui/utils'

import { IpUtilsService }                          from '../../ipUtilsService'
import { EdgeServiceStatusEnum, EdgeStatusEnum }   from '../../models/EdgeEnum'
import { EdgeAlarmSummary }                        from '../../types'
import { networkWifiIpRegExp, subnetMaskIpRegExp } from '../../validator'

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
    console.log('validate ip')
    await networkWifiIpRegExp(ip)
  } catch (error) {
    console.log('return ip reject')
    return Promise.reject(error)
  }

  if (await isSubnetAvailable(subnetMask) && IpUtilsService.isBroadcastAddress(ip, subnetMask)) {
    console.log('return broadcast reject')
    return Promise.reject($t(validationMessages.switchBroadcastAddressInvalid))
  } else {
    // If the subnet is unavailable, either because it's empty or invalid, there's no need to validate broadcast IP further
    console.log('return resolve')
    return Promise.resolve()
  }
}

async function isSubnetAvailable (subnetMask: string) {
  if (!subnetMask) {
    return false
  }

  try {
    await subnetMaskIpRegExp(subnetMask)
    console.log('return true')
    return true
  } catch {
    console.log('return false')
    return false
  }
}
