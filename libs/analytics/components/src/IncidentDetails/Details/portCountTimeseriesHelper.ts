import _              from 'lodash'
import { unitOfTime } from 'moment-timezone'

import { calculateGranularity } from '@acx-ui/analytics/utils'

export const getTimeseriesBuffer = (start: string, end: string) => {
  const granularity = calculateGranularity(start, end)

  const minutes = _.get({ PT15M: 120 }, granularity, 360) // < 1 day = 2hr; > 1 day = 6hr
  const buffer = {
    front: { value: minutes, unit: 'minutes' as unitOfTime.Base },
    back: { value: minutes, unit: 'minutes' as unitOfTime.Base }
  }
  return buffer
}
