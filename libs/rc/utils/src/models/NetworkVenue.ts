import { RadioEnum }     from '../contents'
import { RadioTypeEnum } from '../contents'

import { NetworkApGroup }        from './NetworkApGroup'
import { NetworkVenueScheduler } from './NetworkVenueScheduler'

export class NetworkVenue {
  // Venue ID
  venueId?: string

  // Dual 5G Enabled
  dual5gEnabled?: boolean

  // Tri-band radio settings
  tripleBandEnabled?: boolean

  // Network ID
  networkId?: string

  // Client Isolation Allowlist ID
  clientIsolationAllowlistId?: string

  apGroups?: NetworkApGroup[]

  // *Deprecated* Legacy all ap groups radio type configuration (might be removed in later release)
  allApGroupsRadio: RadioEnum

  scheduler?: NetworkVenueScheduler

  // Activate the network on all AP-groups in the venue
  isAllApGroups?: boolean

  // All ap groups vlan ID. in case of null, it will be a reference to the network vlan
  allApGroupsVlanId?: number

  vlanPoolId?: string

  // All ap groups radio types configuration
  allApGroupsRadioTypes?: RadioTypeEnum[]

  id?: string

  constructor () {
    this.dual5gEnabled = true

    this.tripleBandEnabled = false

    this.apGroups = []

    this.allApGroupsRadio = RadioEnum.Both

    this.scheduler = new NetworkVenueScheduler()

    this.isAllApGroups = true

    this.allApGroupsRadioTypes = []
  }
}
