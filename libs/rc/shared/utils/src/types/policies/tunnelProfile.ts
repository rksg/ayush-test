import { MtuTypeEnum, NetworkSegmentTypeEnum } from '../../models'

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
}

export interface TunnelProfileFormType extends TunnelProfile {
  ageTimeUnit? : string
  mtuRequestTimeoutUnit? : string
  disabledFields?: string[]
}