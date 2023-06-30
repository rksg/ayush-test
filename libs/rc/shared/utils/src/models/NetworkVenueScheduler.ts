import { SchedulerTypeEnum } from './SchedulerTypeEnum'

export class NetworkVenueScheduler {
  type: SchedulerTypeEnum
  sun?: string
  mon?: string
  tue?: string
  wed?: string
  thu?: string
  fri?: string
  sat?: string

  constructor () {
    this.type = SchedulerTypeEnum.ALWAYS_ON
  }
}
