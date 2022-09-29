import { AccessEnum }     from './AccessEnum'
import { DeviceTypeEnum } from './DeviceTypeEnum'
import { OsVendorEnum }   from './OsVendorEnum'

export class DevicePolicyRule {
  name: string

  action: AccessEnum

  deviceType: DeviceTypeEnum

  osVendor: OsVendorEnum

  downloadRateLimit?: number

  uploadRateLimit?: number

  vlan?: number

  constructor () {
    this.name = ''

    this.action = AccessEnum.ALLOW

    this.deviceType = DeviceTypeEnum.Laptop

    this.osVendor = OsVendorEnum.All
  }
}
