import { mapValues, take } from 'lodash'
import { useIntl }         from 'react-intl'
import AutoSizer           from 'react-virtualized-auto-sizer'

import { getSeriesData }                                         from '@acx-ui/analytics/utils'
import { Loader, NoData, qualitativeColorSet, StackedAreaChart } from '@acx-ui/components'

import { FranchisorTimeseries, useFetchBrandTimeseriesQuery } from './services'
import { slaKpiConfig }                                       from './SlaTile'

import { ChartKey } from '.'

interface SlaChartProps {
  chartKey: ChartKey
  start: string
  end: string
  ssidRegex: string
  mock?: boolean
}

const transformTimeseries = (data?: FranchisorTimeseries, mock?: boolean) => {
  if (!data) return {}
  const { errors, ...values } = data
  if (errors?.length) return {}
  if (mock) {
    const { time, ...series } = values
    return {
      time,
      ...mapValues(series, () => time.map(() => Math.random()))
    }
  }
  return values
}

const getSeriesMapping = (chartKey: ChartKey, $t: ReturnType<typeof useIntl>['$t']) => {
  switch (chartKey) {
    case 'incident': return [
      { key: 'incidentCount', name: $t({ defaultMessage: 'Incidents' }) }
    ]
    case 'compliance': return [
      { key: 'ssidComplianceSLA', name: $t({ defaultMessage: 'Brand SSID Compliance' }) }
    ]
    case 'experience': return [
      { key: 'timeToConnectSLA', name: $t({ defaultMessage: 'Time to Connect' }) },
      { key: 'clientThroughputSLA', name: $t({ defaultMessage: 'Client Throughput' }) },
      { key: 'connectionSuccessSLA', name: $t({ defaultMessage: 'Connection Success' }) }
    ]
  }
}

export function SlaChart ({ mock, ...payload }: SlaChartProps) {
  const { $t } = useIntl()
  const { formatter } = slaKpiConfig[payload.chartKey]
  const seriesMapping = getSeriesMapping(payload.chartKey, $t)
  const timeseriesQuery = useFetchBrandTimeseriesQuery(payload, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(transformTimeseries(data!, mock), seriesMapping),
      ...rest
    })
  })
  return <Loader states={[timeseriesQuery]}>
    <AutoSizer>
      {(size) => timeseriesQuery.data.length
        ? <StackedAreaChart
          data={timeseriesQuery.data}
          dataFormatter={formatter}
          style={{ ...size }}
          disableLegend
          disableAxis
          stackColors={take(qualitativeColorSet(), seriesMapping.length)}
        />
        : <NoData/>}
    </AutoSizer>
  </Loader>
}
