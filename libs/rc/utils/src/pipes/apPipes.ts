import { IntlShape } from 'react-intl'

import { ApDeviceStatusEnum, DeviceConnectionStatus } from '../constants'

export enum APView {
  AP_LIST,
  AP_OVERVIEW_PAGE
}

export function transformApStatus ({ $t }: IntlShape, status: ApDeviceStatusEnum, apView?: APView) {
  let message = ''
  let deviceStatus = DeviceConnectionStatus.INITIAL
  switch (status) {
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Never contacted cloud' })
        : $t({ defaultMessage: 'AP never contacted cloud' })
      deviceStatus = DeviceConnectionStatus.INITIAL
      break

    case ApDeviceStatusEnum.INITIALIZING:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Initializing' })
        : $t({ defaultMessage: 'AP initializing' })
      deviceStatus = DeviceConnectionStatus.INITIAL
      break

    case ApDeviceStatusEnum.OFFLINE:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Offline' })
        : $t({ defaultMessage: 'AP offline' })
      deviceStatus = DeviceConnectionStatus.INITIAL
      break

    case ApDeviceStatusEnum.OPERATIONAL:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Operational' })
        : $t({ defaultMessage: 'AP operational' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break

    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Operational - applying firmware' })
        : $t({ defaultMessage: 'AP operational - applying firmware' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break

    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Operational - applying configuration' })
        : $t({ defaultMessage: 'AP operational - applying configuration' })
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break

    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
      message = $t({ defaultMessage: 'Firmware update failed' })
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break

    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
      message = $t({ defaultMessage: 'Configuration update failed' })
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break

    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Disconnected from cloud' })
        : $t({ defaultMessage: 'AP disconnected from cloud' })
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break

    case ApDeviceStatusEnum.REBOOTING:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Rebooting' })
        : $t({ defaultMessage: 'AP rebooting' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break

    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Heartbeat lost' })
        : $t({ defaultMessage: 'AP heartbeat lost' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break

    default:
      message = $t({ defaultMessage: 'Unknown' })
      deviceStatus = DeviceConnectionStatus.INITIAL
  }

  return { message, deviceStatus }
}
