import _ from 'lodash'

import { formatter }     from '@acx-ui/formatter'
import { noDataDisplay } from '@acx-ui/utils'

import { TrendTypeEnum } from './types/trendType'

export function kpiDelta (
  before: number | null,
  after: number | null,
  sign: string,
  format: ReturnType<typeof formatter> | ((x: number) => string)
) {
  const tolerance = 5 / 100 // 5%

  if (!_.isNumber(before) || !_.isNumber(after)){
    return { trend: 'transparent', value: noDataDisplay }
  }

  const isPercentFormat = format(after - before).includes('%')
  const delta = isPercentFormat ? parseFloat((after - before).toFixed(4)) : after - before
  const percentChange = (isPercentFormat || before === 0) ? delta : (delta / before)

  const prefix = delta > 0 ? '+' : (delta < 0 ? '-' : '=')
  const value = prefix === '='
    ? prefix
    : `${prefix}${formatter('percentFormat')(Math.abs(percentChange))}`

  let trend = null
  switch (true) {
    case percentChange >= tolerance:
      trend = sign === '+' ? TrendTypeEnum.Positive : TrendTypeEnum.Negative
      break
    case percentChange <= -tolerance:
      trend = sign === '+' ? TrendTypeEnum.Negative : TrendTypeEnum.Positive
      break
    default:
      trend = TrendTypeEnum.None
  }

  return { trend, value }
}
