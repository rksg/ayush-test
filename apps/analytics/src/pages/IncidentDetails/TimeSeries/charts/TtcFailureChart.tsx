import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'

import {
  Incident,
  TimeSeriesData,
  getSeriesData
} from '@acx-ui/analytics/utils'
import { Loader } from '@acx-ui/components'

import { FailureTimeSeriesChart }                   from '../../../../components/FailureTimeSeriesChart'
import { useKpiTimeseriesQuery, KpiPayload }        from '../../../Health/Kpi/services'
import { ChartsData, getIncidentTimeSeriesPeriods } from '../services'


const ttcFailureChartQuery = () => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  ttcFailureChart: timeSeries(granularity: $granularity) {
    time
    ttc: timeToConnect
  }
  `

export const TtcFailureChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { $t } = useIntl()
  const { start, end } = getIncidentTimeSeriesPeriods(incident)
  const queryResults = useKpiTimeseriesQuery({
    path: incident.path,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    kpi: 'timeToConnect'
  } as KpiPayload, {
    selectFromResult: ({ data: connectionData, ...rest }) => {
      const { ttcFailureChart } = data
      const time = ttcFailureChart.time as string[]
      const ttc = ttcFailureChart.ttc as (number|null)[]
      const ttcCounts = connectionData?.data as ([number, number]|null)[]
      return {
        data: time.reduce((agg, _, index) => {
          agg.ttc = agg.ttc
            .concat(ttc[index] && Math.round(ttc[index]!/1000))
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
        }), ...rest }
    }
  })

  const seriesMapping = [
    { key: 'totalConnections', name: $t({ defaultMessage: 'Total Connections' }) },
    { key: 'slowConnections', name: $t({ defaultMessage: 'Slow Connections' }) },
    { key: 'ttc', name: $t({ defaultMessage: 'Avg Time To Connect' }) }
  ]

  const chartResults = getSeriesData(queryResults.data as TimeSeriesData, seriesMapping)
  return <Loader states={[queryResults]}>
    <FailureTimeSeriesChart
      title={$t({ defaultMessage: 'CONNECTION EVENTS' })}
      incident={incident}
      relatedIncidents={data.relatedIncidents}
      data={chartResults}
    /></Loader>
}

const chartConfig = { chart: TtcFailureChart, query: ttcFailureChartQuery }
export default chartConfig
