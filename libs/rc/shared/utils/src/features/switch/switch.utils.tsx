/* eslint-disable max-len */
import _ from 'lodash'

import { getIntl, noDataDisplay } from '@acx-ui/utils'

import { DeviceConnectionStatus, ICX_MODELS_INFORMATION } from '../../constants'
import { STACK_MEMBERSHIP,
  DHCP_OPTION_TYPE,
  SwitchRow,
  SwitchClient,
  SwitchStatusEnum,
  SwitchViewModel,
  SWITCH_TYPE } from '../../types'

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
  ['FMS', 'ICX7550-48F'],
  ['FNC', 'ICX8200-24'],
  ['FND', 'ICX8200-24P'],
  ['FNF', 'ICX8200-48'],
  ['FNG', 'ICX8200-48P'],
  ['FNH', 'ICX8200-48PF'],
  ['FNM', 'ICX8200-48PF2'],
  ['FNS', 'ICX8200-C08PF'],
  ['FNE', 'ICX8200-24ZP'],
  ['FNJ', 'ICX8200-24F'],
  ['FNK', 'ICX8200-24FX'],
  ['FNL', 'ICX8200-48F'],
  ['FNN', 'ICX8200-48ZP2'],
  ['FNR', 'ICX8200-C08ZP']
  // ['FNU', 'ICX8200-C08P-DC'],
  // ['FNQ', 'ICX8200-C08PT'],
  // ['FNP', 'ICX8200-C08P']
])

export const ICX_MODELS_MODULES = {
  ICX7150: {
    'C12P': [['12X1G'], ['2X1G'], ['2X1/10G']],
    'C08P': [['8X1G'], ['2X1G']],
    'C08PT': [['8X1G'], ['2X1G']],
    'C10ZP': [['8X2.5G'], ['2X10G'], ['2X1/10G']],
    '24': [['24X1G'], ['2X1G'], ['4X1/10G']],
    '24P': [['24X1G'], ['2X1G'], ['4X1/10G']],
    '24F': [['24X1G'], ['2X1G'], ['4X1/10G']],
    '48': [['48X1G'], ['2X1G'], ['4X1/10G']],
    '48P': [['48X1G'], ['2X1G'], ['4X1/10G']],
    '48PF': [['48X1G'], ['2X1G'], ['4X1/10G']],
    '48ZP': [['48X1/2.5G'], ['8X1/10G']]
  },
  ICX7550: {
    '24': [['24X1G'], ['2X40G'], ['2X40G', '4X10GF']],
    '24P': [['24X1G'], ['2X40G'], ['2X40G', '4X10GF']],
    '48': [['48X1G'], ['2X40G'], ['2X40G', '4X10GF']],
    '48P': [['48X1G'], ['2X40G'], ['2X40G', '4X10GF']],
    '24ZP': [['24X2.5/10G'], ['2X40G'], ['1X100G', '2X40G', '4X10GF']],
    '48ZP': [['48X2.5/10G'], ['2X40G'], ['1X100G', '2X40G', '4X10GF']],
    '24F': [['24X10G'], ['2X40G'], ['1X100G', '2X40G', '4X10GF']],
    '48F': [['48X1/10G'], ['2X40G'], ['1X100G', '2X40G', '4X10GF']]
  },
  ICX7650: {
    '48P': [['48X1G'], ['1X40/100G', '2X40G', '4X10G'], ['2X100G', '4X40G', '2X40G']],
    '48ZP': [['48X1/2.5/5/10G'], ['1X40/100G', '2X40G', '4X10G'], ['2X100G', '4X40G', '2X40G']],
    '48F': [['48X10G'], ['1X40/100G', '2X40G', '4X10G'], ['2X100G', '4X40G', '2X40G']]
  },
  ICX7850: {
    '32Q': [['12X40/100G'], ['12X40/100G'], ['8X40/100G']],
    '48FS': [['48X1/10G'], ['8X40/100G']],
    '48F': [['48X1/10G'], ['8X40/100G']],
    '48C': [['48X1/10G'], ['8X40/100G']]
  },
  ICX8200: { //TODO: Need more information
    '24': [['24X10/100/1000Mbps'], ['4X1/10/25G']],
    '24P': [['24X10/100/1000Mbps'], ['4X1/10/25G']],
    '48': [['48X10/100/1000Mbps'], ['4X1/10/25G']],
    '48P': [['48X10/100/1000Mbps'], ['4X1/10/25G']],
    '48PF': [['48X10/100/1000Mbps'], ['4X1/10/25G']],
    '48PF2': [['48X10/100/1000Mbps'], ['4X1/10/25G']],
    // 'C08P': [['8X10/100/1000Mbps'], ['2X1G']],
    'C08PF': [['8X10/100/1000Mbps'], ['2X1/10G']],
    '24ZP': [['24X100/1000/2500Mbps'], ['4X1/10/25G']],
    '48ZP2': [['48X10/100/1000/2500Mbps'], ['4X1/10/25G']],
    '24FX': [['16X1/10G'], ['8X1/10/25G']],
    '24F': [['24X1G'], ['4X1/10/25G']],
    '48F': [['48X1G'], ['4X1/10/25G']],
    'C08ZP': [['8X100/1000/2500Mbps/1/2.5/5/10G'], ['2X1/10/25G']]
    // 'C08PT': [['8X10/100/1000Mbps'], ['2X1G']],
    // 'C08PDC': [['8X10/100/1000Mbps'], ['2X1G']]
  }
}

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

export const isRouter = (switchType: SWITCH_TYPE) => {
  return switchType === SWITCH_TYPE.ROUTER
}

export const transformSwitchUnitStatus = (switchStatusEnum: SwitchStatusEnum, configReady = true,
  syncedSwitchConfig = true, suspendingDeployTime = '') => {
  const { $t } = getIntl()
  switch (switchStatusEnum) {
    case SwitchStatusEnum.NEVER_CONTACTED_CLOUD:
      return $t({ defaultMessage: 'Never contacted cloud' })
    case SwitchStatusEnum.INITIALIZING:
      return $t({ defaultMessage: 'Initializing' })
    case SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING:
    case SwitchStatusEnum.FIRMWARE_UPD_FAIL:
    case SwitchStatusEnum.FIRMWARE_UPD_START:
    case SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE:
    case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE:
    case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS:
    case SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH:
    case SwitchStatusEnum.APPLYING_FIRMWARE:
      return $t({ defaultMessage: 'Firmware Updating' })
    case SwitchStatusEnum.OPERATIONAL:
      if (configReady && syncedSwitchConfig) {
        if (suspendingDeployTime && suspendingDeployTime.length > 0) {
          return $t({ defaultMessage: 'Applying configuration' })
        }
        return $t({ defaultMessage: 'Operational' })
      } else if (!syncedSwitchConfig) {
        return $t({ defaultMessage: 'Synchronizing data' })
      } else {
        return $t({ defaultMessage: 'Synchronizing' })
      }
    case SwitchStatusEnum.DISCONNECTED:
      return $t({ defaultMessage: 'Disconnected from cloud' })
    case SwitchStatusEnum.STACK_MEMBER_NEVER_CONTACTED:
      return $t({ defaultMessage: 'Never contacted Active Switch' })
    default:
      return $t({ defaultMessage: 'Never contacted cloud' })
  }
}

export const transformSwitchStatus = (switchStatusEnum: SwitchStatusEnum, configReady = false,
  syncedSwitchConfig = false, suspendingDeployTime = '') => {
  const { $t } = getIntl()
  let message = ''
  let deviceStatus = DeviceConnectionStatus.INITIAL
  let isOperational = false
  const status = switchStatusEnum && switchStatusEnum.toLocaleUpperCase()
  switch (status) {
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
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS:
      message = $t({ defaultMessage: 'Firmware Update - Validating Parameters' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING:
      message = $t({ defaultMessage: 'Firmware Update - Downloading' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE:
      message = $t({ defaultMessage: 'Firmware Update - Validating Image' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE:
      message = $t({ defaultMessage: 'Firmware Update - Syncing To Remote' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH:
      message = $t({ defaultMessage: 'Firmware Update - Writing To Flash' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.FIRMWARE_UPD_FAIL:
      message = $t({ defaultMessage: 'Firmware Update - Failed' })
      deviceStatus = DeviceConnectionStatus.DISCONNECTED
      break
    case SwitchStatusEnum.APPLYING_FIRMWARE:
      message = $t({ defaultMessage: 'Firmware updating' })
      deviceStatus = DeviceConnectionStatus.ALERTING
      break
    case SwitchStatusEnum.OPERATIONAL:
      if (configReady && syncedSwitchConfig) {
        if (suspendingDeployTime && suspendingDeployTime.length > 0) {
          message = $t({ defaultMessage: 'Applying configuration' })
        } else {
          message = $t({ defaultMessage: 'Operational' })
          isOperational = true
        }
      } else if (!syncedSwitchConfig) {
        message = $t({ defaultMessage: 'Synchronizing data' })
      } else {
        message = $t({ defaultMessage: 'Synchronizing' })
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

  return isSync ? $t({ defaultMessage: 'Synchronizing' }) : switchStatus
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

export const isEmpty = (params?: unknown) => {
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

export const getSwitchModelInfo = (switchModel: string) => {

  const modelFamily = switchModel.split('-')[0]
  const subModel = switchModel.split('-')[1]

  const modelFamilyInfo = ICX_MODELS_INFORMATION[modelFamily]
  if (!modelFamilyInfo) {
    return null
  }

  const subModelInfo = modelFamilyInfo[subModel]
  if (!subModelInfo) {
    return null
  }

  return subModelInfo
}

export const getSwitchPortLabel = (switchModel: string, slotNumber: number) => {
  if (!slotNumber || !switchModel || slotNumber < 1) {
    return ''
  }

  const modelInfo = getSwitchModelInfo(switchModel)
  if (!modelInfo) {
    return ''
  }
  if (modelInfo.portModuleSlots && !modelInfo.portModuleSlots[slotNumber - 1]) {
    return ''
  }
  return modelInfo.portModuleSlots && modelInfo.portModuleSlots[slotNumber - 1].portLabel
}

export const sortPortFunction = (portIdA: { id: string },portIdB: { id: string }) => {
  const splitA = portIdA.id.split('/')
  const valueA = calculatePortOrderValue(splitA[0], splitA[1], splitA[2])

  const splitB = portIdB.id.split('/')
  const valueB = calculatePortOrderValue(splitB[0], splitB[1], splitB[2])
  return valueA - valueB
}

export const calculatePortOrderValue = (unitId: string, moduleId: string, portNumber: string) => {
  return parseInt(unitId, 10) * 10000 + parseInt(moduleId, 10) * 100 + parseInt(portNumber, 10)
}

export const isL3FunctionSupported = (switchType: string | undefined) => {
  if (!switchType) {
    return false
  }
  return isRouter(switchType as SWITCH_TYPE)
}


export const getDhcpOptionList = () => {
  const { $t } = getIntl()
  const ALL_TYPE = [
    DHCP_OPTION_TYPE.ASCII,
    DHCP_OPTION_TYPE.HEX,
    DHCP_OPTION_TYPE.IP,
    DHCP_OPTION_TYPE.BOOLEAN,
    DHCP_OPTION_TYPE.INTEGER
  ]
  const DHCP_OPTIONS = {
    2: { label: $t({ defaultMessage: 'Time Offset' }), value: 2, type: [DHCP_OPTION_TYPE.INTEGER] },
    4: { label: $t({ defaultMessage: 'Time Server' }), value: 4, type: [DHCP_OPTION_TYPE.IP] },
    5: { label: $t({ defaultMessage: 'Name Server' }), value: 5, type: [DHCP_OPTION_TYPE.IP] },
    6: { label: $t({ defaultMessage: 'Domain Name Server' }), value: 6, type: [DHCP_OPTION_TYPE.IP] },
    7: { label: $t({ defaultMessage: 'Log Server' }), value: 7, type: [DHCP_OPTION_TYPE.IP] },
    8: { label: $t({ defaultMessage: 'Quotes Server' }), value: 8, type: [DHCP_OPTION_TYPE.IP] },
    9: { label: $t({ defaultMessage: 'LPR Server' }), value: 9, type: [DHCP_OPTION_TYPE.IP] },
    10: { label: $t({ defaultMessage: 'Impress Server' }), value: 10, type: [DHCP_OPTION_TYPE.IP] },
    11: { label: $t({ defaultMessage: 'RLP Server' }), value: 11, type: [DHCP_OPTION_TYPE.IP] },
    12: { label: $t({ defaultMessage: 'Hostname' }), value: 12, type: [DHCP_OPTION_TYPE.ASCII] },
    13: { label: $t({ defaultMessage: 'Boot File Size' }), value: 13, type: [DHCP_OPTION_TYPE.INTEGER] },
    14: { label: $t({ defaultMessage: 'Merit Dump File' }), value: 14, type: [DHCP_OPTION_TYPE.ASCII] },
    15: { label: $t({ defaultMessage: 'Domain name' }), value: 15, type: [DHCP_OPTION_TYPE.ASCII] },
    16: { label: $t({ defaultMessage: 'Swap Server' }), value: 16, type: [DHCP_OPTION_TYPE.IP] },
    17: { label: $t({ defaultMessage: 'Root Path' }), value: 17, type: [DHCP_OPTION_TYPE.ASCII] },
    18: { label: $t({ defaultMessage: 'Extension File' }), value: 18, type: [DHCP_OPTION_TYPE.ASCII] },
    19: { label: $t({ defaultMessage: 'Forward On/Off' }), value: 19, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    20: { label: $t({ defaultMessage: 'SrcRte On/Off' }), value: 20, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    21: { label: $t({ defaultMessage: 'Policy Filter' }), value: 21, type: [DHCP_OPTION_TYPE.IP] },
    22: { label: $t({ defaultMessage: 'Max DG Assembly' }), value: 22, type: [DHCP_OPTION_TYPE.INTEGER] },
    23: { label: $t({ defaultMessage: 'Default IP TTL' }), value: 23, type: [DHCP_OPTION_TYPE.INTEGER] },
    24: { label: $t({ defaultMessage: 'MTU Timeout' }), value: 24, type: [DHCP_OPTION_TYPE.INTEGER] },
    25: { label: $t({ defaultMessage: 'MTU Plateau' }), value: 25, type: [DHCP_OPTION_TYPE.INTEGER] },
    26: { label: $t({ defaultMessage: 'MTU Interface' }), value: 26, type: [DHCP_OPTION_TYPE.INTEGER] },
    27: { label: $t({ defaultMessage: 'MTU Subnet' }), value: 27, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    28: { label: $t({ defaultMessage: 'Broadcast Address' }), value: 28, type: [DHCP_OPTION_TYPE.IP] },
    29: { label: $t({ defaultMessage: 'Mask Discovery' }), value: 29, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    30: { label: $t({ defaultMessage: 'Mask Supplier' }), value: 30, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    31: { label: $t({ defaultMessage: 'Router Discovery' }), value: 31, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    32: { label: $t({ defaultMessage: 'Router Request' }), value: 32, type: [DHCP_OPTION_TYPE.IP] },
    33: { label: $t({ defaultMessage: 'Static Route' }), value: 33, type: [DHCP_OPTION_TYPE.IP] },
    34: { label: $t({ defaultMessage: 'Trailers' }), value: 34, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    35: { label: $t({ defaultMessage: 'ARP Timeout' }), value: 35, type: [DHCP_OPTION_TYPE.INTEGER] },
    36: { label: $t({ defaultMessage: 'Ethernet' }), value: 36, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    37: { label: $t({ defaultMessage: 'Default TCP TTL' }), value: 37, type: [DHCP_OPTION_TYPE.INTEGER] },
    38: { label: $t({ defaultMessage: 'Keepalive Time' }), value: 38, type: [DHCP_OPTION_TYPE.INTEGER] },
    39: { label: $t({ defaultMessage: 'Keepalive Data' }), value: 39, type: [DHCP_OPTION_TYPE.BOOLEAN] },
    40: { label: $t({ defaultMessage: 'NIS Domain' }), value: 40, type: [DHCP_OPTION_TYPE.ASCII] },
    41: { label: $t({ defaultMessage: 'NIS Servers' }), value: 41, type: [DHCP_OPTION_TYPE.IP] },
    42: { label: $t({ defaultMessage: 'NTP Servers' }), value: 42, type: [DHCP_OPTION_TYPE.IP] },
    43: { label: $t({ defaultMessage: 'Vendor Specific' }), value: 43, type: [DHCP_OPTION_TYPE.ASCII, DHCP_OPTION_TYPE.HEX, DHCP_OPTION_TYPE.IP] },
    44: { label: $t({ defaultMessage: 'NetBIOS Name Srv' }), value: 44, type: [DHCP_OPTION_TYPE.IP] },
    45: { label: $t({ defaultMessage: 'NetBIOS Dist Srv' }), value: 45, type: [DHCP_OPTION_TYPE.IP] },
    46: { label: $t({ defaultMessage: 'NETBIOS Node Type' }), value: 46, type: [DHCP_OPTION_TYPE.INTEGER] },
    47: { label: $t({ defaultMessage: 'NetBIOS Scope' }), value: 47, type: [DHCP_OPTION_TYPE.ASCII] },
    48: { label: $t({ defaultMessage: 'X Window Font' }), value: 48, type: [DHCP_OPTION_TYPE.IP] },
    49: { label: $t({ defaultMessage: 'X Window Manager' }), value: 49, type: [DHCP_OPTION_TYPE.IP] },
    50: { label: $t({ defaultMessage: 'Address Request' }), value: 50, type: [DHCP_OPTION_TYPE.IP] },
    51: { label: $t({ defaultMessage: 'Address Time' }), value: 51, type: [DHCP_OPTION_TYPE.INTEGER] },
    52: { label: $t({ defaultMessage: 'Overload' }), value: 52, type: [DHCP_OPTION_TYPE.INTEGER] },
    53: { label: $t({ defaultMessage: 'DHCP Msg Type' }), value: 53, type: [DHCP_OPTION_TYPE.INTEGER] },
    54: { label: $t({ defaultMessage: 'DHCP Server Id' }), value: 54, type: [DHCP_OPTION_TYPE.IP] },
    55: { label: $t({ defaultMessage: 'Parameter List' }), value: 55, type: [DHCP_OPTION_TYPE.INTEGER] },
    56: { label: $t({ defaultMessage: 'DHCP Message' }), value: 56, type: [DHCP_OPTION_TYPE.ASCII] },
    57: { label: $t({ defaultMessage: 'DHCP Max Msg Size' }), value: 57, type: [DHCP_OPTION_TYPE.INTEGER] },
    58: { label: $t({ defaultMessage: 'Renewal Time' }), value: 58, type: [DHCP_OPTION_TYPE.INTEGER] },
    59: { label: $t({ defaultMessage: 'Rebinding Time' }), value: 59, type: [DHCP_OPTION_TYPE.INTEGER] },
    60: { label: $t({ defaultMessage: 'Vendor Class Identifier' }), value: 60, type: [DHCP_OPTION_TYPE.ASCII] },
    61: { label: $t({ defaultMessage: 'Client Id' }), value: 61, type: [DHCP_OPTION_TYPE.ASCII] },
    62: { label: $t({ defaultMessage: 'NetWare/IP Domain' }), value: 62, type: [DHCP_OPTION_TYPE.ASCII] },
    63: { label: $t({ defaultMessage: 'NetWare/IP Option' }), value: 63, type: [DHCP_OPTION_TYPE.ASCII] },
    64: { label: $t({ defaultMessage: 'NIS-Domain-Name' }), value: 64, type: [DHCP_OPTION_TYPE.ASCII] },
    65: { label: $t({ defaultMessage: 'NIS-Server-Addr' }), value: 65, type: [DHCP_OPTION_TYPE.IP] },
    66: { label: $t({ defaultMessage: 'TFTP server hostname or IP address' }), value: 66, type: [DHCP_OPTION_TYPE.ASCII] },
    67: { label: $t({ defaultMessage: 'Boot File name' }), value: 67, type: [DHCP_OPTION_TYPE.ASCII] },
    68: { label: $t({ defaultMessage: 'Home-Agent-Addrs' }), value: 68, type: [DHCP_OPTION_TYPE.IP] },
    69: { label: $t({ defaultMessage: 'SMTP-Server' }), value: 69, type: [DHCP_OPTION_TYPE.IP] },
    70: { label: $t({ defaultMessage: 'POP3-Server' }), value: 70, type: [DHCP_OPTION_TYPE.IP] },
    71: { label: $t({ defaultMessage: 'NNTP-Server' }), value: 71, type: [DHCP_OPTION_TYPE.IP] },
    72: { label: $t({ defaultMessage: 'WWW-Server' }), value: 72, type: [DHCP_OPTION_TYPE.IP] },
    73: { label: $t({ defaultMessage: 'Finger-Server' }), value: 73, type: [DHCP_OPTION_TYPE.IP] },
    74: { label: $t({ defaultMessage: 'IRC-Server' }), value: 74, type: [DHCP_OPTION_TYPE.IP] },
    75: { label: $t({ defaultMessage: 'StreetTalk-Server' }), value: 75, type: [DHCP_OPTION_TYPE.IP] },
    76: { label: $t({ defaultMessage: 'STDA-Server' }), value: 76, type: [DHCP_OPTION_TYPE.IP] },
    77: { label: $t({ defaultMessage: 'User-Class' }), value: 77, type: [DHCP_OPTION_TYPE.ASCII] },
    78: { label: $t({ defaultMessage: 'Directory Agent' }), value: 78, type: [DHCP_OPTION_TYPE.IP] },
    79: { label: $t({ defaultMessage: 'Service Scope' }), value: 79, type: ALL_TYPE },
    80: { label: $t({ defaultMessage: 'Rapid Commit' }), value: 80, type: ALL_TYPE },
    81: { label: $t({ defaultMessage: 'Client FQDN' }), value: 81, type: ALL_TYPE },
    83: { label: $t({ defaultMessage: 'iSNS' }), value: 83, type: [DHCP_OPTION_TYPE.IP] },
    84: { label: $t({ defaultMessage: 'REMOVED/Unassigned' }), value: 84, type: ALL_TYPE },
    85: { label: $t({ defaultMessage: 'NDS Servers' }), value: 85, type: [DHCP_OPTION_TYPE.IP] },
    86: { label: $t({ defaultMessage: 'NDS Tree Name' }), value: 86, type: [DHCP_OPTION_TYPE.ASCII] },
    87: { label: $t({ defaultMessage: 'NDS Context' }), value: 87, type: [DHCP_OPTION_TYPE.ASCII] },
    88: { label: $t({ defaultMessage: 'BCMCS Domain List' }), value: 88, type: [DHCP_OPTION_TYPE.ASCII] },
    89: { label: $t({ defaultMessage: 'BCMCS IPv4 addr' }), value: 89, type: [DHCP_OPTION_TYPE.IP] },
    90: { label: $t({ defaultMessage: 'Authentication' }), value: 90, type: ALL_TYPE },
    91: { label: $t({ defaultMessage: 'client-last-transaction-time option	' }), value: 91, type: [DHCP_OPTION_TYPE.INTEGER] },
    92: { label: $t({ defaultMessage: 'associated-ip option' }), value: 92, type: [DHCP_OPTION_TYPE.IP] },
    93: { label: $t({ defaultMessage: 'Client System' }), value: 93, type: [DHCP_OPTION_TYPE.INTEGER] },
    94: { label: $t({ defaultMessage: 'Client NDI' }), value: 94, type: ALL_TYPE },
    95: { label: $t({ defaultMessage: 'LDAP' }), value: 95, type: ALL_TYPE },
    96: { label: $t({ defaultMessage: 'REMOVED/Unassigned' }), value: 96, type: ALL_TYPE },
    97: { label: $t({ defaultMessage: 'UUID/GUID' }), value: 97, type: ALL_TYPE },
    98: { label: $t({ defaultMessage: 'User-Auth' }), value: 98, type: [DHCP_OPTION_TYPE.ASCII] },
    99: { label: $t({ defaultMessage: 'GEOCONF_CIVIC' }), value: 99, type: ALL_TYPE },
    100: { label: $t({ defaultMessage: 'Pcode' }), value: 100, type: [DHCP_OPTION_TYPE.ASCII] },
    101: { label: $t({ defaultMessage: 'Tcode' }), value: 101, type: [DHCP_OPTION_TYPE.ASCII] },
    102: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 102, type: ALL_TYPE },
    103: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 103, type: ALL_TYPE },
    104: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 104, type: ALL_TYPE },
    105: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 105, type: ALL_TYPE },
    106: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 106, type: ALL_TYPE },
    107: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 107, type: ALL_TYPE },
    108: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 108, type: ALL_TYPE },
    109: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 109, type: ALL_TYPE },
    110: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 110, type: ALL_TYPE },
    111: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 111, type: ALL_TYPE },
    112: { label: $t({ defaultMessage: 'Netinfo Address' }), value: 112, type: [DHCP_OPTION_TYPE.IP] },
    113: { label: $t({ defaultMessage: 'Netinfo Tag' }), value: 113, type: [DHCP_OPTION_TYPE.ASCII] },
    114: { label: $t({ defaultMessage: 'URL' }), value: 114, type: [DHCP_OPTION_TYPE.ASCII] },
    115: { label: $t({ defaultMessage: 'REMOVED/Unassigned' }), value: 115, type: ALL_TYPE },
    116: { label: $t({ defaultMessage: 'Auto-Config' }), value: 116, type: ALL_TYPE },
    117: { label: $t({ defaultMessage: 'Name Service Search' }), value: 117, type: ALL_TYPE },
    118: { label: $t({ defaultMessage: 'Subnet Selection Option' }), value: 118, type: [DHCP_OPTION_TYPE.IP] },
    119: { label: $t({ defaultMessage: 'Domain Search' }), value: 119, type: [DHCP_OPTION_TYPE.ASCII] },
    120: { label: $t({ defaultMessage: 'SIP Servers' }), value: 120, type: ALL_TYPE },
    121: { label: $t({ defaultMessage: 'Classless Static Route Option' }), value: 121, type: ALL_TYPE },
    122: { label: $t({ defaultMessage: 'CCC' }), value: 122, type: ALL_TYPE },
    123: { label: $t({ defaultMessage: 'GeoConf Option' }), value: 123, type: ALL_TYPE },
    124: { label: $t({ defaultMessage: 'V-I Vendor Class' }), value: 124, type: ALL_TYPE },
    125: { label: $t({ defaultMessage: 'V-I VendorSpeciInfo' }), value: 125, type: [DHCP_OPTION_TYPE.ASCII] },
    126: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 126, type: ALL_TYPE },
    127: { label: $t({ defaultMessage: 'Removed/Unassigned' }), value: 127, type: ALL_TYPE },
    128: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 128, type: ALL_TYPE },
    129: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 129, type: ALL_TYPE },
    130: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 130, type: ALL_TYPE },
    131: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 131, type: ALL_TYPE },
    132: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 132, type: ALL_TYPE },
    133: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 133, type: ALL_TYPE },
    134: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 134, type: ALL_TYPE },
    135: { label: $t({ defaultMessage: 'PXE-VendorSpecific' }), value: 135, type: ALL_TYPE },
    136: { label: $t({ defaultMessage: 'OPTION_PANA_AGENT' }), value: 136, type: ALL_TYPE },
    137: { label: $t({ defaultMessage: 'V4_LOST' }), value: 137, type: [DHCP_OPTION_TYPE.ASCII] },
    138: { label: $t({ defaultMessage: 'OPTION_CAPWAP_AC_V4' }), value: 138, type: [DHCP_OPTION_TYPE.IP] },
    139: { label: $t({ defaultMessage: 'OPTION-IPv4_Address-MoS' }), value: 139, type: ALL_TYPE },
    140: { label: $t({ defaultMessage: 'OPTION-IPv4_FQDN-MoS' }), value: 140, type: ALL_TYPE },
    141: { label: $t({ defaultMessage: 'SIP UA Domains' }), value: 141, type: [DHCP_OPTION_TYPE.ASCII] },
    142: { label: $t({ defaultMessage: 'IPv4-ANDSF' }), value: 142, type: [DHCP_OPTION_TYPE.IP] },
    143: { label: $t({ defaultMessage: 'OPTION_V4_SZTP_REDIRECT' }), value: 143, type: ALL_TYPE },
    144: { label: $t({ defaultMessage: 'GeoLoc' }), value: 144, type: ALL_TYPE },
    145: { label: $t({ defaultMessage: 'FORCERENEW_NONCE_CAPABLE' }), value: 145, type: ALL_TYPE },
    146: { label: $t({ defaultMessage: 'RDNSS Selection' }), value: 146, type: ALL_TYPE },
    147: { label: $t({ defaultMessage: 'Unassigned' }), value: 147, type: ALL_TYPE },
    148: { label: $t({ defaultMessage: 'Unassigned' }), value: 148, type: ALL_TYPE },
    149: { label: $t({ defaultMessage: 'Unassigned' }), value: 149, type: ALL_TYPE },
    150: { label: $t({ defaultMessage: 'TFTP Server Addr' }), value: 150, type: [DHCP_OPTION_TYPE.IP] },
    151: { label: $t({ defaultMessage: 'status-code' }), value: 151, type: ALL_TYPE },
    152: { label: $t({ defaultMessage: 'base-time' }), value: 152, type: ALL_TYPE },
    153: { label: $t({ defaultMessage: 'start-time-of-state' }), value: 153, type: ALL_TYPE },
    154: { label: $t({ defaultMessage: 'query-start-time' }), value: 154, type: ALL_TYPE },
    155: { label: $t({ defaultMessage: 'query-end-time' }), value: 155, type: ALL_TYPE },
    156: { label: $t({ defaultMessage: 'dhcp-state' }), value: 156, type: ALL_TYPE },
    157: { label: $t({ defaultMessage: 'data-source' }), value: 157, type: ALL_TYPE },
    158: { label: $t({ defaultMessage: 'OPTION_V4_PCP_SERVER' }), value: 158, type: ALL_TYPE },
    159: { label: $t({ defaultMessage: 'OPTION_V4_PORTPARAMS' }), value: 159, type: ALL_TYPE },
    160: { label: $t({ defaultMessage: 'Captive-Portal' }), value: 160, type: ALL_TYPE },
    161: { label: $t({ defaultMessage: 'Unassigned' }), value: 161, type: ALL_TYPE },
    162: { label: $t({ defaultMessage: 'Unassigned' }), value: 162, type: ALL_TYPE },
    163: { label: $t({ defaultMessage: 'Unassigned' }), value: 163, type: ALL_TYPE },
    164: { label: $t({ defaultMessage: 'Unassigned' }), value: 164, type: ALL_TYPE },
    165: { label: $t({ defaultMessage: 'Unassigned' }), value: 165, type: ALL_TYPE },
    166: { label: $t({ defaultMessage: 'Unassigned' }), value: 166, type: ALL_TYPE },
    167: { label: $t({ defaultMessage: 'Unassigned' }), value: 167, type: ALL_TYPE },
    168: { label: $t({ defaultMessage: 'Unassigned' }), value: 168, type: ALL_TYPE },
    169: { label: $t({ defaultMessage: 'Unassigned' }), value: 169, type: ALL_TYPE },
    170: { label: $t({ defaultMessage: 'Unassigned' }), value: 170, type: ALL_TYPE },
    171: { label: $t({ defaultMessage: 'Unassigned' }), value: 171, type: ALL_TYPE },
    172: { label: $t({ defaultMessage: 'Unassigned' }), value: 172, type: ALL_TYPE },
    173: { label: $t({ defaultMessage: 'Unassigned' }), value: 173, type: ALL_TYPE },
    174: { label: $t({ defaultMessage: 'Unassigned' }), value: 174, type: ALL_TYPE },
    175: { label: $t({ defaultMessage: 'Etherboot' }), value: 175, type: ALL_TYPE },
    176: { label: $t({ defaultMessage: 'IP Tele-VoiceSrvr' }), value: 176, type: [DHCP_OPTION_TYPE.IP] },
    177: { label: $t({ defaultMessage: 'PktCable-CableHome' }), value: 177, type: ALL_TYPE },
    178: { label: $t({ defaultMessage: 'Unassigned' }), value: 178, type: ALL_TYPE },
    179: { label: $t({ defaultMessage: 'Unassigned' }), value: 179, type: ALL_TYPE },
    180: { label: $t({ defaultMessage: 'Unassigned' }), value: 180, type: ALL_TYPE },
    181: { label: $t({ defaultMessage: 'Unassigned' }), value: 181, type: ALL_TYPE },
    182: { label: $t({ defaultMessage: 'Unassigned' }), value: 182, type: ALL_TYPE },
    183: { label: $t({ defaultMessage: 'Unassigned' }), value: 183, type: ALL_TYPE },
    184: { label: $t({ defaultMessage: 'Unassigned' }), value: 184, type: ALL_TYPE },
    185: { label: $t({ defaultMessage: 'Unassigned' }), value: 185, type: ALL_TYPE },
    186: { label: $t({ defaultMessage: 'Unassigned' }), value: 186, type: ALL_TYPE },
    187: { label: $t({ defaultMessage: 'Unassigned' }), value: 187, type: ALL_TYPE },
    188: { label: $t({ defaultMessage: 'Unassigned' }), value: 188, type: ALL_TYPE },
    189: { label: $t({ defaultMessage: 'Unassigned' }), value: 189, type: ALL_TYPE },
    190: { label: $t({ defaultMessage: 'Unassigned' }), value: 190, type: ALL_TYPE },
    191: { label: $t({ defaultMessage: 'Unassigned' }), value: 191, type: ALL_TYPE },
    192: { label: $t({ defaultMessage: 'Unassigned' }), value: 192, type: ALL_TYPE },
    193: { label: $t({ defaultMessage: 'Unassigned' }), value: 193, type: ALL_TYPE },
    194: { label: $t({ defaultMessage: 'Unassigned' }), value: 194, type: ALL_TYPE },
    195: { label: $t({ defaultMessage: 'Unassigned' }), value: 195, type: ALL_TYPE },
    196: { label: $t({ defaultMessage: 'Unassigned' }), value: 196, type: ALL_TYPE },
    197: { label: $t({ defaultMessage: 'Unassigned' }), value: 197, type: ALL_TYPE },
    198: { label: $t({ defaultMessage: 'Unassigned' }), value: 198, type: ALL_TYPE },
    199: { label: $t({ defaultMessage: 'Unassigned' }), value: 199, type: ALL_TYPE },
    200: { label: $t({ defaultMessage: 'Unassigned' }), value: 200, type: ALL_TYPE },
    201: { label: $t({ defaultMessage: 'Unassigned' }), value: 201, type: ALL_TYPE },
    202: { label: $t({ defaultMessage: 'Unassigned' }), value: 202, type: ALL_TYPE },
    203: { label: $t({ defaultMessage: 'Unassigned' }), value: 203, type: ALL_TYPE },
    204: { label: $t({ defaultMessage: 'Unassigned' }), value: 204, type: ALL_TYPE },
    205: { label: $t({ defaultMessage: 'Unassigned' }), value: 205, type: ALL_TYPE },
    206: { label: $t({ defaultMessage: 'Unassigned' }), value: 206, type: ALL_TYPE },
    207: { label: $t({ defaultMessage: 'Unassigned' }), value: 207, type: ALL_TYPE },
    208: { label: $t({ defaultMessage: 'PXELINUX Magic' }), value: 208, type: ALL_TYPE },
    209: { label: $t({ defaultMessage: 'Config File' }), value: 209, type: [DHCP_OPTION_TYPE.ASCII] },
    210: { label: $t({ defaultMessage: 'Path Prefix' }), value: 210, type: [DHCP_OPTION_TYPE.ASCII] },
    211: { label: $t({ defaultMessage: 'Reboot Time' }), value: 211, type: ALL_TYPE },
    212: { label: $t({ defaultMessage: 'OPTION_6RD' }), value: 212, type: ALL_TYPE },
    213: { label: $t({ defaultMessage: 'V4_ACCESS_DOMAIN' }), value: 213, type: [DHCP_OPTION_TYPE.ASCII] },
    214: { label: $t({ defaultMessage: 'Unassigned' }), value: 214, type: ALL_TYPE },
    215: { label: $t({ defaultMessage: 'Unassigned' }), value: 215, type: ALL_TYPE },
    216: { label: $t({ defaultMessage: 'Unassigned' }), value: 216, type: ALL_TYPE },
    217: { label: $t({ defaultMessage: 'Unassigned' }), value: 217, type: ALL_TYPE },
    218: { label: $t({ defaultMessage: 'Unassigned' }), value: 218, type: ALL_TYPE },
    219: { label: $t({ defaultMessage: 'Unassigned' }), value: 219, type: ALL_TYPE },
    220: { label: $t({ defaultMessage: 'Subnet Allocation Option' }), value: 220, type: ALL_TYPE },
    221: { label: $t({ defaultMessage: 'VSS' }), value: 221, type: ALL_TYPE },
    222: { label: $t({ defaultMessage: 'Unassigned' }), value: 222, type: ALL_TYPE },
    223: { label: $t({ defaultMessage: 'Unassigned' }), value: 223, type: ALL_TYPE },
    224: { label: $t({ defaultMessage: 'Reserved' }), value: 224, type: ALL_TYPE },
    225: { label: $t({ defaultMessage: 'Reserved' }), value: 225, type: ALL_TYPE },
    226: { label: $t({ defaultMessage: 'Reserved' }), value: 226, type: ALL_TYPE },
    227: { label: $t({ defaultMessage: 'Reserved' }), value: 227, type: ALL_TYPE },
    228: { label: $t({ defaultMessage: 'Reserved' }), value: 228, type: ALL_TYPE },
    229: { label: $t({ defaultMessage: 'Reserved' }), value: 229, type: ALL_TYPE },
    230: { label: $t({ defaultMessage: 'Reserved' }), value: 230, type: ALL_TYPE },
    231: { label: $t({ defaultMessage: 'Reserved' }), value: 231, type: ALL_TYPE },
    232: { label: $t({ defaultMessage: 'Reserved' }), value: 232, type: ALL_TYPE },
    233: { label: $t({ defaultMessage: 'Reserved' }), value: 233, type: ALL_TYPE },
    234: { label: $t({ defaultMessage: 'Reserved' }), value: 234, type: ALL_TYPE },
    235: { label: $t({ defaultMessage: 'Reserved' }), value: 235, type: ALL_TYPE },
    236: { label: $t({ defaultMessage: 'Reserved' }), value: 236, type: ALL_TYPE },
    237: { label: $t({ defaultMessage: 'Reserved' }), value: 237, type: ALL_TYPE },
    238: { label: $t({ defaultMessage: 'Reserved' }), value: 238, type: ALL_TYPE },
    239: { label: $t({ defaultMessage: 'Reserved' }), value: 239, type: ALL_TYPE },
    240: { label: $t({ defaultMessage: 'Reserved' }), value: 240, type: ALL_TYPE },
    241: { label: $t({ defaultMessage: 'Reserved' }), value: 241, type: ALL_TYPE },
    242: { label: $t({ defaultMessage: 'IP Tele-DataSrvr' }), value: 242, type: [DHCP_OPTION_TYPE.IP] },
    243: { label: $t({ defaultMessage: 'Reserved' }), value: 243, type: ALL_TYPE },
    244: { label: $t({ defaultMessage: 'Reserved' }), value: 244, type: ALL_TYPE },
    245: { label: $t({ defaultMessage: 'Reserved' }), value: 245, type: ALL_TYPE },
    246: { label: $t({ defaultMessage: 'Reserved' }), value: 246, type: ALL_TYPE },
    247: { label: $t({ defaultMessage: 'Reserved' }), value: 247, type: ALL_TYPE },
    248: { label: $t({ defaultMessage: 'Reserved' }), value: 248, type: ALL_TYPE },
    249: { label: $t({ defaultMessage: 'Reserved' }), value: 249, type: ALL_TYPE },
    250: { label: $t({ defaultMessage: 'Reserved' }), value: 250, type: ALL_TYPE },
    251: { label: $t({ defaultMessage: 'Reserved' }), value: 251, type: ALL_TYPE },
    252: { label: $t({ defaultMessage: 'WPAD' }), value: 252, type: [DHCP_OPTION_TYPE.ASCII] },
    253: { label: $t({ defaultMessage: 'Reserved' }), value: 253, type: ALL_TYPE },
    254: { label: $t({ defaultMessage: 'Reserved' }), value: 254, type: ALL_TYPE }
  }

  return DHCP_OPTIONS
}

export const getClientIpAddr = (data?: SwitchClient) => {
  if (data?.clientIpv4Addr !== '0.0.0.0') {
    return data?.clientIpv4Addr
  } else if (data?.clientIpv6Addr !== '0:0:0:0:0:0:0:0') {
    return data?.clientIpv6Addr
  }
  return noDataDisplay
}

export const getAdminPassword = (
  data?: SwitchViewModel | SwitchRow,
  PasswordCoomponent?: React.ElementType
) => {
  const { $t } = getIntl()
  return !(data?.configReady && data?.syncedSwitchConfig)
    ? noDataDisplay
    : (data?.syncedAdminPassword
      ? PasswordCoomponent && <PasswordCoomponent
        style={{ paddingLeft: 0 }}
        readOnly
        bordered={false}
        value={data?.adminPassword}
      />
      : $t({ defaultMessage: 'Custom' })
    )
}
