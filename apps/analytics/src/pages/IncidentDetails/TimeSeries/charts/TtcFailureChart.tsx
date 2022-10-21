import { gql }         from 'graphql-request'
import { useIntl }     from 'react-intl'
import { useNavigate } from 'react-router-dom'
import AutoSizer       from 'react-virtualized-auto-sizer'

import { getSeriesData, kpiConfig }                       from '@acx-ui/analytics/utils'
import { Card, Loader, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { useTenantLink }                                  from '@acx-ui/react-router-dom'
import { formatter }                                      from '@acx-ui/utils'

import { useKpiTimeseriesQuery, KpiPayload } from '../../../Health/Kpi/services'
import { getIncidentTimeSeriesPeriods }      from '../services'
import { TimeSeriesChartProps }              from '../types'

import { getMarkers, onMarkAreaClick } from './incidentTimeSeriesMarker'

const ttcFailureChartQuery = () => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  ttcFailureChart: timeSeries(granularity: $granularity) {
    time
    ttc: timeToConnect
  }
  `

export const aggregateTtc = (
  time:string[],
  ttc: (number|null)[],
  ttcCounts: ([number, number]|null)[]
) => time.reduce((agg, _, index) => {
  agg.ttc = agg.ttc
    .concat(ttc[index])
  agg.totalConnections = agg.totalConnections
    .concat(ttcCounts && ttcCounts[index] && ttcCounts[index]![1])
  agg.slowConnections = agg.slowConnections
    .concat(ttcCounts && ttcCounts[index] && ttcCounts[index]![1] - ttcCounts[index]![0])
  return agg
}, { time, ttc: [], totalConnections: [], slowConnections: [] } as {
  time: string[]
  ttc: (number|null)[]
  totalConnections: (number|null)[]
  slowConnections: (number|null)[]
})

export const TtcFailureChart = ({ chartRef, data, incident }: TimeSeriesChartProps) => {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  const { start, end } = getIncidentTimeSeriesPeriods(incident)
  const queryResults = useKpiTimeseriesQuery({
    path: incident.path,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    kpi: 'timeToConnect',
    threshold: kpiConfig.timeToConnect.histogram.initialThreshold.toString()
  } as KpiPayload, {
    selectFromResult: ({ data: connectionData, ...rest }) => {
      const { ttcFailureChart } = data
      const time = ttcFailureChart.time as string[]
      const ttc = ttcFailureChart.ttc as (number|null)[]
      const ttcCounts = connectionData?.data as ([number, number]|null)[]
      return { data: aggregateTtc(time, ttc, ttcCounts), ...rest } }
  })

  const seriesMapping = [
    { key: 'totalConnections', name: $t({ defaultMessage: 'Total Connections' }), show: true },
    { key: 'slowConnections', name: $t({ defaultMessage: 'Slow Connections' }), show: true },
    { key: 'ttc', name: $t({ defaultMessage: 'Avg Time To Connect' }), show: false }
  ]
  const seriesFormatters = {
    totalConnections: formatter('countFormat'),
    slowConnections: formatter('countFormat'),
    ttc: formatter('durationFormat')
  }

  const chartResults = getSeriesData(queryResults.data, seriesMapping)
  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: 'Connection Events' })} type='no-border'>
        <AutoSizer>
          {({ height, width }) => (
            chartResults.length ?
              <MultiLineTimeSeriesChart
                chartRef={chartRef}
                style={{ height, width }}
                data={chartResults}
                dataFormatter={formatter('countFormat')}
                seriesFormatters={seriesFormatters}
                onMarkAreaClick={onMarkAreaClick(navigate, basePath, incident)}
                markers={getMarkers(data.relatedIncidents!, incident)}
              />
              : <NoData />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

const chartConfig = { chart: TtcFailureChart, query: ttcFailureChartQuery }
export default chartConfig
