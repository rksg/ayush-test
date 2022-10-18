import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                  from '@acx-ui/analytics/utils'
import { Card, cssStr, StackedAreaChart } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/utils'

import type { TimeSeriesChartProps } from '../types'

const rssGroups = {
  good: { lower: -74 },
  average: { lower: -85, upper: -75 },
  bad: { upper: -86 }
}

const sets = Object.entries(rssGroups).map(
  ([group, { lower, upper }]: [string, { lower?: number, upper?: number }]) => {
    const filter = [
      lower ? `gt: ${lower}` : '',
      upper ? `lte: ${upper}` : ''
    ].filter(Boolean).join(', ')
    return `${group}: clientCountByRss(filter: { rss: { ${filter} } })`
  }).join('\n')


const rssQualityByClientsChartQuery = () => gql`
  rssQualityByClientsChart: timeSeries(granularity: $granularity) {
    time
    ${sets}
  }
`

const lineColors = [
  cssStr('--acx-semantics-red-50'),
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-semantics-green-50')
]

export const RssQualityByClientsChart = ({ data }: TimeSeriesChartProps) => {
  const { rssQualityByClientsChart } = data
  const { $t } = useIntl()

  const Total: number[] = []
  const good = rssQualityByClientsChart.good as number[]
  const average = rssQualityByClientsChart.average as number[]
  const bad = rssQualityByClientsChart.bad as number[]

  for(let i = 0; i < good.length; i++) {
    Total.push(good[i] + average[i] + bad[i])
  }

  const rssQualityPercentFormat = {
    ...rssQualityByClientsChart,
    good: good.map((x, index) => {
      return x/Total[index]
    }),
    average: average.map((x, index) => {
      return x/Total[index]
    }),
    bad: bad.map((x, index) => {
      return x/Total[index]
    })
  }

  const seriesMapping = [
    { key: 'bad', name: $t({ defaultMessage: 'Bad' }) },
    { key: 'average', name: $t({ defaultMessage: 'Average' }) },
    { key: 'good', name: $t({ defaultMessage: 'Good' }) }
  ]

  const chartResults = getSeriesData(rssQualityPercentFormat, seriesMapping)

  return <Card title={$t({ defaultMessage: 'RSS Quality By Clients' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <StackedAreaChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('percentFormat')}
          yAxisProps={{ max: 1, min: 0 }}
          stackColors={lineColors}
          disableLegend={true}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssQualityByClientsChart, query: rssQualityByClientsChartQuery }
export default chartConfig
