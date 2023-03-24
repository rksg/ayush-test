import { DeviceTypeEnum, OsVendorEnum } from '@acx-ui/rc/utils'

import { DeviceOSRule } from './index'

export const getOsVendorOptions = (deviceType: DeviceTypeEnum) => {
  let OsVendorArray = []
  switch (deviceType) {
    case DeviceTypeEnum.Laptop:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Windows, OsVendorEnum.MacOs, OsVendorEnum.ChromeOs, OsVendorEnum.Linux, OsVendorEnum.Ubuntu]
      break
    case DeviceTypeEnum.Smartphone:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.Android, OsVendorEnum.BlackBerry, OsVendorEnum.Windows]
      break
    case DeviceTypeEnum.Tablet:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.AmazonKindle, OsVendorEnum.Android, OsVendorEnum.Windows]
      break
    case DeviceTypeEnum.Voip:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.CiscoIpPhone, OsVendorEnum.AvayaIpPhone, OsVendorEnum.LinksysPapVoip, OsVendorEnum.NortelIpPhone]
      break
    case DeviceTypeEnum.Gaming:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.Xbox360, OsVendorEnum.PlayStation2, OsVendorEnum.GameCube, OsVendorEnum.Wii, OsVendorEnum.PlayStation3, OsVendorEnum.Xbox, OsVendorEnum.Nintendo]
      break
    case DeviceTypeEnum.Printer:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.HpPrinter, OsVendorEnum.CanonPrinter, OsVendorEnum.XeroxPrinter, OsVendorEnum.DellPrinter, OsVendorEnum.BrotherPrinter, OsVendorEnum.EpsonPrinter]
      break
    case DeviceTypeEnum.IotDevice:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.NestCamera, OsVendorEnum.NestThermostat, OsVendorEnum.WemoSmartSwitch, OsVendorEnum.WifiSmartPlug]
      break
    case DeviceTypeEnum.HomeAvEquipment:
      // eslint-disable-next-line max-len
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.SonyPlayer, OsVendorEnum.PanasonicG20Tv, OsVendorEnum.SamsungSmartTv, OsVendorEnum.AppleTv, OsVendorEnum.LibratoneSpeakers, OsVendorEnum.BoseSpeakers, OsVendorEnum.SonosSpeakers, OsVendorEnum.RokuStreamingStick]
      break
    case DeviceTypeEnum.WdsDevice:
      OsVendorArray = [OsVendorEnum.All, OsVendorEnum.TelnetCpe]
      break
  }
  return OsVendorArray
}

export const getDeviceTypeOptions = () => {
  return [...Object.keys(DeviceTypeEnum)]
}

export const deviceOsVendorMappingTable = (deviceOSRuleList: DeviceOSRule[]) => {
  const mappingTable = {
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.Laptop]: [OsVendorEnum.All, OsVendorEnum.Windows, OsVendorEnum.MacOs, OsVendorEnum.ChromeOs, OsVendorEnum.Linux, OsVendorEnum.Ubuntu],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.Smartphone]: [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.Android, OsVendorEnum.BlackBerry, OsVendorEnum.Windows],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.Tablet]: [OsVendorEnum.All, OsVendorEnum.Ios, OsVendorEnum.AmazonKindle, OsVendorEnum.Android, OsVendorEnum.Windows],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.Voip]: [OsVendorEnum.All, OsVendorEnum.CiscoIpPhone, OsVendorEnum.AvayaIpPhone, OsVendorEnum.LinksysPapVoip, OsVendorEnum.NortelIpPhone],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.Gaming]: [OsVendorEnum.All, OsVendorEnum.Xbox360, OsVendorEnum.PlayStation2, OsVendorEnum.GameCube, OsVendorEnum.Wii, OsVendorEnum.PlayStation3, OsVendorEnum.Xbox, OsVendorEnum.Nintendo],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.Printer]: [OsVendorEnum.All, OsVendorEnum.HpPrinter, OsVendorEnum.CanonPrinter, OsVendorEnum.XeroxPrinter, OsVendorEnum.DellPrinter, OsVendorEnum.BrotherPrinter, OsVendorEnum.EpsonPrinter],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.IotDevice]: [OsVendorEnum.All, OsVendorEnum.NestCamera, OsVendorEnum.NestThermostat, OsVendorEnum.WemoSmartSwitch, OsVendorEnum.WifiSmartPlug],
    // eslint-disable-next-line max-len
    [DeviceTypeEnum.HomeAvEquipment]: [OsVendorEnum.All, OsVendorEnum.SonyPlayer, OsVendorEnum.PanasonicG20Tv, OsVendorEnum.SamsungSmartTv, OsVendorEnum.AppleTv, OsVendorEnum.LibratoneSpeakers, OsVendorEnum.BoseSpeakers, OsVendorEnum.SonosSpeakers, OsVendorEnum.RokuStreamingStick],
    [DeviceTypeEnum.WdsDevice]: [OsVendorEnum.All, OsVendorEnum.TelnetCpe]
  } as { [key: string]: string[] }

  deviceOSRuleList.forEach(rule => {
    const { deviceType, osVendor } = rule
    if (osVendor === OsVendorEnum.All) {
      mappingTable[deviceType] = []
    } else {
      // eslint-disable-next-line max-len
      mappingTable[deviceType] = mappingTable[deviceType].find((vendor: string) => vendor === osVendor)
        ? mappingTable[deviceType]
          .filter((vendor: string) => vendor !== osVendor)
          .filter((vendor: string) => vendor !== OsVendorEnum.All)
        : mappingTable[deviceType]
    }
  })

  return mappingTable
}

export const isDeviceOSEnabled = (
  deviceType: string,
  option: string,
  deviceOSMappingTable: { [key: string]: string[] },
  editOsVendor: string
) => {
  if (deviceOSMappingTable[deviceType].length === 0) return true
  if (option === editOsVendor) return false
  return deviceOSMappingTable[deviceType]
    .findIndex(vendor => vendor === option) === -1
}

export const isDeviceTypeEnabled = (
  deviceType: string,
  deviceOSMappingTable: { [key: string]: string[] }
) => {
  return deviceOSMappingTable[deviceType].length === 0
}
