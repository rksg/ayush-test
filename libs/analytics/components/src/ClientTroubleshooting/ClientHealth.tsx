import { useRef, useEffect, CSSProperties } from 'react'

import EChartsReact           from 'echarts-for-react'
import { CallbackDataParams } from 'echarts/types/dist/shared'
import { groupBy }            from 'lodash'
import moment                 from 'moment-timezone'
import { useIntl }            from 'react-intl'

import { AnalyticsFilter }           from '@acx-ui/analytics/utils'
import { cssStr, cssNumber, Loader } from '@acx-ui/components'
import { BarChart }                  from '@acx-ui/components'
import { noDataDisplay }             from '@acx-ui/rc/utils'
import { formatter }                 from '@acx-ui/utils'

import { LabelledQuality }                                       from './config'
import { ClientInfoData, ConnectionQuality, useClientInfoQuery } from './services'
import { transformConnectionQualities }                          from './util'

const durations = (items: ConnectionQuality[] | LabelledQuality[]) => items
  .map(item => moment(item.end).diff(item.start, 'milliseconds', true))
  .reduce((a, b) => a + b, 0)

const calculateHealthSummary = (data: ClientInfoData | undefined) => {
  const emptyData = {
    totalConnectedTime: 0,
    goodConnectionPercent: 0,
    avgConnectionPercent: 0,
    badConnectionPercent: 0
  }

  if (!data) return emptyData

  const qualities = data.connectionQualities
  const parsedQualities = transformConnectionQualities(qualities)

  if (Array.isArray(parsedQualities)) return emptyData

  const total = durations(parsedQualities.all)

  const { good = [], average = [], bad = [] } =
    groupBy(parsedQualities.all, item => item.all.quality)

  return {
    totalConnectedTime: total,
    goodConnectionPercent: durations(good) / total,
    avgConnectionPercent: durations(average) / total,
    badConnectionPercent: durations(bad) / total
  }
}

export function ClientHealth (
  { filter, clientMac, loaderStyle }: {
    filter: AnalyticsFilter,
    clientMac: string,
    loaderStyle?: CSSProperties
  })
{
  const { $t } = useIntl()
  const { startDate, endDate, range } = filter
  const data = useClientInfoQuery(
    { startDate, endDate, range, clientMac: clientMac.toUpperCase() },
    { skip: !clientMac }
  )

  const parsedData = calculateHealthSummary(data.data)

  const barColors = [
    cssStr('--acx-semantics-red-50'),
    cssStr('--acx-semantics-yellow-50'),
    cssStr('--acx-semantics-green-50')
  ]

  const labelFormatter = (params: CallbackDataParams) => {
    const value = (params.data as string[])?.[1]
    const parsedValue = value ? formatter('percentFormat')(value) : noDataDisplay
    return '{rich|' + parsedValue + '}'
  }

  const labelRichStyle = {
    rich: {
      color: cssStr('--acx-primary-black'),
      fontFamily: cssStr('--acx-neutral-brand-font'),
      fontSize: cssNumber('--acx-subtitle-5-font-size'),
      lineHeight: cssNumber('--acx-subtitle-5-line-height'),
      fontWeight: cssNumber('--acx-subtitle-5-font-weight')
    }
  }

  const divRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<EChartsReact>(null)

  useEffect(() => {
    const observer = new ResizeObserver(() => {
      if (divRef.current && chartRef.current) {
        const chart = chartRef.current.getEchartsInstance()
        chart.resize({ width: 80, height: 80 })
      }
    })

    if (divRef.current) {
      observer.observe(divRef.current)
    }

    return () => observer.disconnect()
  })

  return <Loader states={[data]}
    divRef={divRef}
    style={
      (!data || !data.data)
        ? loaderStyle
        : undefined
    }>
    <BarChart
      chartRef={chartRef}
      style={{ height: 100, width: 100, paddingTop: 20 }}
      data={{
        dimensions: ['HealthQuality', 'Value'],
        source: [
          [$t({ defaultMessage: 'Poor' }), parsedData.badConnectionPercent],
          [$t({ defaultMessage: 'Avg.' }), parsedData.avgConnectionPercent],
          [$t({ defaultMessage: 'Good' }), parsedData.goodConnectionPercent]
        ],
        seriesEncode: [{
          x: 'Value',
          y: 'HealthQuality'
        }]
      }}
      barColors={barColors}
      labelFormatter={labelFormatter}
      labelRichStyle={labelRichStyle}
    />
  </Loader>
}