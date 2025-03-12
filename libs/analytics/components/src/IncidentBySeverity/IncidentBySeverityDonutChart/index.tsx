import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { incidentSeverities, IncidentFilter }            from '@acx-ui/analytics/utils'
import { DonutChartData, NoActiveContent, NoActiveData } from '@acx-ui/components'
import {
  HistoricalCard,
  Loader,
  cssStr,
  DonutChart
} from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { useIncidentToggles }                                   from '../../useIncidentToggles'
import { IncidentsBySeverityData, useIncidentsBySeverityQuery } from '../services'

export function IncidentBySeverityDonutChart ({ filters, type }:
  { filters: IncidentFilter, type?:string }) {
  const { $t } = useIntl()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const toggles = useIncidentToggles()
  const queryResult = useIncidentsBySeverityQuery({ ...filters, toggles }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: { ...data } as IncidentsBySeverityData,
      ...rest
    })
  })

  const getChartData = (data: IncidentsBySeverityData): DonutChartData[] => {
    const chartData: DonutChartData[] = []
    for (const key in data) {
      const value = data[key as keyof typeof incidentSeverities]
      if (value > 0) {
        chartData.push({
          name: key,
          color: cssStr(incidentSeverities[key as keyof typeof incidentSeverities].color),
          value
        })
      }
    }
    return chartData
  }

  const data = getChartData(queryResult.data)

  const getContent = (size?: { width: number, height: number }) => {
    return size
      ? data && data.length > 0
        ? <DonutChart
          title={$t({ defaultMessage: 'Incidents' })}
          style={{ width: size.width, height: size.height }}
          legend='name-value'
          data={data}
        />
        : <NoActiveContent text={$t({ defaultMessage: 'No reported incidents' })} />
      : <AutoSizer>
        {({ width, height }) => (
          data && data.length > 0
            ? <DonutChart
              style={{ width, height }}
              legend='name-value'
              data={data}/>
            : <NoActiveData text={$t({ defaultMessage: 'No reported incidents' })} />
        )}
      </AutoSizer>
  }

  useTrackLoadTime({
    itemName: widgetsMapping.INCIDENT_BY_SEVERITY_DONUT_CHART,
    states: [queryResult],
    isEnabled: isMonitoringPageEnabled
  })

  return <Loader states={[queryResult]}>
    {
      type === 'no-card-style' ? getContent({ width: 100, height: 100 }) :
        <HistoricalCard title={$t({ defaultMessage: 'Incidents' })}>
          { getContent() }
        </HistoricalCard>
    }
  </Loader>
}
