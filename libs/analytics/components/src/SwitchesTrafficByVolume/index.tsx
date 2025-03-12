import { DefaultOptionType } from 'antd/lib/select'
import { take }              from 'lodash'
import { useIntl }           from 'react-intl'
import AutoSizer             from 'react-virtualized-auto-sizer'

import { getSeriesData }                                  from '@acx-ui/analytics/utils'
import { HistoricalCard, Loader, MultiLineTimeSeriesChart,
  qualitativeColorSet, StackedAreaChart, NoData, Select } from '@acx-ui/components'
import { Features, useIsSplitOn }           from '@acx-ui/feature-toggle'
import { formatter }                        from '@acx-ui/formatter'
import { useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'
import type { AnalyticsFilter }             from '@acx-ui/utils'

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
  filters, vizType, refreshInterval, enableSelectPort, portOptions, onPortChange, selectedPorts
} : {
  filters : AnalyticsFilter,
  vizType: string,
  refreshInterval?: number,
  enableSelectPort?: boolean,
  portOptions?: DefaultOptionType[],
  onPortChange?: (value: string) => void
  selectedPorts?: string[]
}) {
  const { $t } = useIntl()
  const supportPortTraffic = useIsSplitOn(Features.SWITCH_PORT_TRAFFIC)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const seriesMapping = [
    { key: 'switchTotalTraffic', name: $t({ defaultMessage: 'Total' }) },
    { key: 'switchTotalTraffic_tx', name: $t({ defaultMessage: 'Tx' }) },
    { key: 'switchTotalTraffic_rx', name: $t({ defaultMessage: 'Rx' }) }
  ] as Array<{ key: Key, name: string }>

  const queryResults = useSwitchesTrafficByVolumeQuery({
    ...filters, selectedPorts: selectedPorts || []
  },
  {
    ...(refreshInterval ? { pollingInterval: refreshInterval } : {}),
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, vizType === 'area' ? seriesMapping.splice(1) : seriesMapping),
      ...rest
    })
  }
  )

  useTrackLoadTime({
    itemName: widgetsMapping.SWITCHES_TRAFFIC_BY_VOLUME,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        {
          supportPortTraffic && enableSelectPort && portOptions && portOptions.length > 1 &&
          <UI.SelectPort>
            <Select
              defaultValue={null}
              showSearch
              options={portOptions}
              onChange={onPortChange}
              dropdownMatchSelectWidth={false}
              allowClear
            />
          </UI.SelectPort>
        }

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
