import _ from 'lodash'

import { TrendTypeEnum }            from '@acx-ui/components'
import { FormatterType, formatter } from '@acx-ui/formatter'
import { getIntl, noDataDisplay }   from '@acx-ui/utils'

export function kpiDelta (
  before: number,
  after: number,
  sign: string,
  format: FormatterType | ((x: number) => string)
) {
  const { $t } = getIntl()
  const tolerance = 5 / 100 // 5%

  if (!_.isNumber(before) || !_.isNumber(after)){
    return { trend: 'transparent', value: noDataDisplay }
  }

  const isPercentFormat = typeof format === 'string' && format === 'percentFormat' as FormatterType
  const delta = isPercentFormat ? parseFloat((after - before).toFixed(4)) : after - before
  const percentChange = (isPercentFormat || before === 0) ? delta : (delta / before)

  const prefix = delta > 0 ? '+' : (delta < 0 ? '-' : '=')
  const value = $t({
    defaultMessage: '{equal, select, true {{prefix}} other {{prefix}{value}}}'
  }, {
    prefix,
    equal: prefix === '=',
    value: formatter('percentFormat')(Math.abs(percentChange))
  })

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
