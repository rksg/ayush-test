import { DpskNumberOfDevicesEnum } from './DpskNumberOfDevicesEnum'

export class DpskPassphrase {
  networkId?: string

  // SSID of DPSK network

  networkSsid: string

  // The user name is not mandatory and should be unique per tenant. In case the username was not sent, a unique one will be generated with DPSK_User_{#} format. When creating more than one passphrases, a suffix {#} will be generated for the user name

  username?: string

  // The number of devices allowed to authenticate using this passphrase.

  numberOfDevices: number

  // The MAC address binds the device to this passphrase, and must be unique per DPSK network. Leave blank when creating multiple passphrases in a single request.

  mac?: string

  // The passphrase is used for authentication and must be unique per DPSK network. Leave blank when creating multiple passphrases in a single request.

  passphrase?: string

  vlanId?: number

  // The email address of the user.

  email?: string

  // The mobile phone number of the user.

  phoneNumber?: string

  // Can be LIMITED (with specific number of device) or UNLIMITED (for unlimited number of device)

  numberOfDevicesType: DpskNumberOfDevicesEnum

  // Date the DPSK passphrase expires.  After this date, DPSK authentication attempts using this passphrase will fail.

  expirationDate?: Date

  id?: string

  createdDate?: Date

  constructor () {
    this.networkSsid = ''

    this.numberOfDevices = 1

    this.numberOfDevicesType = DpskNumberOfDevicesEnum.LIMITED
  }
}
