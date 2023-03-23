import { take }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData, AnalyticsFilter }         from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, MultiLineTimeSeriesChart,
  qualitativeColorSet, StackedAreaChart, NoData } from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

import {
  useSwitchesTrafficByVolumeQuery,
  SwitchesTrafficByVolumeData
} from './services'

type Key = keyof Omit<SwitchesTrafficByVolumeData, 'time'>

SwitchesTrafficByVolume.defaultProps = {
  vizType: 'line'
}

export function SwitchesTrafficByVolume ({
  filters, vizType
} : { filters : AnalyticsFilter, vizType: string }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'switchTotalTraffic', name: $t({ defaultMessage: 'Total' }) },
    { key: 'switchTotalTraffic_tx', name: $t({ defaultMessage: 'Tx' }) },
    { key: 'switchTotalTraffic_rx', name: $t({ defaultMessage: 'Rx' }) }
  ] as Array<{ key: Key, name: string }>
  const stackColors = take(qualitativeColorSet(), 3).reverse()
  const queryResults = useSwitchesTrafficByVolumeQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, vizType === 'area' ? seriesMapping.reverse() : seriesMapping),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              vizType === 'area' ?
                <StackedAreaChart
                  style={{ width, height }}
                  stackColors={stackColors}
                  data={queryResults.data}
                  dataFormatter={formatter('bytesFormat')}
                /> :
                <MultiLineTimeSeriesChart
                  style={{ width, height }}
                  data={queryResults.data}
                  dataFormatter={formatter('bytesFormat')}
                />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
}
