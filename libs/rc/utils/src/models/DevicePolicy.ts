import { AccessEnum }       from './AccessEnum'
import { DevicePolicyRule } from './DevicePolicyRule'

export class DevicePolicy {
  tenantId?: string

  name: string

  description?: string

  defaultAccess: AccessEnum

  rules?: DevicePolicyRule[]

  id?: string

  constructor () {
    this.name = ''

    this.defaultAccess = AccessEnum.ALLOW

    //@Size(  min = 1  , max = 32 )
    this.rules = []
  }
}
