/**
 *	GuestSmsPasswordDuration
 *	SMS password duration
 **/

import { TimeUnitEnum } from './TimeUnitEnum'

export class GuestSmsPasswordDuration {
  duration: number

  unit: TimeUnitEnum

  constructor () {
    this.duration = 12

    this.unit = TimeUnitEnum.HOUR
  }
}
