import { uniq, without } from 'lodash'
import { IntlShape }     from 'react-intl'

import { getIntl } from '@acx-ui/utils'

import {
  ApDeviceStatusEnum,
  DeviceConnectionStatus,
  QosPriorityEnum
} from '../constants'
import { AFCInfo, AFCPowerMode, AFCProps, AFCStatus, NewAFCInfo } from '../types'

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
        ? $t({ defaultMessage: 'Applying firmware' })
        : $t({ defaultMessage: 'AP - applying firmware' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break

    case ApDeviceStatusEnum.APPLYING_CONFIGURATION:
      message = apView === APView.AP_LIST
        ? $t({ defaultMessage: 'Applying configuration' })
        : $t({ defaultMessage: 'AP - applying configuration' })
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

export function transformQosPriorityType (type: QosPriorityEnum) {
  const { $t } = getIntl()
  let transform = ''
  switch (type) {
    case QosPriorityEnum.WIFICALLING_PRI_BE:
      transform = $t({ defaultMessage: 'Best Effort' })
      break
    case QosPriorityEnum.WIFICALLING_PRI_BG:
      transform = $t({ defaultMessage: 'Background' })
      break
    case QosPriorityEnum.WIFICALLING_PRI_VIDEO:
      transform = $t({ defaultMessage: 'Video' })
      break
    case QosPriorityEnum.WIFICALLING_PRI_VOICE:
      transform = $t({ defaultMessage: 'Voice' })
      break
  }

  return transform
}

// eslint-disable-next-line
export const AFCPowerStateRender = (afcInfo?: AFCInfo, apRadioDeploy?: string, isOutdoor?: boolean) : { columnText : string, tooltipText?: string} => {
  const { $t } = getIntl()
  const powerMode = afcInfo?.hasOwnProperty('powerMode') ?
    (afcInfo as AFCInfo)?.powerMode :
    (afcInfo as NewAFCInfo)?.powerState
  const afcStatus = afcInfo?.hasOwnProperty('afcStatus') ?
    (afcInfo as AFCInfo)?.afcStatus :
    (afcInfo as NewAFCInfo)?.afcState

  if(!powerMode || apRadioDeploy !== '2-5-6') {
    return { columnText: '--', tooltipText: undefined }
  }

  if (powerMode === AFCPowerMode.STANDARD_POWER){
    return { columnText: $t({ defaultMessage: 'Standard power' }), tooltipText: undefined }
  }
  else if (powerMode === AFCPowerMode.LOW_POWER) {
    if (afcStatus !== AFCStatus.AFC_NOT_REQUIRED){
      let message = { columnText: '', tooltipText: undefined }
      if(isOutdoor) {
        message = {
          columnText: $t({ defaultMessage: '6 GHz radio off' }),
          tooltipText: undefined
        }
      } else {
        message = {
          columnText: $t({ defaultMessage: 'Low Power Indoor' }),
          tooltipText: undefined
        }
      }
      switch(afcStatus) {
        case AFCStatus.WAIT_FOR_LOCATION:
          return {
            ...message,
            tooltipText: $t({ defaultMessage: 'AFC Geo-Location not set' })
          }
        case AFCStatus.REJECTED:
          return {
            ...message,
            tooltipText: $t({ defaultMessage: 'Rejected by FCC DB due to no available channels' })
          }
        case AFCStatus.WAIT_FOR_RESPONSE:
          return {
            ...message,
            tooltipText: $t({ defaultMessage: 'Wait for AFC server response' })
          }
        case AFCStatus.AFC_SERVER_FAILURE:
          return {
            ...message,
            tooltipText: $t({ defaultMessage: 'AFC Server failure' })
          }
        case AFCStatus.PASSED:
          return {
            ...message,
            tooltipText: $t({ defaultMessage: 'AP is working on LPI channel' })
          }
      }
    } else {
      return {
        columnText: $t({ defaultMessage: 'Low Power Indoor' }),
        tooltipText: undefined
      }
    }
  }

  return { columnText: '--', tooltipText: undefined }
}

// eslint-disable-next-line
export const APPropertiesAFCPowerStateRender = (afcInfo?: AFCInfo, apRadioDeploy?: string, isOutdoor?: boolean) => {

  const { $t } = getIntl()

  const powerMode = afcInfo?.powerMode

  const displayList = []

  if(!powerMode || apRadioDeploy !== '2-5-6') {
    return '--'
  }

  if (powerMode === AFCPowerMode.STANDARD_POWER){
    displayList.push($t({ defaultMessage: 'Standard power' }))
  }

  else if (powerMode === AFCPowerMode.LOW_POWER) {

    if (isOutdoor) {
      displayList.push($t({ defaultMessage: '6 GHz radio off' }))
    } else {
      displayList.push($t({ defaultMessage: 'Low Power Indoor' }))
    }
    switch(afcInfo?.afcStatus) {
      case AFCStatus.WAIT_FOR_LOCATION:
        displayList.push($t({ defaultMessage: '[AFC Geo-Location not set]' }))
        break
      case AFCStatus.REJECTED:
        // eslint-disable-next-line
        displayList.push($t({ defaultMessage: '[Rejected by FCC DB due to no available channels]' }))
        break
      case AFCStatus.WAIT_FOR_RESPONSE:
        displayList.push($t({ defaultMessage: '[Wait for AFC server response]' }))
        break
      case AFCStatus.AFC_NOT_REQUIRED:
        // Do nothing
        break
      case AFCStatus.PASSED:
        displayList.push($t({ defaultMessage: '[AP is working on LPI channel]' }))
        break
      case AFCStatus.AFC_SERVER_FAILURE:
        displayList.push($t({ defaultMessage: '[AFC Server failure]' }))
        break
    }
  }

  return (displayList.length === 0) ? '--' : displayList.join(' ')
}

// eslint-disable-next-line
export const AFCStatusRender = (afcInfo?: AFCInfo|NewAFCInfo, apRadioDeploy?: string) => {
  if (apRadioDeploy !== '2-5-6') {
    return '--'
  }

  const { $t } = getIntl()
  const displayList = []
  const afcStatus = afcInfo?.hasOwnProperty('afcStatus') ?
    (afcInfo as AFCInfo)?.afcStatus :
    (afcInfo as NewAFCInfo)?.afcState

  switch(afcStatus) {
    case AFCStatus.WAIT_FOR_LOCATION:
      displayList.push($t({ defaultMessage: 'Wait for location' }))
      break
    case AFCStatus.REJECTED:
      displayList.push($t({ defaultMessage: 'Rejected' }))
      break
    case AFCStatus.WAIT_FOR_RESPONSE:
      displayList.push($t({ defaultMessage: 'Wait for response' }))
      break
    case AFCStatus.AFC_NOT_REQUIRED:
      displayList.push($t({ defaultMessage: 'N/A' }))
      break
    case AFCStatus.PASSED:
      displayList.push($t({ defaultMessage: 'Passed' }))
      break
    case AFCStatus.AFC_SERVER_FAILURE:
      displayList.push($t({ defaultMessage: 'AFC Server failure' }))
      break
  }

  return (displayList.length === 0) ? '--' : displayList.join(' ')
}

/* eslint-disable max-len */
export const ChannelButtonTextRender = ({ $t }: IntlShape, channels: number[], isChecked: boolean, afcProps?: AFCProps): string => {
  let message = isChecked
    ? $t({ defaultMessage: 'Disable this channel' })
    : $t({ defaultMessage: 'Enable this channel' })

  const { featureFlag: afcFeatrueFlag, afcInfo } = afcProps || {}
  if (afcFeatrueFlag && afcInfo && afcInfo.afcStatus === AFCStatus.PASSED) {
    const afcAvailableChannel = uniq(afcInfo.availableChannels).sort((a, b) => a-b)
    // Only add AFC tooltip when all channels are in AFC available channel
    const difference = without(channels, ...afcAvailableChannel)
    if (difference.length === 0) {
      message = $t({ defaultMessage: 'Allowed by AFC' }) + '\n' + message
    }
  }
  return message
}