import { ApDeviceStatusEnum, APView, FloorplanContext, NetworkDevice, NetworkDeviceType, RogueApInfo, SwitchStatusEnum } from '@acx-ui/rc/utils'
import { getIntl }                                                                                                       from '@acx-ui/utils'

export function calculateDeviceColor (device: NetworkDevice,
  context: FloorplanContext, showRogueApMode: boolean): string {
  const deviceStatus = device.deviceStatus
  let deviceColor = ''
  switch(device.networkDeviceType) {
    case NetworkDeviceType.ap:
      deviceColor = calculateApColor(deviceStatus,
        showRogueApMode, context, device)?.deviceColor
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
  const { $t } = getIntl()
  switch (value) {
    case ApDeviceStatusEnum.NEVER_CONTACTED_CLOUD:
      message = apView === APView.AP_LIST ? $t({ defaultMessage: 'Never contacted cloud' })
        : $t({ defaultMessage: 'AP never contacted cloud' })
      icon = 'icon-settings'
      color = 'ap-status-severity-attention'
      break

    case ApDeviceStatusEnum.INITIALIZING:
      message = apView === APView.AP_LIST ? $t({ defaultMessage: 'Initializing' })
        : $t({ defaultMessage: 'AP initializing' })
      icon = 'icon-settings'
      color = 'ap-status-severity-attention'
      break

    case ApDeviceStatusEnum.OFFLINE:
      message = apView === APView.AP_LIST ? $t({ defaultMessage: 'Offline' })
        : $t({ defaultMessage: 'AP offline' })
      icon = 'icon-offline'
      color = 'ap-status-severity-attention'
      break

    case ApDeviceStatusEnum.OPERATIONAL:
      message = apView === APView.AP_LIST ? $t({ defaultMessage: 'Operational' })
        : $t({ defaultMessage: 'AP operational' })
      icon = 'icon-ok'
      color = 'ap-status-severity-cleared'
      break

    case ApDeviceStatusEnum.APPLYING_FIRMWARE:
      message = apView === APView.AP_LIST ?
        $t({ defaultMessage: 'Applying firmware' })
        : $t({ defaultMessage: 'AP - applying firmware' })
      icon = 'icon-ok'
      color = 'ap-status-severity-cleared'
      break

    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
      message = apView === APView.AP_LIST ?
        $t({ defaultMessage: 'Applying configuration' })
        : $t({ defaultMessage: 'AP - applying configuration' })
      icon = 'icon-ok'
      color = 'ap-status-severity-cleared'
      break
    case ApDeviceStatusEnum.FIRMWARE_UPDATE_FAILED:
      message = $t({ defaultMessage: 'Firmware update failed' })
      icon = 'icon-error'
      color = 'ap-status-severity-critical'
      break
    case ApDeviceStatusEnum.CONFIGURATION_UPDATE_FAILED:
      message = $t({ defaultMessage: 'Configuration update failed' })
      icon = 'icon-error'
      color = 'ap-status-severity-critical'
      break
    case ApDeviceStatusEnum.DISCONNECTED_FROM_CLOUD:
      message = apView === APView.AP_LIST ?
        $t({ defaultMessage: 'Disconnected from cloud' })
        : $t({ defaultMessage: 'AP disconnected from cloud' })
      icon = 'icon-error'
      color = 'ap-status-severity-critical'
      break

    case ApDeviceStatusEnum.REBOOTING:
      message = apView === APView.AP_LIST ? $t({ defaultMessage: 'Rebooting' })
        : $t({ defaultMessage: 'AP rebooting' })
      icon = 'icon-warning'
      color = 'ap-status-severity-minor'
      break

    case ApDeviceStatusEnum.HEARTBEAT_LOST:
      message = apView === APView.AP_LIST ? $t({ defaultMessage: 'Heartbeat lost' })
        : $t({ defaultMessage: 'AP heartbeat lost' })
      icon = 'icon-warning'
      color = 'ap-status-severity-minor'
      break

    default:
      message = $t({ defaultMessage: 'Unknown' })
      icon = 'icon-help'
      color = 'ap-status-severity-attention'
  }

  return { message, icon, color }
}

export function calculateApColor (deviceStatus: ApDeviceStatusEnum | SwitchStatusEnum,
  showRogueApMode: boolean,
  context: FloorplanContext, device: NetworkDevice): RogueApInfo {
  const status = apStatusTransform(deviceStatus)
  const deviceIcon = status.icon
  // TODO: Rogue AP need to handle later [needs discussion]
  if (showRogueApMode) {
    if (deviceIcon === 'icon-ok') {
      if (context === FloorplanContext.rogue_ap) {
        return calculateSpecificRogueApInfo(device)
      } else {
        return calculateAllVenueRogueApInfo(device)
      }
    } else {
      return {
        deviceColor: status.color + ' ap-rogue-type-offline'
      } as RogueApInfo
    }
  } else {
    return {
      deviceColor: status.color
    } as RogueApInfo
  }
}

function calculateAllVenueRogueApInfo (device: NetworkDevice): RogueApInfo {
  const rogueCategory = device.rogueCategory
  const categoryNames: string[] = rogueCategory? Object.keys(rogueCategory) : []
  const categoryNums: number[] = rogueCategory? Object.values(rogueCategory) : [0]

  const rogueType = categoryNames[0] || 'ignored'
  const totalRogueNumber = categoryNums
    .reduce((accumulator: number, currentValue: number) => accumulator + currentValue)
  const deviceColor = `ap-rogue-type-${rogueType}`

  return {
    deviceColor,
    allrogueApTooltipRequired: true,
    allVenueRogueApTooltipAttr: {
      totalRogueNumber,
      deviceName: device.name,
      categoryNames,
      categoryNums
    },
    drawRogueApItem: true,
    showRogueTotalNumber: true
  }
}

export function calculateSpecificRogueApInfo (device: NetworkDevice): RogueApInfo {
  const { $t } = getIntl()
  const snrInfo = getSnrDisplayInfo(device?.snr as number)
  const rogueType = device.rogueCategoryType?.toLowerCase()
  const deviceColor = `ap-rogue-type-${rogueType}`
  const rogueSnrClass = ' ' + snrInfo.cssClass

  const snrIconHtml = getSnrIconHtml(snrInfo.activatedBarIndex)
  const rogueApTooltips = `<div class="specific-rogue-tooltip-style"><div>
  ${$t({ defaultMessage: 'Detecting AP: ' })}
   ${device.name}</div><div>${$t({ defaultMessage: 'MAC Address: ' })}
   ${device.macAddress}</div><div>${$t({ defaultMessage: 'SNR: ' })}
   ${device.snr} ${$t({ defaultMessage: 'dB' })} ${snrIconHtml}</div></div>`

  return {
    deviceColor,
    rogueSnrClass,
    rogueApTooltips,
    allrogueApTooltipRequired: false,
    specificRogueApTooltipAttr: {
      activatedBarIndex: snrInfo.activatedBarIndex,
      deviceName: device.name,
      macAddress: device.macAddress as string,
      snr: device.snr as number
    },
    drawRogueApItem: true,
    showRogueTotalNumber: false
  }
}

export function getSnrIconHtml (activatedBarIndex: number) {
  let iconHtml = '<div class="wifi-signal-snr">'
  for (let i = 1; i < 5; i++) {
    iconHtml += `<div class="bar bar${i} ${(activatedBarIndex <= i) ? 'activated' : ''}"></div>`
  }
  iconHtml += '</div>'

  return iconHtml
}

export function getSnrDisplayInfo (snr: number) {
  let snrCssClass: string
  let snrActivatedBarIndex: number

  if (snr > 40) {
    snrCssClass = 'ap-rogue-snr-over-40-db'
    snrActivatedBarIndex = 1
  } else if (snr >= 26) {
    snrCssClass = 'ap-rogue-snr-26-40-db'
    snrActivatedBarIndex = 2
  } else if (snr >= 16) {
    snrCssClass = 'ap-rogue-snr-16-25-db'
    snrActivatedBarIndex = 3
  } else {
    snrCssClass = 'ap-rogue-snr-0-15-db'
    snrActivatedBarIndex = 4
  }

  return { cssClass: snrCssClass, activatedBarIndex: snrActivatedBarIndex }
}

export const getDeviceName = (device?: NetworkDevice) => {
  return device?.name || device?.switchName || device?.serialNumber
}
