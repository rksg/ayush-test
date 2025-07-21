import { useIntl } from 'react-intl'

import { getSeriesData }                    from '@acx-ui/analytics/utils'
import { MultiLineTimeSeriesChart, NoData } from '@acx-ui/components'
import { formatter }                        from '@acx-ui/formatter'
import { UseQueryResult }                   from '@acx-ui/types'

import { ChartWrapper } from '../../styledComponents'

import { TrafficByRadioData } from './services'

export function TrafficTrend ({
  queryResults,
  height,
  width
}: {
  queryResults: UseQueryResult<TrafficByRadioData>,
  height: number,
  width: number
}) {
  const { $t } = useIntl()

  type Key = keyof Omit<TrafficByRadioData, 'time'>
  const seriesMapping = [
    { key: 'userTraffic_all', name: $t({ defaultMessage: 'All Bands' }) },
    { key: 'userTraffic_24', name: formatter('radioFormat')('2.4') },
    { key: 'userTraffic_5', name: formatter('radioFormat')('5') },
    { key: 'userTraffic_6', name: formatter('radioFormat')('6') }
  ] as Array<{ key: Key, name: string }>

  const data = getSeriesData(queryResults.data!, seriesMapping)

  return (data.length && data[0].data.length) ? (
    <ChartWrapper height={height} width={width}>
      <MultiLineTimeSeriesChart
        style={{ width, height }}
        data={data}
        dataFormatter={formatter('bytesFormat')}
      />
    </ChartWrapper>
  ) : (
    <NoData />
  )
}