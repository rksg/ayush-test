import { TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }     from '@acx-ui/formatter'

import { mockedKpiData } from './__tests__/mockedEcoFlex'
import {
  getKpiDelta,
  getKPIConfigsData,
  BenefitsConfig
} from './common'

describe('EcoFlex common utils', () => {
  describe('getKpiDelta', () => {
    const countFormatter = formatter('countFormat')
    const percentFormatter = formatter('percentFormat')
    it('returns correct trend and value for "+" deltaSign', () => {
      expect(getKpiDelta(1, 6, '+', countFormatter))
        .toEqual({ value: '+5', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(6, 1, '+', countFormatter))
        .toEqual({ value: '-5', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(6, 6, '+', countFormatter))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
      // percent
      expect(getKpiDelta(10, 50, '+', percentFormatter))
        .toEqual({ value: '+400%', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(50, 10, '+', percentFormatter))
        .toEqual({ value: '-80%', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(60, 60, '+', percentFormatter))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
    })
    it('returns correct trend and value for "-" deltaSign', () => {
      expect(getKpiDelta(1, 6, '-', countFormatter))
        .toEqual({ value: '+5', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(6, 1, '-', countFormatter))
        .toEqual({ value: '-5', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(1, 1, '-', countFormatter))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
        // percent
      expect(getKpiDelta(10, 50, '-', percentFormatter))
        .toEqual({ value: '+400%', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(50, 10, '-', percentFormatter))
        .toEqual({ value: '-80%', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(60, 60, '-', percentFormatter))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
    })
    it('returns None trend for other deltaSign', () => {
      expect(getKpiDelta(1, 1, 'none', countFormatter))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
    })

    it('returns undefined for invalid value', () => {
      expect(getKpiDelta(1, null, 'none', countFormatter))
        .toBeUndefined()
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