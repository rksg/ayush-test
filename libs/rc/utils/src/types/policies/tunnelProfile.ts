import { MtuTypeEnum } from '../../models'

export interface TunnelProfile {
  id: string
  name: string
  tag : string
  mtuType: MtuTypeEnum
  mtuSize : number
  forceFragmentation : boolean
}
