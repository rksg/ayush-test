import { pick } from 'lodash'
import moment   from 'moment-timezone'

export const dataApiURL = '/api/a4rc/api/rsa-data-api/graphql/analytics'

export const today = 'Today'
export const last1Hour = 'Last 1 Hour'
export const last24Hours = 'Last 24 Hours'
export const last7Days = 'Last 7 Days'
export const lastMonth = 'Last Month'
export const custom = 'Custom'

export const ranges = (subRange?: string[]) => {
  const defaultRange = {
    [last1Hour]: [
      moment().subtract(1, 'hours').seconds(0),
      moment().seconds(0)
    ],
    [today]: [moment().startOf('day').seconds(0), moment().seconds(0)],
    [last24Hours]: [
      moment().subtract(1, 'days').seconds(0),
      moment().seconds(0)
    ],
    [last7Days]: [moment().subtract(7, 'days').seconds(0), moment().seconds(0)],
    [lastMonth]: [
      moment().subtract(1, 'month').seconds(0),
      moment().seconds(0)
    ]
  }
  if (subRange) {
    return pick(defaultRange, subRange)
  }
  return defaultRange
}
