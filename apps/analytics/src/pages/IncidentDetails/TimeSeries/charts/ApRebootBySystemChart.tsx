import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, TimeSeriesDataType } from '@acx-ui/analytics/utils'
import { Card, MultiLineTimeSeriesChart }    from '@acx-ui/components'
import { formatter }                         from '@acx-ui/utils'

import { TimeSeriesChartProps } from '../types'

import { getMarkers } from './incidentTimeSeriesMarker'

const apRebootBySystemQuery = () => gql`
  relatedIncidents: incidents(filter: {code: [$code]}) {
    id severity code startTime endTime
  }
  apRebootBySystem: timeSeries(granularity:$granularity){
    time
    apRebootBySystem: apRebootBySystemCount
  }
  `
export const ApRebootBySystemChart = (
  { chartRef, incident, data }: TimeSeriesChartProps
) => {
  const { apRebootBySystem, relatedIncidents } = data
  const { $t } = useIntl()

  const seriesMapping = [{
    key: 'apRebootBySystem',
    name: $t({ defaultMessage: 'Count' })
  }]

  const chartResults = getSeriesData(
    apRebootBySystem as Record<string, TimeSeriesDataType[]>, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Reboot By System Event' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <MultiLineTimeSeriesChart
          chartRef={chartRef}
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          yAxisProps={{ minInterval: 1 }}
          disableLegend={true}
          markers={getMarkers(relatedIncidents!, incident)}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: ApRebootBySystemChart, query: apRebootBySystemQuery }
export default chartConfig
