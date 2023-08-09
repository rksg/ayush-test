import { MtuTypeEnum } from '../../models'

export interface TunnelProfile {
  id: string
  name: string
  tags: string
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  ageTimeMinutes: number
}

export interface TunnelProfileViewData {
  id: string
  name: string
  tags: string[]
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  ageTimeMinutes: number
  networkSegmentationIds: string[]
  networkIds: string[]
}
