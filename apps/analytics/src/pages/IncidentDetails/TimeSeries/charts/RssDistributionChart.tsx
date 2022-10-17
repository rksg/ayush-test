import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  BarChartData,
  incidentSeverities,
  calculateSeverity,
  Incident
} from '@acx-ui/analytics/utils'
import { cssStr }                 from '@acx-ui/components'
import { Card, VerticalBarChart } from '@acx-ui/components'

import type { TimeSeriesChartProps, TimeSeriesChartResponse } from '../types'

const rssDistributionScale = 5
const rssThreshold = -80

const rssDistributionChartQuery = () => gql`
  rssDistribution(scale: ${rssDistributionScale}) {
    rss
    count
  }
`

const barColors = (incident: Incident, data: TimeSeriesChartResponse) => {
  // TODO: change color when confirmed
  const normalColor = cssStr('--acx-neutrals-50')
  const severityColor = cssStr(incidentSeverities[calculateSeverity(incident.severity)].color)

  return data.rssDistribution?.map(data => (
    data.rss <= rssThreshold ? severityColor : normalColor
  )).reverse()
}

export const RssDistributionChart = ({ data, incident }: TimeSeriesChartProps) => {
  const { rssDistribution } = data
  const { $t } = useIntl()

  const xValue = $t({ defaultMessage: 'RSS Distribution' })
  const yValue = $t({ defaultMessage: 'Samples' })

  const chartResults = {
    dimensions: [xValue, yValue],
    source: rssDistribution!.map(({ rss, count }) => [rss, count]).reverse(),
    seriesEncode: [{ x: xValue, y: yValue }]
  } as BarChartData

  return <Card title={$t({ defaultMessage: 'RSS Distribution' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <VerticalBarChart
          data={chartResults}
          style={{ height, width }}
          xAxisName={$t({ defaultMessage: '(RSS, in dBm)' })}
          barColors={barColors(incident, data)}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssDistributionChart, query: rssDistributionChartQuery }
export default chartConfig
