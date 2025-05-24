import _, { isNil } from 'lodash'

import { formatter }     from '@acx-ui/formatter'
import { noDataDisplay } from '@acx-ui/utils'

import { TrendTypeEnum } from './types/trendType'

export function getDeltaValue (
  before: number | null,
  after: number | null,
  tolerance: number,
  sign: string,
  format: ReturnType<typeof formatter> | ((x: number) => string),
  forcePercentDisplay: boolean
): { trend: TrendTypeEnum | 'transparent', value: string } {
  if (!_.isNumber(before) || !_.isNumber(after)){
    return { trend: 'transparent', value: noDataDisplay }
  }

  const isPercentFormat = format(after - before).includes('%')
  const shouldCalculate = forcePercentDisplay ? !isPercentFormat : isPercentFormat
  const delta = isPercentFormat ? parseFloat((after - before).toFixed(4)) : after - before
  const percentChange = (!shouldCalculate || before === 0) ? delta : (delta / before)
  const valueFormat = forcePercentDisplay ? formatter('percentFormat') : format
  const prefix = delta > 0 ? '+' : (delta < 0 ? '-' : '=')
  const value = prefix === '='
    ? prefix
    : `${prefix}${valueFormat(Math.abs(percentChange))}`

  let trend = null
  const isGreater = tolerance === 0 ? percentChange > tolerance : percentChange >= tolerance
  const isLess = tolerance === 0 ? percentChange < -tolerance : percentChange <= -tolerance
  switch (true) {
    case isGreater:
      trend = sign === '+' ? TrendTypeEnum.Positive : TrendTypeEnum.Negative
      break
    case isLess:
      trend = sign === '+' ? TrendTypeEnum.Negative : TrendTypeEnum.Positive
      break
    default:
      trend = TrendTypeEnum.None
  }

  return { trend, value }
}

export function kpiDelta (
  before: number | null,
  after: number | null,
  sign: string,
  format: ReturnType<typeof formatter> | ((x: number) => string)
) {
  const tolerance = 5 / 100 // 5%
  return getDeltaValue(before, after, tolerance, sign, format, true)
}

//Normalize the value by bringing it within the range
export function limitRange (value: number, min = 0.0, max = 1.0): number {
  if(isNil(value)) return value
  return Math.max(min, Math.min(max, value))
}

