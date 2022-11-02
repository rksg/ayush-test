import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  BarChartData,
  incidentSeverities,
  calculateSeverity,
  Incident
} from '@acx-ui/analytics/utils'
import {
  cssStr,
  Card,
  Loader,
  VerticalBarChart
} from '@acx-ui/components'

import { useRssDistributionChartQuery } from './services'

const rssThreshold = -80
const barColors = (severity: Incident['severity'], rssBuckets: number[]) => {
  const normalColor = cssStr('--acx-viz-diverging-central')
  const severityColor = cssStr(incidentSeverities[calculateSeverity(severity)].color)
  return rssBuckets.map(rss => rss <= rssThreshold ? severityColor : normalColor)
}

export const RssDistributionChart = ({ incident }: { incident: Incident }) => {
  const { $t } = useIntl()
  const xValue = $t({ defaultMessage: 'RSS Distribution' })
  const yValue = $t({ defaultMessage: 'Samples' })

  const queryResults = useRssDistributionChartQuery(incident, {
    selectFromResult: ({ data, ...rest }) => ({
      ...rest,
      data: data && {
        dimensions: [xValue, yValue],
        source: data!.map(({ rss, count }) => [rss, count]),
        seriesEncode: [{ x: xValue, y: yValue }]
      } as BarChartData
    })
  })

  return <Loader states={[queryResults]}>
    <div style={{ height: '250px' }}>
      <Card title={$t({ defaultMessage: 'RSS Distribution' })} type='no-border'>
        <AutoSizer>
          {({ height, width }) => (
            <VerticalBarChart
              data={queryResults.data!}
              style={{ height, width }}
              xAxisName={$t({ defaultMessage: '(dBm)' })}
              barColors={barColors(
                incident.severity,
                queryResults.data!.source.map(([rss]) => rss as number)
              )}
            />
          )}
        </AutoSizer>
      </Card>
    </div>
  </Loader>
}
