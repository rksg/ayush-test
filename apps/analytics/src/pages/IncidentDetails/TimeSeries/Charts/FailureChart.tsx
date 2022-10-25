import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  Incident,
  getSeriesData,
  mapCodeToReason,
  codeToFailureTypeMap,
  TimeSeriesDataType
}                                         from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { useNavigate, useTenantLink }             from '@acx-ui/react-router-dom'
import { formatter }                              from '@acx-ui/utils'

import { onMarkAreaClick, getMarkers } from './incidentTimeSeriesMarker'

import type { TimeSeriesChartProps } from '../types'

const failureChartQuery = (incident: Incident) => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  failureChart: timeSeries(granularity: $granularity) {
    time
    ${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}:
      apConnectionFailureRatio(
        metric: "${codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap]}")
  }
  `

export const FailureChart = ({ chartRef, data, incident }: TimeSeriesChartProps) => {
  const { failureChart, relatedIncidents } = data
  const intl = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')
  const title = mapCodeToReason(codeToFailureTypeMap[incident.code], intl)

  const seriesMapping = [{
    key: codeToFailureTypeMap[incident.code as keyof typeof codeToFailureTypeMap],
    name: title
  }]

  const chartResults = getSeriesData(
    failureChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={title} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
            dataFormatter={formatter('percentFormatRound')}
            yAxisProps={{ max: 1, min: 0 }}
            disableLegend={true}
            onMarkAreaClick={onMarkAreaClick(navigate, basePath, incident)}
            markers={getMarkers(relatedIncidents!, incident)}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: FailureChart, query: failureChartQuery }
export default chartConfig
