import { NetworkApGroup }        from './NetworkApGroup'
import { NetworkVenueScheduler } from './NetworkVenueScheduler'
import { RadioEnum }             from './RadioEnum'
import { RadioTypeEnum }         from './RadioTypeEnum'

export class NetworkVenue {
  venueId?: string
  dual5gEnabled?: boolean
  tripleBandEnabled?: Boolean
  networkId?: string
  clientIsolationAllowlistId?: string
  apGroups?: NetworkApGroup[]
  allApGroupsRadio?: RadioEnum
  scheduler?: NetworkVenueScheduler
  isAllApGroups?: boolean
  allApGroupsVlanId?: number
  vlanPoolId?: string
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
