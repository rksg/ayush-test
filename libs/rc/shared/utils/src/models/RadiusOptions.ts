import { CalledStationIdTypeEnum } from './CalledStationIdTypeEnum'
import { NasIdDelimiterEnum }      from './NasIdDelimiterEnum'
import { NasIdTypeEnum }           from './NasIdTypeEnum'

export class RadiusOptions {
  nasIdType: NasIdTypeEnum
  nasIdDelimiter?: NasIdDelimiterEnum
  userDefinedNasId?: string
  nasRequestTimeoutSec: number
  nasMaxRetry: number
  nasReconnectPrimaryMin: number
  calledStationIdType: CalledStationIdTypeEnum
  singleSessionIdAccounting?: boolean

  constructor () {
    this.nasIdType = NasIdTypeEnum.BSSID
    this.nasRequestTimeoutSec = 3
    this.nasMaxRetry = 2
    this.nasReconnectPrimaryMin = 5
    this.calledStationIdType = CalledStationIdTypeEnum.BSSID

    this.nasIdDelimiter = NasIdDelimiterEnum.DASH
    this.userDefinedNasId = ''
    this.singleSessionIdAccounting = false
  }
}
