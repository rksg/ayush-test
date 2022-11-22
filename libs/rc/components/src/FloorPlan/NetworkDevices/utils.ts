import { ApDeviceStatusEnum, APView, NetworkDevice, NetworkDeviceType, SwitchStatusEnum } from '@acx-ui/rc/utils'

export function calculateDeviceColor (device: NetworkDevice): string {
  const deviceStatus = device.deviceStatus
  let deviceColor = ''
  switch(device.networkDeviceType) {
    case NetworkDeviceType.ap:
      deviceColor = calculateApColor(deviceStatus)
      break
    case NetworkDeviceType.lte_ap:
      deviceColor = apStatusTransform(deviceStatus).color
      break
    case NetworkDeviceType.switch:
      deviceColor = getSwitchStatusColorClass(deviceStatus as SwitchStatusEnum)
      break
    case NetworkDeviceType.rogue_ap:
      const rogueType = device.rogueCategoryType?.toLowerCase()
      deviceColor = `ap-rogue-type-${rogueType}`
      break
    case NetworkDeviceType.cloudpath:
      deviceColor = 'cloudpath-server'
      break
  }
  return deviceColor
}

function getSwitchStatusColorClass (venueStatus: SwitchStatusEnum): string {
  switch (venueStatus) {
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      return 'switch-status-never-contacted-cloud'
    case SwitchStatusEnum.OPERATIONAL:
      return 'switch-status-operational'
    case SwitchStatusEnum.DISCONNECTED:
      return 'switch-status-disconnected'
  }
  return ''
}

export function apStatusTransform (value: ApDeviceStatusEnum | SwitchStatusEnum, apView?: APView) {
  let message = ''
  let icon = ''
  let color = ''
  switch (value) {
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
      message = apView === APView.AP_LIST ? 'Never contacted cloud' : 'AP never contacted cloud'
      icon = 'icon-settings'
      color = 'ap-status-severity-attention'
      break

    case ApDeviceStatusEnum.INITIALIZING:
      message = apView === APView.AP_LIST ? 'Initializing' : 'AP initializing'
      icon = 'icon-settings'
      color = 'ap-status-severity-attention'
      break

    case ApDeviceStatusEnum.OFFLINE:
      message = apView === APView.AP_LIST ? 'Offline' : 'AP offline'
      icon = 'icon-offline'
      color = 'ap-status-severity-attention'
      break

    case ApDeviceStatusEnum.OPERATIONAL:
      message = apView === APView.AP_LIST ? 'Operational' : 'AP operational'
      icon = 'icon-ok'
      color = 'ap-status-severity-cleared'
      break

    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
      message = apView === APView.AP_LIST ?
        'Operational - applying firmware' : 'AP operational - applying firmware'
      icon = 'icon-ok'
      color = 'ap-status-severity-cleared'
      break

    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
      message = apView === APView.AP_LIST ?
        'Operational - applying configuration' : 'AP operational - applying configuration'
      icon = 'icon-ok'
      color = 'ap-status-severity-cleared'
      break
    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
      message = 'Firmware update failed'
      icon = 'icon-error'
      color = 'ap-status-severity-critical'
      break
    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
      message = 'Configuration update failed'
      icon = 'icon-error'
      color = 'ap-status-severity-critical'
      break
    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
      message = apView === APView.AP_LIST ?
        'Disconnected from cloud' : 'AP disconnected from cloud'
      icon = 'icon-error'
      color = 'ap-status-severity-critical'
      break

    case ApDeviceStatusEnum.REBOOTING:
      message = apView === APView.AP_LIST ? 'Rebooting' : 'AP rebooting'
      icon = 'icon-warning'
      color = 'ap-status-severity-minor'
      break

    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      message = apView === APView.AP_LIST ? 'Heartbeat lost' : 'AP heartbeat lost'
      icon = 'icon-warning'
      color = 'ap-status-severity-minor'
      break

    default:
      message = 'Unknown'
      icon = 'icon-help'
      color = 'ap-status-severity-attention'
  }

  return { message, icon, color }
}

function calculateApColor (deviceStatus: ApDeviceStatusEnum | SwitchStatusEnum) {
  const status = apStatusTransform(deviceStatus)
  // TODO: Rouge AP need to handle later [needs discussion]
  return status.color
}
