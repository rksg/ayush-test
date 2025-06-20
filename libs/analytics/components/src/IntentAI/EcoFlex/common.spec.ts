import { TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }     from '@acx-ui/formatter'

import { IntentKPIConfigExtend } from '../useIntentDetailsQuery'

import { mockedKpiData } from './__tests__/mockedEcoFlex'
import {
  getKpiDelta,
  getKPIConfigsData,
  BenefitsConfig,
  MetricsConfig,
  KPIConfig
} from './common'

describe('EcoFlex common utils', () => {
  describe('getKpiDelta', () => {
    const countFormatter = formatter('countFormat')
    const percentFormatter = formatter('percentFormat')
    it('returns correct trend and value for "+" deltaSign', () => {
      expect(getKpiDelta(1, 6, '+', countFormatter, true))
        .toEqual({ value: '+5', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(6, 1, '+', countFormatter, true))
        .toEqual({ value: '-5', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(6, 6, '+', countFormatter, true))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
      // percent
      expect(getKpiDelta(10, 50, '+', percentFormatter, true))
        .toEqual({ value: '+400%', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(50, 10, '+', percentFormatter, true))
        .toEqual({ value: '-80%', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(60, 60, '+', percentFormatter, true))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
    })
    it('returns correct trend and value for "-" deltaSign', () => {
      expect(getKpiDelta(1, 6, '-', countFormatter, true))
        .toEqual({ value: '+5', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(6, 1, '-', countFormatter, true))
        .toEqual({ value: '-5', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(1, 1, '-', countFormatter, true))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
        // percent
      expect(getKpiDelta(10, 50, '-', percentFormatter, true))
        .toEqual({ value: '+400%', trend: TrendTypeEnum.Negative })
      expect(getKpiDelta(50, 10, '-', percentFormatter, true))
        .toEqual({ value: '-80%', trend: TrendTypeEnum.Positive })
      expect(getKpiDelta(60, 60, '-', percentFormatter, true))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
    })
    it('returns None trend for other deltaSign', () => {
      expect(getKpiDelta(1, 1, 'none', countFormatter, true))
        .toEqual({ value: '=', trend: TrendTypeEnum.None })
    })

    it('returns undefined for invalid value', () => {
      expect(getKpiDelta(1, null, 'none', countFormatter, true))
        .toBeUndefined()
    })

    it('returns undefined for no pass isPill', () => {
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

  describe('verify config calculation logics', () => {
    const getConfigValueAccessor = (configs: IntentKPIConfigExtend[], key: string) => {
      return configs.filter((config) => config.key === key)[0].valueAccessor
    }
    describe('MetricsConfig', () => {
      it('should return correct valueAccessor', () => {
        expect(MetricsConfig).toHaveLength(3)
        expect(getConfigValueAccessor(MetricsConfig, 'enabled')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 90,
          total: 120
        })
        expect(getConfigValueAccessor(MetricsConfig, 'excluded')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 20,
          total: 120
        })
        expect(getConfigValueAccessor(MetricsConfig, 'unsupported')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 10,
          total: 120
        })
      })
    })
    describe('BenefitsConfig', () => {
      it('should return correct valueAccessor', () => {
        expect(BenefitsConfig).toHaveLength(1)
        expect(getConfigValueAccessor(BenefitsConfig, 'powerSaving')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 15.1,
          previous: 30.2,
          isPill: true
        })
      })
    })
    describe('KPIConfig', () => {
      it('should return correct valueAccessor', () => {
        expect(KPIConfig).toHaveLength(6)
        expect(getConfigValueAccessor(KPIConfig, 'enabled')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 90,
          previous: 80,
          total: 120,
          isPill: true
        })
        expect(getConfigValueAccessor(KPIConfig, 'excluded')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 20,
          previous: 30,
          total: 120,
          isPill: true
        })
        expect(getConfigValueAccessor(KPIConfig, 'unsupported')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 10,
          total: 120
        })
        expect(getConfigValueAccessor(KPIConfig, 'powerConsumption')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 48,
          previous: 50,
          isPill: true
        })
        expect(getConfigValueAccessor(KPIConfig, 'maxApPower')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 25
        })
        expect(getConfigValueAccessor(KPIConfig, 'minApPower')(
          mockedKpiData.data.data, mockedKpiData.compareData.data)
        ).toEqual({
          value: 15,
          previous: 13,
          isShowPreviousSpan: true
        })
      })
    })
  })
})