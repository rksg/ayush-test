import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
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

import type { ChartProps } from '../types.d'

const rssThreshold = -80
const barColors = (severity: Incident['severity'], rssBuckets: number[]) => {
  const normalColor = cssStr('--acx-viz-diverging-central')
  const severityColor = cssStr(incidentSeverities[calculateSeverity(severity)].color)
  return rssBuckets.map(rss => rss <= rssThreshold ? severityColor : normalColor)
}

export const RssDistributionChart: React.FC<ChartProps> = (props) => {
  const { $t } = useIntl()

  const queryResults = useRssDistributionChartQuery(props.incident)

  return <Loader states={[queryResults]}>
    <Card title={$t({ defaultMessage: 'RSS Distribution' })} type='no-border'>
      <AutoSizer>
        {({ height, width }) => (
          <VerticalBarChart
            data={queryResults.data!}
            style={{ height, width }}
            xAxisName={$t({ defaultMessage: '(dBm)' })}
            barColors={barColors(
              props.incident.severity,
              queryResults.data!.source.map(([rss]) => rss as number)
            )}
          />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}
