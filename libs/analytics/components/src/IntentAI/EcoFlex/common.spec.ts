import { TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }     from '@acx-ui/formatter'

import { mockedKpiData } from './__tests__/mockedEcoFlex'
import {
  getDeltaRatio,
  getDeltaValue,
  getPillValue,
  getKPIConfigsData,
  BenefitsConfig
} from './common'

describe('EcoFlex common utils', () => {
  describe('getDeltaRatio', () => {
    it('returns correct ratio for valid numbers', () => {
      expect(getDeltaRatio(100, 120)).toBe(0.2)
      expect(getDeltaRatio(50, 25)).toBe(-0.5)
    })
    it('returns 0 if previous is 0', () => {
      expect(getDeltaRatio(0, 100)).toBe(0)
    })
    it('returns 0 if any arg is not a number', () => {
      expect(getDeltaRatio(undefined, 100)).toBe(0)
      expect(getDeltaRatio(100, undefined)).toBe(0)
      expect(getDeltaRatio(undefined, undefined)).toBe(0)
    })
  })

  describe('getDeltaValue', () => {
    it('returns correct difference for valid numbers', () => {
      expect(getDeltaValue(100, 120)).toBe(20)
      expect(getDeltaValue(50, 25)).toBe(-25)
    })
    it('returns 0 if any arg is not a number', () => {
      expect(getDeltaValue(undefined, 100)).toBe(0)
      expect(getDeltaValue(100, undefined)).toBe(0)
      expect(getDeltaValue(undefined, undefined)).toBe(0)
    })
  })

  describe('getPillValue', () => {

    const countFormatter = formatter('countFormat')

    it('returns correct trend and value for "+" deltaSign', () => {
      expect(getPillValue(5, countFormatter, '+'))
        .toEqual({ value: '5', trend: TrendTypeEnum.Positive })
      expect(getPillValue(-5, countFormatter, '+'))
        .toEqual({ value: '-5', trend: TrendTypeEnum.Negative })
      expect(getPillValue(0, countFormatter, '+'))
        .toEqual({ value: '0', trend: TrendTypeEnum.None })
    })
    it('returns correct trend and value for "-" deltaSign', () => {
      expect(getPillValue(5, countFormatter, '-'))
        .toEqual({ value: '5', trend: TrendTypeEnum.Negative })
      expect(getPillValue(-5, countFormatter, '-'))
        .toEqual({ value: '-5', trend: TrendTypeEnum.Positive })
      expect(getPillValue(0, countFormatter, '-'))
        .toEqual({ value: '0', trend: TrendTypeEnum.None })
    })
    it('returns None trend for other deltaSign', () => {
      expect(getPillValue(5, countFormatter, 'none'))
        .toEqual({ value: '5', trend: TrendTypeEnum.None })
    })
  })

  describe('getKPIConfigsData', () => {
    it('returns correct KPICardConfig array', () => {
      const result = getKPIConfigsData(
        BenefitsConfig,
        mockedKpiData.data.data,
        mockedKpiData.compareData.data
      )
      expect(result).toHaveLength(1)
      expect(result[0]).toMatchObject({
        key: BenefitsConfig[0].key,
        label: BenefitsConfig[0].label,
        value: '15.1',
        values: { value: '15.1' },
        valueMessage: BenefitsConfig[0].valueMessage,
        valueSuffixMessage: BenefitsConfig[0].valueSuffixMessage,
        valueSuffixClass: BenefitsConfig[0].valueSuffixClass,
        pillValue: { value: '-50%', trend: TrendTypeEnum.Positive },
        tooltip: BenefitsConfig[0].tooltip
      })
    })
  })
})