/* eslint-disable max-len */
import _ from 'lodash'

import { getIntl } from '@acx-ui/utils'

import { DeviceConnectionStatus }                                         from '../../constants'
import { STACK_MEMBERSHIP, SwitchRow, SwitchStatusEnum, SwitchViewModel } from '../../types'

export const modelMap: ReadonlyMap<string, string> = new Map([
  ['CRH', 'ICX7750-48F'],
  ['CRJ', 'ICX7750-48C'],
  ['CRK', 'ICX7750-26Q'],
  ['EZC', 'ICX7650-48ZP'],
  ['EZD', 'ICX7650-48P'],
  ['EZE', 'ICX7650-48F'],
  ['FLU', 'ICX7850-32Q'],
  ['FLV', 'ICX7850-48FS'],
  ['FLW', 'ICX7850-48F'],
  ['FLX', 'ICX7850-48C'],
  ['EAR', 'ICX7450-32P'],
  ['CYQ', 'ICX7450-48'],
  ['CYR', 'ICX7450-48P'],
  ['CYS', 'ICX7450-48F'],
  ['CYT', 'ICX7450-24'],
  ['CYU', 'ICX7450-24P'],
  ['DUH', 'ICX7250-24'],
  ['DUI', 'ICX7250-24P'],
  ['DUJ', 'ICX7250-48'],
  ['DUK', 'ICX7250-48P'],
  ['FJN', 'ICX7150-48ZP'],
  ['FJP', 'ICX7150-48ZP'],
  ['FMD', 'ICX7150-C10ZP'],
  ['FME', 'ICX7150-C10ZP'],
  ['FMF', 'ICX7150-C08P'],
  ['FMG', 'ICX7150-C08P'],
  ['FMU', 'ICX7150-C08PT'],
  ['FEA', 'ICX7150-24P'],
  ['FEB', 'ICX7150-24P'],
  ['FEC', 'ICX7150-48P'],
  ['FED', 'ICX7150-48P'],
  ['FEE', 'ICX7150-48PF'],
  ['FEF', 'ICX7150-48PF'],
  ['FEG', 'ICX7150-24'],
  ['FEM', 'ICX7150-24'],
  ['FMH', 'ICX7150-24F'],
  ['FMJ', 'ICX7150-24F'],
  ['FEH', 'ICX7150-48'],
  ['FEJ', 'ICX7150-48'],
  ['FEK', 'ICX7150-C12P'],
  ['FEL', 'ICX7150-C12P'],
  ['DUM', 'ICX7250-24G'],
  ['FMK', 'ICX7550-24'],
  ['FML', 'ICX7550-48'],
  ['FMM', 'ICX7550-24P'],
  ['FMN', 'ICX7550-48P'],
  ['FMP', 'ICX7550-24ZP'],
  ['FMQ', 'ICX7550-48ZP'],
  ['FMR', 'ICX7550-24F'],
  ['FMS', 'ICX7550-48F']
])

export const isOperationalSwitch = (status: SwitchStatusEnum, syncedSwitchConfig: boolean) => {
  return status === SwitchStatusEnum.OPERATIONAL && syncedSwitchConfig
}

export const isStrictOperationalSwitch = (status: SwitchStatusEnum, configReady:boolean, syncedSwitchConfig: boolean) => {
  return status === SwitchStatusEnum.OPERATIONAL && syncedSwitchConfig && configReady
}

export const getSwitchModel = (serial: string) => {
  if (!serial || serial.length < 3) {
    return 'Unknown'
  }

  const productCode = serial.slice(0, 3)
  return modelMap.get(productCode)
}

export const _isEmpty = (params: unknown) => {
  if (params == null) {
    return true
  } else if (params === undefined) {
    return true
  } else if (params === 'undefined') {
    return true
  } else if (params === '') {
    return true
  }
  return false
}

export const transformSwitchStatus = (switchStatusEnum: SwitchStatusEnum, configReady = true,
  syncedSwitchConfig = true, suspendingDeployTime = '') => {
  const { $t } = getIntl()
  let message = ''
  let deviceStatus = DeviceConnectionStatus.INITIAL
  let isOperational = false
  switch (switchStatusEnum) {
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      message = $t({ defaultMessage: 'Never contacted cloud' })
      deviceStatus = DeviceConnectionStatus.INITIAL
      break
    case SwitchStatusEnum.INITIALIZING:
      message = $t({ defaultMessage: 'Initializing' })
      deviceStatus = DeviceConnectionStatus.INITIAL
      break
    case SwitchStatusEnum.FIRMWARE_UPD_START:
      message = $t({ defaultMessage: 'Firmware Updating' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS:
      message = $t({ defaultMessage: 'Firmware Update - Validating Parameters' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING:
      message = $t({ defaultMessage: 'Firmware Update - Downloading' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE:
      message = $t({ defaultMessage: 'Firmware Update - Validating Image' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE:
      message = $t({ defaultMessage: 'Firmware Update - Syncing To Remote' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH:
      message = $t({ defaultMessage: 'Firmware Update - Writing To Flash' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.FIRMWARE_UPD_FAIL:
      message = $t({ defaultMessage: 'Firmware Update - Failed' })
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break
    case SwitchStatusEnum.APPLYING_FIRMWARE:
      message = $t({ defaultMessage: 'Firmware updating' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.OPERATIONAL:
      if (configReady && syncedSwitchConfig) {
        if (suspendingDeployTime && suspendingDeployTime.length > 0) {
          message = $t({ defaultMessage: 'Operational - applying configuration' })
        } else {
          message = $t({ defaultMessage: 'Operational' })
          isOperational = true
        }
      } else if (!syncedSwitchConfig) {
        message = $t({ defaultMessage: 'Synchronizing data' })
      } else {
        message = $t({ defaultMessage: 'Operational - Synchronizing' })
      }
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break
    case SwitchStatusEnum.DISCONNECTED:
      message = $t({ defaultMessage: 'Disconnected from cloud' })
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break
    case SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED:
      message = $t({ defaultMessage: 'Never contacted Active Switch' })
      deviceStatus = DeviceConnectionStatus.INITIAL
      break
    default:
      message = $t({ defaultMessage: 'Never contacted cloud' })
      deviceStatus = DeviceConnectionStatus.INITIAL
  }
  return { message, deviceStatus, isOperational }
}

export const getSwitchStatusString = (row: SwitchRow) => {
  const { $t } = getIntl()
  const status = transformSwitchStatus(row.deviceStatus, row.configReady, row.syncedSwitchConfig, row.suspendingDeployTime)
  const isSync = !_.isEmpty(row.syncDataId) && status.isOperational
  const isStrictOperational = isStrictOperationalSwitch(row.deviceStatus, row.configReady, !!row.syncedSwitchConfig)
  let switchStatus = ( isStrictOperational && row.operationalWarning === true) ?
    $t({ defaultMessage: '{statusMessage} - Warning' }, { statusMessage: status.message }) : status.message

  return isSync ? $t({ defaultMessage: '{switchStatus} - Syncing' }, { switchStatus }) : switchStatus
}

export const getSwitchName = (row: SwitchRow) => {
  return row.name || row.switchName || row.serialNumber
}

export const convertPoeUsage = (rawUsage: number) => {
  return Math.round(rawUsage / 1000)
}

export const getPoeUsage = (data: SwitchViewModel) => {
  const tmpTotal = _.get(data, 'poeUsage.poeTotal', 0) || _.get(data, 'poeTotal', 0)
  const tmpUsage = _.get(data, 'poeUsage.poeUtilization', 0) || _.get(data, 'poeUtilization', 0)
  const poeTotal = Math.round(convertPoeUsage(tmpTotal))
  const poeUsage = Math.round(convertPoeUsage(tmpUsage))
  const poePercentage = (poeUsage === 0 || poeTotal === 0) ? 0 : Math.round(poeUsage / poeTotal * 100)
  return {
    used: poeUsage,
    total: poeTotal,
    percentage: poePercentage + '%'
  }
}

export const getStackMemberStatus = (unitStatus: string, isDefaultMember?: boolean) => {
  const { $t } = getIntl()
  if (unitStatus === STACK_MEMBERSHIP.ACTIVE) {
    return $t({ defaultMessage: 'Active' })
  } else if (unitStatus === STACK_MEMBERSHIP.STANDBY) {
    return $t({ defaultMessage: 'Standby' })
  } else if (unitStatus === STACK_MEMBERSHIP.MEMBER) {
    return $t({ defaultMessage: 'Member' })
  } else if (isDefaultMember) {
    return $t({ defaultMessage: 'Member' })
  }
  return
}