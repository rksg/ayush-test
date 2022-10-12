import { gql }     from 'graphql-request'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { BarChartData }            from '@acx-ui/analytics/utils'
import { Card, DistributionChart, TooltipWrapper } from '@acx-ui/components'

import type { TimeSeriesChartProps } from '../types'
import type { TooltipComponentFormatterCallbackParams } from 'echarts'
import { renderToString } from 'react-dom/server'

export const rssDistributionScale = 5

const rssDistributionChartQuery = () => gql`
  rssDistribution(scale: ${rssDistributionScale}) {
    rss
    count
  }
`

export const tooltipFormatter = (params: TooltipComponentFormatterCallbackParams) => {
  const rss = Array.isArray(params)
    && Array.isArray(params[0].data) ? params[0].data[1] : ''
  const name = Array.isArray(params)
    && Array.isArray(params[0].data) && params[0].dimensionNames?.[1]
  return renderToString(
    <TooltipWrapper>
      <div>
        {name}:
        <b> {rss as string}</b>
      </div>
    </TooltipWrapper>
  )
}

export const RssDistributionChart = ({ data }: TimeSeriesChartProps) => {
  const { rssDistribution } = data
  const { $t } = useIntl()

  const xValue = 'Rss Distribution'
  const yValue = 'Samples'

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
          tooltipFormatter={tooltipFormatter}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssDistributionChart, query: rssDistributionChartQuery }
export default chartConfig
