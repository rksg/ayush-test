import { sum } from 'lodash'
import { MessageDescriptor, useIntl } from 'react-intl'
import { AnalyticsFilter } from '@acx-ui/analytics/utils'
import { formatter } from '@acx-ui/utils'
import { ProgressPill, Loader, Card } from '@acx-ui/components'
import {
  useKpiHistogramQuery,
  useKpiTimeseriesQuery,
  KPITimeseriesResponse,
  KPIHistogramResponse
} from './services'
import { kpiConfig } from './config'

const transformTSResponse = ({ data }: KPITimeseriesResponse) => {
  const [success, total] = data.reduce(([success, total], datum) => (
    datum && datum.length && (datum[0] !== null && datum[1] !== null )
      ? [success + datum[0], total + datum[1]] : [success, total]
  ), [0, 0])
  return total > 0 ? (success / total) * 100 : 0
}

const tranformHistResponse = ({ data, kpi }: KPIHistogramResponse & { kpi: string }) => {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { splits, highlightAbove, isReverse, initialThreshold } = Object(config).histogram
  const indexOfThreshold = splits.indexOf(initialThreshold)
  const total = sum(data)
  const highlightedData = highlightAbove || isReverse
    ? data.slice(indexOfThreshold + 1)
    : data.slice(0, indexOfThreshold + 1)
  const success = sum(highlightedData)
  return total > 0 ? (success / total) * 100  : 0
}
const formatPillText = (value: number, suffix: string) => suffix
  ? `${formatter('percentFormatRound')(value / 100)} ${suffix}` : `${formatter('percentFormatRound')(value/ 100)}`

function HealthPill ({ filters, kpi }: { filters: AnalyticsFilter, kpi: string }) {
  const config = kpiConfig[kpi as keyof typeof kpiConfig]
  const { $t  } = useIntl()
  let queryResults
  if (Object(config).histogram) {
    queryResults = useKpiHistogramQuery({ ...filters, kpi }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data ? tranformHistResponse({ ...data!, kpi }) : 0
      })
    })
  } else {
    queryResults = useKpiTimeseriesQuery({ ...filters, kpi }, {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: data ? transformTSResponse(data!) : 0
      })
    })
  }
  const suffix = Object(config).pill.pillSuffix
  return <Loader states={[queryResults]} key={kpi}>
    <div>{config.text}</div>
    <ProgressPill percent={queryResults.data} formatter={value => formatPillText(value || 0, suffix)}/>
  </Loader>
}
export default HealthPill
