import { keyBy, mapValues, take } from 'lodash'
import { IntlShape, useIntl }     from 'react-intl'
import AutoSizer                  from 'react-virtualized-auto-sizer'

import { getSeriesData }                                 from '@acx-ui/analytics/utils'
import { NoData, qualitativeColorSet, StackedAreaChart } from '@acx-ui/components'

import { ChartKey, slaKpiConfig } from './helpers'
import { FranchisorTimeseries }   from './services'
import { ChartWrapper }           from './styledComponents'

interface SlaChartProps {
  chartKey: ChartKey
  chartData: FranchisorTimeseries | undefined
}

export const getSeriesMapping = (chartKey: ChartKey, $t: IntlShape['$t']) => {
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

export const removeErrors = (data: FranchisorTimeseries | undefined) => {
  if (!data) return {}
  const { errors, ...values } = data
  if (errors?.length) return {}
  return values
}

export function SlaChart ({ chartKey, chartData }: SlaChartProps) {
  const { $t } = useIntl()
  const { formatter } = slaKpiConfig[chartKey]
  const seriesMapping = getSeriesMapping(chartKey, $t)
  const data = getSeriesData(removeErrors(chartData!), seriesMapping)
  return <ChartWrapper>
    <AutoSizer>
      {({ height, width }) => data.length
        ? <StackedAreaChart
          data={data}
          style={{ width, height }}
          disableLegend
          disableAxis
          disableGrid
          totalMean
          stackColors={take(qualitativeColorSet(), seriesMapping.length)}
          seriesFormatters={{
            ...mapValues(keyBy(seriesMapping, 'key'), () => formatter),
            total: formatter
          }}
          tooltipTotalTitle={chartKey === 'experience'
            ? $t({ defaultMessage: 'Guest Experience' })
            : undefined}
        />
        : <NoData/>}
    </AutoSizer>
  </ChartWrapper>
}
