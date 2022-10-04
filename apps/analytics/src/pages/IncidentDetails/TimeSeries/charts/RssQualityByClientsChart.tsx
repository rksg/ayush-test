import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                  from '@acx-ui/analytics/utils'
import { Card, cssStr, StackedAreaChart } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/utils'

import { ChartsData } from '../services'

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
  cssStr('--acx-semantics-green-50'),
  cssStr('--acx-semantics-yellow-40'),
  cssStr('--acx-semantics-red-50')
]

export const RssQualityByClientsChart = ({ data }: { data: ChartsData }) => {
  const { rssQualityByClientsChart } = data
  const intl = useIntl()
  const { $t } = intl

  const seriesMapping = [
    { key: 'good', name: $t({ defaultMessage: 'Good' }) },
    { key: 'average', name: $t({ defaultMessage: 'Average' }) },
    { key: 'bad', name: $t({ defaultMessage: 'Bad' }) }
  ]

  const chartResults = getSeriesData(rssQualityByClientsChart, seriesMapping)

  return <Card title={$t({ defaultMessage: 'Rss Quality By Clients' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <StackedAreaChart
          style={{ height, width }}
          data={chartResults}
          dataFormatter={formatter('countFormat')}
          lineColors={lineColors}
          disableLegend={true}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssQualityByClientsChart, query: rssQualityByClientsChartQuery }
export default chartConfig
