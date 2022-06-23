import { ApDeviceStatusEnum, DeviceConnectionStatus } from '../constants'

export enum APView {
  AP_LIST,
  AP_OVERVIEW_PAGE
}

export function transformApStatus (status: ApDeviceStatusEnum, apView?: APView) {
  let message = ''
  let deviceStatus = DeviceConnectionStatus.INITIAL
  switch (status) {
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
      message = apView === APView.AP_LIST ? 'Never contacted cloud' : 'AP never contacted cloud'
      deviceStatus = DeviceConnectionStatus.INITIAL
      break

    case ApDeviceStatusEnum.INITIALIZING:
      message = apView === APView.AP_LIST ? 'Initializing' : 'AP initializing'
      deviceStatus = DeviceConnectionStatus.INITIAL
      break

    case ApDeviceStatusEnum.OFFLINE:
      message = apView === APView.AP_LIST ? 'Offline' : 'AP offline'
      deviceStatus = DeviceConnectionStatus.INITIAL
      break

    case ApDeviceStatusEnum.OPERATIONAL:
      message = apView === APView.AP_LIST ? 'Operational' : 'AP operational'
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break

    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
      message = apView === APView.AP_LIST ?
        'Operational - applying firmware' : 'AP operational - applying firmware'
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break

    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
      message = apView === APView.AP_LIST ?
        'Operational - applying configuration' : 'AP operational - applying configuration'
      deviceStatus = DeviceConnectionStatus.CONNECTED
      break

    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
      message = 'Firmware update failed'
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break

    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
      message = 'Configuration update failed'
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break

    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
      message = apView === APView.AP_LIST ? 'Disconnected from cloud' : 'AP disconnected from cloud'
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break

    case ApDeviceStatusEnum.REBOOTING:
      message = apView === APView.AP_LIST ? 'Rebooting' : 'AP rebooting'
      deviceStatus = DeviceConnectionStatus.ALERTING
      break

    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      message = apView === APView.AP_LIST ? 'Heartbeat lost' : 'AP heartbeat lost'
      deviceStatus = DeviceConnectionStatus.ALERTING
      break

    default:
      message = 'Unknown'
      deviceStatus = DeviceConnectionStatus.INITIAL
  }

  return { message, deviceStatus }
}
