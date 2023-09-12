import { CallbackDataParams } from 'echarts/types/dist/shared'
import { groupBy }            from 'lodash'
import moment                 from 'moment-timezone'
import { useIntl }            from 'react-intl'

import { cssStr, cssNumber, Loader, Tooltip, BarChart } from '@acx-ui/components'
import { formatter, DateFormatEnum }                    from '@acx-ui/formatter'
import { WarningTriangleOutlined }                      from '@acx-ui/icons'
import type { AnalyticsFilter }                         from '@acx-ui/utils'
import { noDataDisplay }                                from '@acx-ui/utils'

import { LabelledQuality }                                       from './config'
import { ClientInfoData, ConnectionQuality, useClientInfoQuery } from './services'
import { ErrorContainer }                                        from './styledComponents'
import { transformConnectionQualities }                          from './util'

import { maxEventsMsg } from '.'

export const durations = (items: ConnectionQuality[] | LabelledQuality[] | undefined) => {
  if (!items) return 0

  return items
    .map(item => moment(item.end).diff(item.start, 'milliseconds', true))
    .reduce((a, b) => a + b, 0)
}

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

  const { good, average, bad } =
    groupBy(parsedQualities.all, item => item.all.quality)

  return {
    totalConnectedTime: total,
    goodConnectionPercent: durations(good) / total,
    avgConnectionPercent: durations(average) / total,
    badConnectionPercent: durations(bad) / total
  }
}

export function ClientHealth (
  { filter, clientMac }: {
    filter: AnalyticsFilter,
    clientMac: string
  })
{
  const intl = useIntl()
  const { $t } = intl
  const { startDate, endDate, range } = filter

  const barColors = [
    cssStr('--acx-semantics-red-50'),
    cssStr('--acx-accents-orange-30'),
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

  const result = useClientInfoQuery(
    { startDate, endDate, range, clientMac: clientMac.toUpperCase() }
  )
  const { data, error } = result
  const parsedData = calculateHealthSummary(data)
  const isMaxEventError = error?.message?.includes('CTP:MAX_EVENTS_EXCEEDED')
  return isMaxEventError
    ? <ErrorContainer>
      <Tooltip title={maxEventsMsg(
        formatter(DateFormatEnum.DateTimeFormat)(startDate),
        formatter(DateFormatEnum.DateTimeFormat)(endDate),
        intl
      )}><WarningTriangleOutlined />
      </Tooltip>
    </ErrorContainer>
    : <Loader states={[result]}>
      <BarChart
        style={{ height: 90, width: 90, alignSelf: 'center' }}
        grid={{ height: 70 }}
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
