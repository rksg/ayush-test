
export class VenueRogueAp {
  // Enables rogue ap detection in Venue
  enabled?: boolean
  
  // Rogue AP report will filter (omit) entries having an SNR lower than this threshold.
  reportThreshold?: number

  // Rogue policy ID
  roguePolicyId?: string
  
  constructor () {
    this.enabled = false
  }
}
  