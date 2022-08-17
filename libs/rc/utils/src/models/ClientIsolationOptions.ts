import { IsolatePacketsTypeEnum } from '../contents'

export class ClientIsolationOptions {
  // if client isolation is enabled and packetsType is null, packetsType will be set to \"UNICAST\".

  packetsType?: IsolatePacketsTypeEnum

  // Automatic support for VRRP/HSRP.

  autoVrrp?: boolean

  constructor () {
    this.autoVrrp = false
  }
}
