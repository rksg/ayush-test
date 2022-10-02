
import { LteBandRegionEnum } from './LteBandRegionEnum'
  
export class LteBandLockChannel {
  band3G?: string[]
  
  band4G?: string[]
  
  region: LteBandRegionEnum
  
  constructor () {
    this.band3G = []
  
    this.band4G = []
  
    this.region = LteBandRegionEnum.DOMAIN_1
  }
}
  