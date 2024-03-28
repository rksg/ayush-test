import { take }    from 'lodash'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { getSeriesData }                                  from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, MultiLineTimeSeriesChart,
  qualitativeColorSet, StackedAreaChart, NoData, Select } from '@acx-ui/components'
import { formatter }            from '@acx-ui/formatter'
import type { AnalyticsFilter } from '@acx-ui/utils'

import {
  useSwitchesTrafficByVolumeQuery,
  SwitchesTrafficByVolumeData
} from './services'
import * as UI from './styledComponents'

type Key = keyof Omit<SwitchesTrafficByVolumeData, 'time'>

SwitchesTrafficByVolume.defaultProps = {
  vizType: 'line'
}

export function SwitchesTrafficByVolume ({
  filters, vizType, refreshInterval
} : { filters : AnalyticsFilter, vizType: string, refreshInterval?: number }) {
  const { $t } = useIntl()
  const seriesMapping = [
    { key: 'switchTotalTraffic', name: $t({ defaultMessage: 'Total' }) },
    { key: 'switchTotalTraffic_tx', name: $t({ defaultMessage: 'Tx' }) },
    { key: 'switchTotalTraffic_rx', name: $t({ defaultMessage: 'Rx' }) }
  ] as Array<{ key: Key, name: string }>

  const queryResults = useSwitchesTrafficByVolumeQuery(filters, {
    ...(refreshInterval ? { pollingInterval: refreshInterval } : {}),
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, vizType === 'area' ? seriesMapping.splice(1) : seriesMapping),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <UI.SelectPort>
          <Select
            showSearch
            options={[
              { label: 'Select...', value: '' },
              { label: '1/1/1', value: 1 },
              { label: '1/1/2', value: 2 },
              { label: '1/1/3', value: 3 },
              { label: '1/1/4', value: 4 },
              { label: '1/1/5', value: 5 }
            ]}
            onChange={() => {
              // console.log('value: ', value)
            }}
          />
        </UI.SelectPort>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              vizType === 'area' ?
                <StackedAreaChart
                  style={{ width, height }}
                  stackColors={take(qualitativeColorSet(), 2)}
                  data={queryResults.data}
                  tooltipTotalTitle={$t({ defaultMessage: 'Total Traffic' })}
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
