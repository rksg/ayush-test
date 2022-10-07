import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Incident, getSeriesData, TimeSeriesData } from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart }          from '@acx-ui/components'
import { useNavigate, useTenantLink }              from '@acx-ui/react-router-dom'
import { formatter }                               from '@acx-ui/utils'

import { ChartsData } from '../services'

import { onMarkedAreaClick, getMarkers } from './incidentTimeSeriesMarker'

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
  { incident, data }: { incident: Incident, data: ChartsData }
) => {
  const { apDisconnectionCountChart, relatedIncidents } = data
  const { $t } = useIntl()
  const navigate = useNavigate()
  const basePath = useTenantLink('/analytics/incidents/')

  const seriesMapping = [{
    key: 'apDisconnectionCount',
    name: $t({ defaultMessage: 'Disconnections' })
  }]

  const chartResults = getSeriesData(apDisconnectionCountChart as TimeSeriesData, seriesMapping)

  return <Card title={$t({ defaultMessage: 'AP-RUCKUS Cloud Disconnections' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          yAxisProps={{ minInterval: 1 }}
          disableLegend={true}
          onMarkedAreaClick={onMarkedAreaClick(navigate, basePath, incident)}
          markers={getMarkers(relatedIncidents, incident)}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ApDisconnectionCountChart, query: apDisconnectionCountChartQuery }
export default chartConfig
