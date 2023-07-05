import { TrendTypeEnum } from '@acx-ui/components'

import { kpiDelta } from './helper'

describe('kpiDelta', () => {
  it('should return correct data', () => {
    expect(kpiDelta(null, null, '+', 'percentFormat'))
      .toEqual({ trend: 'transparent', value: '--' })
    expect(kpiDelta(0, 0, '+', 'countFormat'))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(kpiDelta(5, 10, '+', 'countFormat'))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '+100%' })
    expect(kpiDelta(10, 5, '+', 'countFormat'))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '-50%' })
    expect(kpiDelta(5, 10, '-', 'countFormat'))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '+100%' })
    expect(kpiDelta(10, 5, '-', 'countFormat'))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '-50%' })
  })
  it('only take up to 4 digit decimal into consideration', () => {
    const args = [0.4, '+', 'percentFormat'] as const
    expect(kpiDelta(0.4000000000000005, ...args))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(kpiDelta(0.400005, ...args))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(kpiDelta(0.40001, ...args))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(kpiDelta(0.40006, ...args)) // rounding up
      .toEqual({ trend: TrendTypeEnum.None, value: '-0.01%' })
  })
})