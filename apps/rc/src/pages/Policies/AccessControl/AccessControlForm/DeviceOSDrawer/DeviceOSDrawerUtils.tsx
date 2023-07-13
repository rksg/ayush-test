import { DeviceTypeEnum, OsVendorEnum } from '@acx-ui/rc/utils'

import { DeviceOSRule } from './index'

const deviceOsVendorMap: Record<string, string[]> = {
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.Laptop]: [OsVendorEnum.All, OsVendorEnum.Windows, OsVendorEnum.MacOs, OsVendorEnum.ChromeOs, OsVendorEnum.Linux, OsVendorEnum.Ubuntu],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.Smartphone]: [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.Android, OsVendorEnum.BlackBerry, OsVendorEnum.Windows],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.Tablet]: [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.AmazonKindle, OsVendorEnum.Android, OsVendorEnum.Windows],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.Voip]: [OsVendorEnum.All, OsVendorEnum.CiscoIpPhone, OsVendorEnum.AvayaIpPhone, OsVendorEnum.LinksysPapVoip, OsVendorEnum.NortelIpPhone],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.Gaming]: [OsVendorEnum.All, OsVendorEnum.Xbox360, OsVendorEnum.PlayStation2, OsVendorEnum.GameCube, OsVendorEnum.Wii, OsVendorEnum.PlayStation3, OsVendorEnum.PlayStation, OsVendorEnum.Xbox, OsVendorEnum.Nintendo],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.Printer]: [OsVendorEnum.All, OsVendorEnum.HpPrinter, OsVendorEnum.CanonPrinter, OsVendorEnum.XeroxPrinter, OsVendorEnum.DellPrinter, OsVendorEnum.BrotherPrinter, OsVendorEnum.EpsonPrinter],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.IotDevice]: [OsVendorEnum.All, OsVendorEnum.NestCamera, OsVendorEnum.NestThermostat, OsVendorEnum.WemoSmartSwitch, OsVendorEnum.WifiSmartPlug],
  // eslint-disable-next-line max-len
  [DeviceTypeEnum.HomeAvEquipment]: [OsVendorEnum.All, OsVendorEnum.SonyPlayer, OsVendorEnum.PanasonicG20Tv, OsVendorEnum.SamsungSmartTv, OsVendorEnum.AppleTv, OsVendorEnum.LibratoneSpeakers, OsVendorEnum.BoseSpeakers, OsVendorEnum.SonosSpeakers, OsVendorEnum.RokuStreamingStick],
  [DeviceTypeEnum.WdsDevice]: [OsVendorEnum.All, OsVendorEnum.TelenetCpe]
}

export const getDeviceOsVendorMap = () => {
  return Object.assign({}, deviceOsVendorMap)
}

export const getOsVendorOptions = (deviceType: DeviceTypeEnum) => {
  switch (deviceType) {
    case DeviceTypeEnum.Laptop:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.Windows, OsVendorEnum.MacOs, OsVendorEnum.ChromeOs, OsVendorEnum.Linux, OsVendorEnum.Ubuntu]
    case DeviceTypeEnum.Smartphone:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.Android, OsVendorEnum.BlackBerry, OsVendorEnum.Windows]
      break
    case DeviceTypeEnum.Tablet:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.AmazonKindle, OsVendorEnum.Android, OsVendorEnum.Windows]
    case DeviceTypeEnum.Voip:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.CiscoIpPhone, OsVendorEnum.AvayaIpPhone, OsVendorEnum.LinksysPapVoip, OsVendorEnum.NortelIpPhone]
    case DeviceTypeEnum.Gaming:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.Xbox360, OsVendorEnum.PlayStation2, OsVendorEnum.GameCube, OsVendorEnum.Wii, OsVendorEnum.PlayStation3, OsVendorEnum.PlayStation, OsVendorEnum.Xbox, OsVendorEnum.Nintendo]
    case DeviceTypeEnum.Printer:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.HpPrinter, OsVendorEnum.CanonPrinter, OsVendorEnum.XeroxPrinter, OsVendorEnum.DellPrinter, OsVendorEnum.BrotherPrinter, OsVendorEnum.EpsonPrinter]
    case DeviceTypeEnum.IotDevice:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.NestCamera, OsVendorEnum.NestThermostat, OsVendorEnum.WemoSmartSwitch, OsVendorEnum.WifiSmartPlug]
    case DeviceTypeEnum.HomeAvEquipment:
      // eslint-disable-next-line max-len
      return [OsVendorEnum.All, OsVendorEnum.SonyPlayer, OsVendorEnum.PanasonicG20Tv, OsVendorEnum.SamsungSmartTv, OsVendorEnum.AppleTv, OsVendorEnum.LibratoneSpeakers, OsVendorEnum.BoseSpeakers, OsVendorEnum.SonosSpeakers, OsVendorEnum.RokuStreamingStick]
    case DeviceTypeEnum.WdsDevice:
      return [OsVendorEnum.All, OsVendorEnum.TelenetCpe]
    default:
      return []
  }
}

export const getDeviceTypeOptions = () => {
  return [...Object.keys(DeviceTypeEnum)]
}

export const deviceOsVendorMappingTable = (
  deviceOsVendorMap: Record<string, string[]>,
  deviceOSRuleList: DeviceOSRule[]
) => {
  deviceOSRuleList.forEach(rule => {
    const { deviceType, osVendor } = rule
    if (osVendor === OsVendorEnum.All) {
      deviceOsVendorMap[deviceType] = []
    } else {
      // eslint-disable-next-line max-len
      deviceOsVendorMap[deviceType] = deviceOsVendorMap[deviceType].find((vendor: string) => vendor === osVendor)
        ? deviceOsVendorMap[deviceType]
          .filter((vendor: string) => vendor !== osVendor)
          .filter((vendor: string) => vendor !== OsVendorEnum.All)
        : deviceOsVendorMap[deviceType]
    }
  })

  return deviceOsVendorMap
}

export const isDeviceOSEnabled = (
  deviceType: string,
  option: string,
  deviceOSMappingTable: { [key: string]: string[] },
  editOsVendor: string
) => {
  if (editOsVendor) {
    if (editOsVendor === 'All') return false
    if (option === 'All' && editOsVendor !== 'All') return false
  }

  if (option === 'All') {
    const originDeviceOsMapping = getDeviceOsVendorMap()
    const originLength = originDeviceOsMapping[deviceType].filter(device => device !== 'All').length
    const optionLength = deviceOSMappingTable[deviceType].filter(device => device !== 'All').length
    if (originLength !== optionLength) return true
  }
  if (option === editOsVendor) return false
  if (deviceOSMappingTable[deviceType].length === 0) return true
  return deviceOSMappingTable[deviceType]
    .findIndex(vendor => vendor === option) === -1
}

export const isDeviceTypeEnabled = (
  deviceType: string,
  deviceOSMappingTable: { [key: string]: string[] }
) => {
  return deviceOSMappingTable[deviceType].length === 0
}
