import { formatter } from '@acx-ui/formatter'

import { getDeltaValue, kpiDelta, limitRange } from './kpiHelper'
import { TrendTypeEnum }                       from './types/trendType'

describe('kpiDelta', () => {
  it('should return correct data', () => {
    expect(kpiDelta(null, null, '+', formatter('percentFormat')))
      .toEqual({ trend: 'transparent', value: '--' })
    expect(kpiDelta(0, 0, '+', formatter('countFormat')))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(kpiDelta(5, 10, '+', formatter('countFormat')))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '+100%' })
    expect(kpiDelta(10, 5, '+', formatter('countFormat')))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '-50%' })
    expect(kpiDelta(5, 10, '-', formatter('countFormat')))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '+100%' })
    expect(kpiDelta(10, 5, '-', formatter('countFormat')))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '-50%' })
  })
  it('only take up to 4 digit decimal into consideration', () => {
    const args = [0.4, '+', formatter('percentFormat')] as const
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

describe('getDeltaValue', () => {
  const tolerance = 5 / 100

  it('should return correct data when forcePercentDisplay', () => {
    expect(getDeltaValue(null, null, tolerance, '+', formatter('percentFormat'), true))
      .toEqual({ trend: 'transparent', value: '--' })
    expect(getDeltaValue(0, 0, tolerance, '+', formatter('countFormat'), true))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(getDeltaValue(5, 10, tolerance, '+', formatter('countFormat'), true))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '+100%' })
    expect(getDeltaValue(10, 5, tolerance, '+', formatter('countFormat'), true))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '-50%' })
    expect(getDeltaValue(5, 10, tolerance, '-', formatter('countFormat'), true))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '+100%' })
    expect(getDeltaValue(10, 5, tolerance, '-', formatter('countFormat'), true))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '-50%' })
  })

  it('should return correct data when not forcePercentDisplay', () => {
    expect(getDeltaValue(null, null, 0, '+', formatter('percentFormat'), false))
      .toEqual({ trend: 'transparent', value: '--' })
    expect(getDeltaValue(0, 0, 0, '+', formatter('countFormat'), false))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(getDeltaValue(5, 10, 0, '+', formatter('percentFormat'), false))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '+100%' })
    expect(getDeltaValue(10, 5, 0, '+', formatter('percentFormat'), false))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '-50%' })
    expect(getDeltaValue(5, 10, 0, '-', formatter('countFormat'), false))
      .toEqual({ trend: TrendTypeEnum.Negative, value: '+5' })
    expect(getDeltaValue(10, 5, 0, '-', formatter('countFormat'), false))
      .toEqual({ trend: TrendTypeEnum.Positive, value: '-5' })
  })
  it('only take up to 4 digit decimal into consideration', () => {
    const args = [0.4, tolerance, '+', formatter('percentFormat'), true] as const
    expect(getDeltaValue(0.4000000000000005, ...args))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(getDeltaValue(0.400005, ...args))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(getDeltaValue(0.40001, ...args))
      .toEqual({ trend: TrendTypeEnum.None, value: '=' })
    expect(getDeltaValue(0.40006, ...args)) // rounding up
      .toEqual({ trend: TrendTypeEnum.None, value: '-0.01%' })
  })
})

describe('limitRange', () => {
  it('should return the correct value', async () => {
    expect(limitRange(0.01)).toEqual(0.01)
    expect(limitRange(-0.01)).toEqual(0)
    expect(limitRange(1)).toEqual(1)
    expect(limitRange(0)).toEqual(0)
    expect(limitRange(1.1)).toEqual(1)
    expect(limitRange(-10, 0, 100)).toEqual(0)
    expect(limitRange(101, 0, 100)).toEqual(100)
    expect(limitRange(undefined!)).toEqual(undefined)
    expect(limitRange(null!)).toEqual(null)
  })
})