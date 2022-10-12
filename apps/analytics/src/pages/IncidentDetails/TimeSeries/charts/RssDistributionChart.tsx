import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { BarChartData }            from '@acx-ui/analytics/utils'
import { Card, DistributionChart } from '@acx-ui/components'

import type { TimeSeriesChartProps } from '../types'

export const rssDistributionScale = 5

const rssDistributionChartQuery = () => gql`
  rssDistribution(scale: ${rssDistributionScale}) {
    rss
    count
  }
`

export const RssDistributionChart = ({ data }: TimeSeriesChartProps) => {
  const { rssDistribution } = data
  const { $t } = useIntl()

  const xValue = 'rssDistribution'
  const yValue = 'count'

  const expectedResult = {
    dimensions: [xValue, yValue],
    source: rssDistribution!.map(({ rss, count }) => [rss, count]),
    seriesEncode: [{ x: xValue, y: yValue }]
  } as BarChartData

  return <Card title={$t({ defaultMessage: 'RSS Distribution' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <DistributionChart
          data={expectedResult}
          style={{ height, width }}
          grid={{ bottom: '10%', top: '5%' }}
          title={$t({ defaultMessage: 'RSS (in dBm' })}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssDistributionChart, query: rssDistributionChartQuery }
export default chartConfig
