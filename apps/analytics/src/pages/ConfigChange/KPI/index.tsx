import { useState } from 'react'

import _                              from 'lodash'
import moment                         from 'moment-timezone'
import { MessageDescriptor, useIntl } from 'react-intl'

import {
  categoryTabs as kpiCatergories,
  kpisForTab,
  kpiConfig,
  useAnalyticsFilter
} from '@acx-ui/analytics/utils'
import { Tabs, TrendPill } from '@acx-ui/components'
import { noDataDisplay }   from '@acx-ui/utils'

import { useKpiChangesQuery } from '../services'

import { ConfigChangeConfig, hasConfigChange } from './helper'
import { Statistic }                           from './styledComponents'

type KPIProps = {
  kpiKey: string
  apiKey: string
  label: MessageDescriptor
  format?: ConfigChangeConfig['format']
  values: {
    before: Record<string, number>
    after: Record<string, number>
  }
}

const KPI = ({ kpiKey, label, format, values }: KPIProps) => {
  const { $t } = useIntl()
  const formatterFn = format || ((v: number) => v)
  return <Statistic
    title={$t(label)}
    value={$t(
      { defaultMessage: 'before: {before} | after: {after}' },
      {
        before: _.isNumber(values?.before[kpiKey])
          ? formatterFn(values?.before[kpiKey]) : noDataDisplay,
        after: _.isNumber(values?.after[kpiKey])
          ? formatterFn(values?.after[kpiKey]) : noDataDisplay
      }
    )}
    suffix={<TrendPill value='-123' trend='negative' />}
  />
}

export const KPIs = (props: { kpiTimeRanges: number[][] }) => {
  const { $t } = useIntl()
  const [tabKey, setTabKey] = useState('overview')

  const { kpis: kpiKeys } = kpisForTab[tabKey as keyof typeof kpisForTab]
  const kpis = kpiKeys.reduce((agg, key: string) => {
    const config = kpiConfig[key as keyof typeof kpiConfig]
    agg[key] = {
      kpiKey: key,
      apiKey: (hasConfigChange(config) && config.configChange.apiMetric) || key,
      label: config.text,
      format: hasConfigChange(config) ? config.configChange.format : undefined
    }
    return agg
  }, {} as Record<string, Omit<KPIProps, 'values'>>)

  const { filters: { path } } = useAnalyticsFilter()
  const [beforeStart, beforeEnd, afterStart, afterEnd] =
    props.kpiTimeRanges.flat().map(time=>moment(time).format())
  const queryResults = useKpiChangesQuery({
    kpis: Object.values(kpis).map(({ apiKey })=>apiKey),
    path, beforeStart, beforeEnd, afterStart, afterEnd
  })

  return <Tabs
    onChange={(key) => setTabKey(key)}
    activeKey={tabKey}
    defaultActiveKey='overview'
    type='card'
  >
    {kpiCatergories.map(tab=>
      <Tabs.TabPane tab={$t(tab.label)} key={tab.value}>
        {queryResults?.data
          ? Object.keys(kpis)
            .map(key => <KPI {...kpis[key]} values={queryResults.data!}/>)
          : undefined}
      </Tabs.TabPane>)
    }
  </Tabs>
}