import { MtuTypeEnum } from '../../models'

export interface TunnelProfile {
  id: string
  name: string
  tags: string
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
}

export interface TunnelProfileViewData {
  id: string
  name: string
  tags: string[]
  mtuType: MtuTypeEnum
  mtuSize: number
  forceFragmentation: boolean
  networkSegmentIds: string[]
  networkIds: string[]
}
