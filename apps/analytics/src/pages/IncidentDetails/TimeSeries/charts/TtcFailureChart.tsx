import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'

import {
  Incident,
  TimeSeriesData,
  getSeriesData,
  mapCodeToReason,
  codeToFailureTypeMap
} from '@acx-ui/analytics/utils'

import { FailureTimeSeriesChart } from '../../../../components/FailureTimeSeriesChart'
import { ChartsData }             from '../services'


const ttcFailureChartQuery = () => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  failureChart: timeSeries(granularity: $granularity) {
    time
    ttc: timeToConnect
  }
  `

export const TtcFailureChart = ({ incident, data }: { incident: Incident, data: ChartsData }) => {
  const { $t } = useIntl()
  const { failureChart, relatedIncidents } = data
  const title = mapCodeToReason(codeToFailureTypeMap[incident.code], useIntl())

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: title
  }]
  const chartResults = getSeriesData(failureChart as TimeSeriesData, seriesMapping)
  return <FailureTimeSeriesChart
    title={$t({ defaultMessage: 'CONNECTION EVENTS' })}
    incident={incident}
    relatedIncidents={relatedIncidents}
    data={chartResults}
  />
}

const chartConfig = { chart: TtcFailureChart, query: ttcFailureChartQuery }
export default chartConfig
