import { gql }            from 'graphql-request'
import { renderToString } from 'react-dom/server'
import { useIntl }        from 'react-intl'
import AutoSizer          from 'react-virtualized-auto-sizer'

import { BarChartData, calculateSeverity, Incident } from '@acx-ui/analytics/utils'
import { Card, DistributionChart, TooltipWrapper }   from '@acx-ui/components'

import type { TimeSeriesChartProps, TimeSeriesChartResponse } from '../types'
import type { TooltipComponentFormatterCallbackParams }       from 'echarts'

const rssDistributionScale = 5
const rssThreshold = -80
const incidentsColors = {
  Grey: 'rgba(237,240,244,1)',
  P1: 'rgb(207,43,32)',
  P2: 'rgb(236,93,51)',
  P3: 'rgb(244,180,68)',
  P4: 'rgb(245,235,80)'
}

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

const barColors = (incident: Incident, data: TimeSeriesChartResponse) => {
  const normalColor = 'rgb(156, 172, 185)'
  const severityColor = incidentsColors[calculateSeverity(incident.severity)]

  return data.rssDistribution?.map(data => (
    data.rss <= rssThreshold ? severityColor : normalColor
  )).reverse()
}

export const RssDistributionChart = ({ data, incident }: TimeSeriesChartProps) => {
  const { rssDistribution } = data
  const { $t } = useIntl()

  const xValue = $t({ defaultMessage: 'RSS Distribution' })
  const yValue = $t({ defaultMessage: 'Samples' })

  const expectedResult = {
    dimensions: [xValue, yValue],
    source: rssDistribution!.map(({ rss, count }) => [rss, count]).reverse(),
    seriesEncode: [{ x: xValue, y: yValue }]
  } as BarChartData

  return <Card title={$t({ defaultMessage: 'RSS Distribution' })} type='no-border'>
    <AutoSizer>
      {({ height, width }) => (
        <DistributionChart
          data={expectedResult}
          style={{ height, width }}
          grid={{ bottom: '10%', top: '5%' }}
          xAxisName={$t({ defaultMessage: 'RSS (in dBm)' })}
          tooltipFormatter={tooltipFormatter}
          barColors={barColors(incident, data)}
        />
      )}
    </AutoSizer>
  </Card>
}

const chartConfig = { chart: RssDistributionChart, query: rssDistributionChartQuery }
export default chartConfig
