import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType }      from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { useNavigate, useTenantLink }             from '@acx-ui/react-router-dom'
import { formatter }                              from '@acx-ui/utils'

import { TimeSeriesChartProps } from '../types'

import { onMarkAreaClick, getMarkers } from './incidentTimeSeriesMarker'

const apDisconnectionCountChartQuery = () => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  apDisconnectionCountChart: timeSeries(granularity: "PT3M") {
    time
    apDisconnectionCount
  }
  `
export const ApDisconnectionCountChart = (
  { chartRef, incident, data }: TimeSeriesChartProps
) => {
  const { apDisconnectionCountChart, relatedIncidents } = data
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')

  const seriesMapping = [{
    key: 'apDisconnectionCount',
    name: $t({ defaultMessage: 'Disconnections' })
  }]

  const chartResults = getSeriesData(
    apDisconnectionCountChart as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'AP-RUCKUS Cloud Disconnections' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
            dataFormatter={formatter('countFormat')}
            yAxisProps={{ minInterval: 1 }}
            disableLegend={true}
            onMarkAreaClick={onMarkAreaClick(navigate, basePath, incident)}
            markers={getMarkers(relatedIncidents!, incident)}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ApDisconnectionCountChart, query: apDisconnectionCountChartQuery }
export default chartConfig
