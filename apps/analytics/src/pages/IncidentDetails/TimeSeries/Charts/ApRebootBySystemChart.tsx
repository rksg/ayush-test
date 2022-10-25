import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType }      from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'

import { TimeSeriesChartProps } from '../types'

import { getMarkers } from './incidentTimeSeriesMarker'

const apRebootBySystemQuery = () => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  apRebootBySystem: timeSeries(granularity:$granularity){
    time
    apRebootBySystemCount
  }
  `
export const ApRebootBySystemChart = (
  { chartRef, incident, data }: TimeSeriesChartProps
) => {
  const { apRebootBySystem, relatedIncidents } = data
  const { $t } = useIntl()

  const seriesMapping = [{
    key: 'apRebootBySystemCount',
    name: $t({ defaultMessage: 'Reboot by System Event' })
  }]

  const chartResults = getSeriesData(
    apRebootBySystem as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Reboot by System Event' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        chartResults.length ?
          <MultiLineTimeSeriesChart
            chartRef={chartRef}
            style={{ height, width }}
            data={chartResults}
            disableLegend={true}
            markers={getMarkers(relatedIncidents!, incident)}
          />
          : <NoData />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ApRebootBySystemChart, query: apRebootBySystemQuery }
export default chartConfig
