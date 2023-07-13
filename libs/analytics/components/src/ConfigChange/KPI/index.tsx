import { useState } from 'react'

import _                              from 'lodash'
import moment                         from 'moment-timezone'
import { MessageDescriptor, useIntl } from 'react-intl'

import {
  categoryTabs as kpiCatergories,
  kpisForTab,
  kpiConfig,
  useAnalyticsFilter,
  getFilterPayload,
  productNames
} from '@acx-ui/analytics/utils'
import { Loader, Tabs, TrendTypeEnum } from '@acx-ui/components'
import { get }                         from '@acx-ui/config'
import { FormatterType, formatter }    from '@acx-ui/formatter'
import { noDataDisplay }               from '@acx-ui/utils'

import { useKPIChangesQuery } from '../services'

import { kpiDelta }                               from './helper'
import { Statistic, TransparentTrend, TrendPill } from './styledComponents'

type ConfigChangeKPIConfig = {
  text?: MessageDescriptor
  apiMetric: string
  format: FormatterType | ((x: number) => string)
  deltaSign: '+' | '-'
}

type KPIProps = ConfigChangeKPIConfig & {
  kpiKey: string
  label: MessageDescriptor
  values: {
    before: Record<string, number>
    after: Record<string, number>
  }
}

const KPI = ({ apiMetric, label, format, deltaSign, values }: KPIProps) => {
  const { $t } = useIntl()
  const formatterFn = (typeof format === 'string')
    ? formatter(format as FormatterType)
    : format as ((x: number) => string)
  const { trend, value } =
    kpiDelta(values?.before[apiMetric], values?.after[apiMetric], deltaSign, formatterFn)
  return <Statistic
    title={$t(label, productNames)}
    value={$t(
      { defaultMessage: 'Before: {before} | After: {after}' },
      {
        before: _.isNumber(values?.before[apiMetric])
          ? formatterFn(values?.before[apiMetric]) : noDataDisplay,
        after: _.isNumber(values?.after[apiMetric])
          ? formatterFn(values?.after[apiMetric]) : noDataDisplay
      }
    )}
    suffix={trend !== 'transparent'
      ? <TrendPill value={value as string} trend={trend as TrendTypeEnum} />
      : <TransparentTrend children={value}/>}
  />
}

function hasConfigChange <RecordType> (
  column: RecordType | RecordType & { configChange?: ConfigChangeKPIConfig }
): column is RecordType & { configChange: ConfigChangeKPIConfig } {
  return !!(column as RecordType & {
    configChange: ConfigChangeKPIConfig
  }).configChange
}

export const KPIs = (props: { kpiTimeRanges: number[][] }) => {
  const isMLISA = get('IS_MLISA_SA')
  const { $t } = useIntl()
  const [tabKey, setTabKey] = useState('overview')

  const { kpis: kpiKeys } = kpisForTab(isMLISA)[tabKey as keyof ReturnType<typeof kpisForTab>]
  const kpis = kpiKeys
    .filter(key => hasConfigChange(kpiConfig[key as keyof typeof kpiConfig]))
    .reduce((agg, key: string) => {
      const config = kpiConfig[key as keyof typeof kpiConfig] as {
        text: MessageDescriptor, configChange: ConfigChangeKPIConfig }
      agg[key] = {
        kpiKey: key,
        label: config.configChange.text || config.text ,
        ...(config.configChange)
      } as Omit<KPIProps, 'values'>
      return agg
    }, {} as Record<string, Omit<KPIProps, 'values'>>)

  const { filters: { filter } } = useAnalyticsFilter()
  const [beforeStart, beforeEnd, afterStart, afterEnd] =
    props.kpiTimeRanges.flat().map(time => moment(time).toISOString())
  const queryResults = useKPIChangesQuery({
    ...getFilterPayload({ filter }),
    kpis: Object.values(kpis).map(({ apiMetric }) => apiMetric),
    beforeStart, beforeEnd, afterStart, afterEnd
  })

  return <Tabs
    onChange={setTabKey}
    activeKey={tabKey}
    defaultActiveKey='overview'
    type='card'
  >
    {kpiCatergories.map(tab=>
      <Tabs.TabPane tab={$t(tab.label)} key={tab.value}>
        <Loader states={[queryResults]}>
          {queryResults?.data
            ? Object.keys(kpis)
              .map(key => <KPI key={key} {...kpis[key]} values={queryResults.data!}/>)
            : undefined}
        </Loader>
      </Tabs.TabPane>)
    }
  </Tabs>
}