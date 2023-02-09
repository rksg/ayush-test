import { DeviceTypeEnum, OsVendorEnum } from '@acx-ui/rc/utils'

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
