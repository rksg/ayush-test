import { SwitchStatusEnum } from '../../types'
import { useIntl } from 'react-intl'
import { DeviceConnectionStatus } from '../../constants'
import _ from 'lodash'
import { deviceStatusColors } from '@acx-ui/components'

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
  return status === SwitchStatusEnum.OPERATIONAL && syncedSwitchConfig && configReady;
}

export const getSwitchModel = (serial: string) => {
  if (!serial || serial.length < 3) {
    return 'Unknown'
  }

  const productCode = serial.slice(0, 3)
  return modelMap.get(productCode)
}

export const transformSwitchStatus = (switchStatusEnum: SwitchStatusEnum, configReady = true, 
  syncedSwitchConfig = true, suspendingDeployTime = '') => {
    const { $t } = useIntl()
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
      // case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS:
      //   return 'Firmware Update - Validating Parameters';
      // case SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING:
      //   return 'Firmware Update - Downloading';
      // case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE:
      //   return 'Firmware Update - Validating Image';
      // case SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE:
      //   return 'Firmware Update - Syncing To Remote';
      // case SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH:
      //   return 'Firmware Update - Writing To Flash';
      // case SwitchStatusEnum.FIRMWARE_UPD_FAIL:
      //   return 'Firmware Update - Failed';
      // case SwitchStatusEnum.APPLYING_FIRMWARE:
      //   return 'Firmware updating';
      case SwitchStatusEnum.OPERATIONAL:
        if (configReady && syncedSwitchConfig) {
          if (suspendingDeployTime && suspendingDeployTime.length > 0) {
            message = $t({ defaultMessage: 'Operational - applying configuration' })
          }
          isOperational = true
          message = $t({ defaultMessage: 'Operational' })
        } else if (!syncedSwitchConfig) {
          message = $t({ defaultMessage: 'Synchronizing data' })
        } else {
          message = $t({ defaultMessage: 'Operational - Synchronizing' })
        }
        deviceStatus = DeviceConnectionStatus.CONNECTED
        break
      // case SwitchStatusEnum.DISCONNECTED:
      //   return 'Disconnected from cloud';
      // case SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED:
      //   return 'Never contacted Active Switch';
      default:
        message = $t({ defaultMessage: 'Never contacted cloud' })
        deviceStatus = DeviceConnectionStatus.INITIAL
    }
    return { message, deviceStatus, isOperational }
}

export const getSwitchStatusString = (row: any) => {
  const { $t } = useIntl()
  const status = transformSwitchStatus(row.deviceStatus, row.configReady, row.syncedSwitchConfig, row.suspendingDeployTime)
  const isSync = !_.isEmpty(row.syncDataId) && status.isOperational;
  const isStrictOperational = isStrictOperationalSwitch(row.deviceStatus, row.configReady, row.syncedSwitchConfig)
  let switchStatus = ( isStrictOperational && row.operationalWarning == true) ? 
    status.message + ' ' + $t({ defaultMessage: '- Warning' }) : status.message;

  return isSync ? switchStatus + ' ' + $t({ defaultMessage: '- Syncing' }) : switchStatus;
}

export const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}