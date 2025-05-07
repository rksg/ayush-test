/* eslint-disable max-len */
import { defineMessage } from 'react-intl'

import { getDeltaValue, TrendTypeEnum } from '@acx-ui/analytics/utils'
import { formatter }                    from '@acx-ui/formatter'

import { IntentConfigurationConfig }                               from '../IntentContext'
import { IntentKPIConfig, IntentKPIConfigExtend, KpiResultExtend } from '../useIntentDetailsQuery'

export const configuration: IntentConfigurationConfig = {
  label: defineMessage({ defaultMessage: 'Energy Saving' }),
  valueFormatter: formatter('enabledFormat')
}

//This is mandatory for wizard/detail page
export const kpis: IntentKPIConfig[] = [{
  key: 'eco-flex-kpi',
  label: defineMessage({ defaultMessage: 'TBD' }),
  format: formatter('bytesFormat'),
  deltaSign: '-'
}]

export const getKpiDelta = (
  before: number | null,
  after: number | null,
  sign: string,
  format: ReturnType<typeof formatter> | ((x: number) => string),
  isPill?: boolean
): { trend: TrendTypeEnum, value: string } | undefined => {
  if (!isPill) return undefined
  const { trend, value } = getDeltaValue(before, after, 0, sign, format, false)
  if (trend === 'transparent') return undefined
  return { trend, value }
}

export type KPICardConfig = {
  key: string
  label: ReturnType<typeof defineMessage>
  value?: string
  values?: {
    value?: string
    previous?: string
    total?: string
    isShowPreviousSpan?: boolean
    isPill?: boolean
  }
  valueMessage?: ReturnType<typeof defineMessage>;
  valueSuffixMessage?: ReturnType<typeof defineMessage>;
  valueSuffixClass?: string;
  pillValue?: { value: string, trend: TrendTypeEnum }
  tooltip?: ReturnType<typeof defineMessage>
}

export const getKPIConfigsData = (kpiConfigs: IntentKPIConfigExtend[], after: KpiResultExtend, before: KpiResultExtend):KPICardConfig[] => {
  return kpiConfigs.map((kpiConfig) => {
    const { key, label, format, deltaSign, valueAccessor, valueFormatter, valueMessage, valueSuffixMessage, valueSuffixClass, tooltip } = kpiConfig
    const { value = null, previous = null, total = null, isShowPreviousSpan, isPill } = valueAccessor(after, before)
    const pillValue = getKpiDelta(previous, value, deltaSign, format, isPill)
    const valueFormat = valueFormatter || format

    return {
      key,
      label,
      value: valueFormat(value),
      values: { value: valueFormat(value), total: valueFormat(total), previous: valueFormat(previous), isShowPreviousSpan },
      valueMessage,
      valueSuffixMessage,
      valueSuffixClass,
      pillValue,
      tooltip
    }
  })
}

export const MetricsConfig: IntentKPIConfigExtend[] = [{
  key: 'enabled',
  label: defineMessage({ defaultMessage: 'AI-Optimized APs' }),
  format: formatter('countFormat'),
  deltaSign: 'none',
  valueMessage: defineMessage({ defaultMessage: '{value} / {total}' }),
  valueAccessor: (current: KpiResultExtend) =>
    ({
      value: current.enabled,
      total: current.apTotalCount
    }),
  tooltip: defineMessage({ defaultMessage: 'Number of APs actively using AI-Driven Energy Saving to optimize power consumption.' })
},{
  key: 'disabled',
  label: defineMessage({ defaultMessage: 'Excluded APs' }),
  format: formatter('countFormat'),
  deltaSign: 'none',
  valueMessage: defineMessage({ defaultMessage: '{value} / {total}' }),
  valueAccessor: (current: KpiResultExtend) =>
    ({
      value: current.disabled,
      total: current.apTotalCount
    }),
  tooltip: defineMessage({ defaultMessage: 'Number of APs manually excluded from AI-Driven Energy Saving. These APs operate at full power.' })
},{
  key: 'unsupported',
  label: defineMessage({ defaultMessage: 'Unsupported APs' }),
  format: formatter('countFormat'),
  deltaSign: 'none',
  valueMessage: defineMessage({ defaultMessage: '{value} / {total}' }),
  valueAccessor: (current: KpiResultExtend) =>
    ({
      value: current.unsupported,
      total: current.apTotalCount
    }),
  tooltip: defineMessage({ defaultMessage: 'Older generation APs that do not support AI-Driven Energy Saving due to hardware limitations.' })
}]

export const BenefitsConfig: IntentKPIConfigExtend[] = [{
  key: 'projectedPowerSaving',
  label: defineMessage({ defaultMessage: 'Projected power saving' }),
  format: formatter('percentFormatRound'),
  deltaSign: '-',
  valueMessage: defineMessage({ defaultMessage: '{value} kWh' }),
  valueAccessor: (current: KpiResultExtend, previous: KpiResultExtend) =>
    ({
      value: current.projectedPowerSaving,
      previous: previous.projectedPowerSaving,
      isPill: true
    }),
  valueFormatter: formatter('countFormat'),
  valueSuffixMessage: defineMessage({ defaultMessage: '/month' }),
  valueSuffixClass: 'ant-statistic-content-suffix-unit'
}]

export const KPIConfig: IntentKPIConfigExtend[] = [{
  key: 'enabled',
  label: defineMessage({ defaultMessage: 'AI-Optimized APs' }),
  format: formatter('countFormat'),
  deltaSign: '+',
  valueMessage: defineMessage({ defaultMessage: '{value} / {total}' }),
  valueAccessor: (current: KpiResultExtend, previous: KpiResultExtend) =>
    ({
      value: current.enabled,
      previous: previous.enabled,
      total: current.apTotalCount,
      isPill: true
    }),
  tooltip: defineMessage({ defaultMessage: 'Number of APs actively using AI-Driven Energy Saving to optimize power consumption.' })
},{
  key: 'disabled',
  label: defineMessage({ defaultMessage: 'Excluded APs' }),
  format: formatter('countFormat'),
  deltaSign: '-',
  valueMessage: defineMessage({ defaultMessage: '{value} / {total}' }),
  valueAccessor: (current: KpiResultExtend, previous: KpiResultExtend) =>
    ({
      value: current.disabled,
      previous: previous.disabled,
      total: current.apTotalCount,
      isPill: true
    }),
  tooltip: defineMessage({ defaultMessage: 'Number of APs manually excluded from AI-Driven Energy Saving. These APs operate at full power.' })
},{
  key: 'unsupported',
  label: defineMessage({ defaultMessage: 'Unsupported APs' }),
  format: formatter('countFormat'),
  deltaSign: 'none',
  valueMessage: defineMessage({ defaultMessage: '{value} / {total}' }),
  valueAccessor: (current: KpiResultExtend) =>
    ({
      value: current.unsupported,
      total: current.apTotalCount
    }),
  tooltip: defineMessage({ defaultMessage: 'Older generation APs that do not support AI-Driven Energy Saving due to hardware limitations.' })
},{
  key: 'powerConsumption',
  label: defineMessage({ defaultMessage: 'Power Consumption' }),
  format: formatter('percentFormatRound'),
  deltaSign: '-',
  valueMessage: defineMessage({ defaultMessage: '{value} kWh' }),
  valueAccessor: (current: KpiResultExtend, previous: KpiResultExtend) =>
    ({
      value: current.powerConsumption,
      previous: previous.powerConsumption,
      isPill: true
    }),
  valueFormatter: formatter('countFormat'),
  tooltip: defineMessage({ defaultMessage: 'Total power consumed by all APs in this zone per day, measured in kilowatt-hours (kWh).' })
},{
  key: 'maxApPower',
  label: defineMessage({ defaultMessage: 'Max AP Power' }),
  format: formatter('countFormat'),
  deltaSign: 'none',
  valueMessage: defineMessage({ defaultMessage: '{value}W' }),
  valueAccessor: (current: KpiResultExtend) =>
    ({
      value: current.maxApPower
    }),
  tooltip: defineMessage({ defaultMessage: 'The highest power usage recorded by an AP, measured in watts (W).' })
},{
  key: 'minApPower',
  label: defineMessage({ defaultMessage: 'Min AP Power (Standard vs AI)' }),
  format: formatter('countFormat'),
  deltaSign: 'none',
  valueMessage: defineMessage({ defaultMessage: '{value}W' }),
  valueAccessor: (current: KpiResultExtend, previous: KpiResultExtend) =>
    ({
      value: current.minApPower,
      previous: previous.minApPower,
      isShowPreviousSpan: true
    }),
  valueSuffixMessage: defineMessage({ defaultMessage: 'vs <previousSpan>{previous}W</previousSpan>' }),
  valueSuffixClass: 'ant-statistic-content-suffix-conj',
  tooltip: defineMessage({ defaultMessage: 'Comparison of the lowest power consumed by an AP with and without AI-Driven Energy Saving.' })
}]
