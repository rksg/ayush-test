import { useMemo } from 'react'

import { gql }     from 'graphql-request'
import _           from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                  from '@acx-ui/analytics/utils'
import { Card, cssStr, StackedAreaChart } from '@acx-ui/components'
import { formatter, getIntl }             from '@acx-ui/utils'

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

export function formatWithPercentageAndCount (
  totals: number[],
  percentage: unknown,
  tz?: string,
  index?: number
) {
  const { $t } = getIntl()
  return $t({
    defaultMessage: '{formattedPercentage} ({count} {count, plural, one {client} other {clients}})'
  }, {
    count: percentage as number * totals[index!],
    formattedPercentage: formatter('percentFormat')(percentage)
  })
}

export const RssQualityByClientsChart = ({ data }: TimeSeriesChartProps) => {
  const { rssQualityByClientsChart: items } = data
  const { $t } = useIntl()

  const [chartData, seriesFormatters] = useMemo(() => {
    const sets = [items.good, items.average, items.bad] as number[][]

    const totals = _.zipWith(...sets, (...values) => _.sum(values))
    const [good, average, bad] = _(totals)
      .map((total, index) => sets.map(set => set[index] ? set[index] / total : null))
      .unzip()
      .value()

    const formatWithCount = formatWithPercentageAndCount.bind(undefined, totals)

    const seriesFormatters = {
      good: formatWithCount,
      average: formatWithCount,
      bad: formatWithCount
    }

    const seriesMapping = [
      { key: 'bad', name: $t({ defaultMessage: 'Bad' }) },
      { key: 'average', name: $t({ defaultMessage: 'Average' }) },
      { key: 'good', name: $t({ defaultMessage: 'Good' }) }
    ]
    const chartData = getSeriesData({ ...items, good, average, bad }, seriesMapping)

    return [chartData, seriesFormatters]
  }, [$t, items])

  return <Card title={$t({ defaultMessage: 'RSS Quality By Clients' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <StackedAreaChart
          style={{ height, width }}
          data={chartData}
          dataFormatter={formatter('percentFormat')}
          yAxisProps={{ max: 1, min: 0 }}
          seriesFormatters={seriesFormatters}
          stackColors={lineColors}
          disableLegend={true}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssQualityByClientsChart, query: rssQualityByClientsChartQuery }
export default chartConfig
