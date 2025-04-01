import { MtuTypeEnum, NetworkSegmentTypeEnum, TunnelTypeEnum } from '../../models'

export interface TunnelProfile {
  id: string
  name: string
  tags: string
  mtuType: MtuTypeEnum
  mtuSize?: number
  forceFragmentation: boolean
  ageTimeMinutes: number
  type: NetworkSegmentTypeEnum
  mtuRequestRetry?: number
  mtuRequestTimeout?: number // unit is milliseconds
  keepAliveRetry?: number
  keepAliveInterval?: number // unit is seconds
  natTraversalEnabled?: boolean
  tunnelType?: TunnelTypeEnum
  destinationIpAddress?: string
}

export interface TunnelProfileViewData {
  id: string
  name: string
  tags?: string[]
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  ageTimeMinutes: number
  personalIdentityNetworkIds: string[]
  networkIds: string[]
  sdLanIds?: string[]
  type: NetworkSegmentTypeEnum
  mtuRequestRetry: number
  mtuRequestTimeout: number // unit is seconds
  keepAliveRetry: number
  keepAliveInterval: number // unit is milliseconds
  natTraversalEnabled?: boolean
  tunnelType?: TunnelTypeEnum
  destinationEdgeClusterId?: string
  destinationEdgeClusterName?: string
  destinationIpAddress?: string
  destinationEdgeClusterId?: string
  destinationEdgeClusterName?: string
}

export interface TunnelProfileFormType extends TunnelProfile {
  ageTimeUnit? : string
  mtuRequestTimeoutUnit? : string
  disabledFields?: string[]
  edgeClusterId ? : string
  venueId ? : string
}