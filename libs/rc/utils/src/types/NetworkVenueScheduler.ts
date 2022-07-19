import { SchedulerTypeEnum } from '../constants'

export class NetworkVenueScheduler {
  type: SchedulerTypeEnum

  mon?: string

  wed?: string

  thu?: string

  fri?: string

  sat?: string

  constructor () {
    this.type = SchedulerTypeEnum.ALWAYS_ON
  }
}
