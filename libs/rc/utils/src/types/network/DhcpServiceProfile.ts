import { IdAndName } from './IdAndName'

export class DhcpServiceProfile {
  venues?: IdAndName[]

  name: string

  vlanId: number

  subnetAddress: string

  subnetMask: string

  startIpAddress: string

  endIpAddress: string

  primaryDnsIp?: string

  secondaryDnsIp?: string

  leaseTimeHours: number

  leaseTimeMinutes: number

  id?: string

  constructor () {
    this.venues = []

    this.name = ''

    this.vlanId = 0

    this.subnetAddress = ''

    this.subnetMask = ''

    this.startIpAddress = ''

    this.endIpAddress = ''

    this.leaseTimeHours = 0

    this.leaseTimeMinutes = 0
  }
}
