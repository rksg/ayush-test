import { NetworkSegmentationGroup } from '@acx-ui/rc/utils'

export interface NetworkSegmentationGroupForm extends NetworkSegmentationGroup {
  venueId: string
  venueName: string
  edgeId: string
  edgeName: string
  dhcpId: string
  dhcpName: string
  poolId: string
  poolName: string
  tags: string[]
  segments: number
  devices: number
  tunnelProfileName: string
  networkNames: string[]
}