import { ApDeviceStatusEnum } from '../src/constants'

export enum APView {
  AP_LIST,
  AP_OVERVIEW_PAGE
}

export function transformApStatus (status: any, apView?: APView) {
  let message = ''
  switch (status) {
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
      message = apView === APView.AP_LIST ? 'Never contacted cloud' : 'AP never contacted cloud'
      break

    case ApDeviceStatusEnum.INITIALIZING:
      message = apView === APView.AP_LIST ? 'Initializing' : 'AP initializing'
      break

    case ApDeviceStatusEnum.OFFLINE:
      message = apView === APView.AP_LIST ? 'Offline' : 'AP offline'
      break

    case ApDeviceStatusEnum.OPERATIONAL:
      message = apView === APView.AP_LIST ? 'Operational' : 'AP operational'
      break

    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
      message = apView === APView.AP_LIST ?
        'Operational - applying firmware' : 'AP operational - applying firmware'
      break

    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
      message = apView === APView.AP_LIST ?
        'Operational - applying configuration' : 'AP operational - applying configuration'
      break

    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
      message = 'Firmware update failed'
      break

    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
      message = 'Configuration update failed'
      break

    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
      message = apView === APView.AP_LIST ? 'Disconnected from cloud' : 'AP disconnected from cloud'
      break

    case ApDeviceStatusEnum.REBOOTING:
      message = apView === APView.AP_LIST ? 'Rebooting' : 'AP rebooting'
      break

    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      message = apView === APView.AP_LIST ? 'Heartbeat lost' : 'AP heartbeat lost'
      break

    default:
      message = 'Unknown'
  }

  return message
}
