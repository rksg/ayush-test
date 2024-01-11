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
  tags?: string[]
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  ageTimeMinutes: number
  personalIdentityNetworkIds: string[]
  networkIds: string[]
  sdLanIds?: string[]
  type: TunnelTypeEnum
}

export interface TunnelProfileFormType extends TunnelProfile {
  ageTimeUnit? : string
  disabledFields?: string[]
}