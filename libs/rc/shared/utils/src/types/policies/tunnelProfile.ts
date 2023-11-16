import { MtuTypeEnum, TunnelTypeEnum } from '../../models'

export interface TunnelProfile {
  id: string
  name: string
  tags: string
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  ageTimeMinutes: number
  type: TunnelTypeEnum
}

export interface TunnelProfileViewData {
  id: string
  name: string
  tags: string[]
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  ageTimeMinutes: number
  personalIdentityNetworkIds: string[]
  networkIds: string[]
}
