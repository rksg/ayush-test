import { NetworkVenueScheduler } from './NetworkVenueScheduler'
import { RadioEnum }             from './RadioEnum'


export class NetworkVenue {
  // Venue ID
  venueId: string

  // Dual 5G Enabled
  dual5gEnabled?: boolean

  // Tri-band radio settings
  tripleBandEnabled?: boolean

  // Network ID
  networkId?: string

  // Client Isolation Allowlist ID
  clientIsolationAllowlistId?: string

  apGroups?: string[]

  // *Deprecated* Legacy all ap groups radio type configuration (might be removed in later release)
  allApGroupsRadio: string

  scheduler?: { type: string }

  // Activate the network on all AP-groups in the venue
  isAllApGroups?: boolean

  // All ap groups vlan ID. in case of null, it will be a reference to the network vlan
  allApGroupsVlanId?: number

  vlanPoolId?: string

  // All ap groups radio types configuration
  allApGroupsRadioTypes?: string[]

  id?: string

  constructor () {
    this.venueId = ''

    this.dual5gEnabled = true

    this.tripleBandEnabled = false

    this.apGroups = []

    this.allApGroupsRadio = RadioEnum.Both

    this.scheduler = new NetworkVenueScheduler()

    this.isAllApGroups = true

    this.allApGroupsRadioTypes = []
  }
}
