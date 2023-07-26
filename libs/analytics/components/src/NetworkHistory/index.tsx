import { forwardRef, RefCallback } from 'react'

import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { getSeriesData, IncidentFilter } from '@acx-ui/analytics/utils'
import {
  HistoricalCard,
  CardTypes,
  Loader,
  MultiLineTimeSeriesChart,
  NoData
} from '@acx-ui/components'
import { TimeStamp, TimeStampRange } from '@acx-ui/types'

import { NetworkHistoryData, useNetworkHistoryQuery } from './services'


type Key = keyof Omit<NetworkHistoryData, 'time'>

interface NetworkHistoryWidgetComponentProps {
  hideTitle?: boolean;
  type?: CardTypes;
  filters: IncidentFilter;
  hideIncidents?: boolean;
  brush?: { timeWindow: TimeStampRange, setTimeWindow: (range: TimeStampRange) => void },
  apCount?: number
}

export const NetworkHistory = forwardRef<
  ReactECharts,
  NetworkHistoryWidgetComponentProps
>((props, ref) => {
  const {
    hideTitle,
    type = 'default',
    filters,
    hideIncidents=false,
    brush,
    apCount
  } = props
  const { $t } = useIntl()
  let seriesMapping = [
    {
      key: 'newClientCount',
      name: $t({ defaultMessage: 'New Client Associations' })
    },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: Key; name: string }>
  if (!hideIncidents) {
    seriesMapping.push({
      key: 'impactedClientCount',
      name: $t({ defaultMessage: 'Impacted Clients' })
    })
  }
  const queryResults = useNetworkHistoryQuery({ ...filters, hideIncidents, apCount }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  const title = hideTitle ? undefined : $t({ defaultMessage: 'Network History' })
  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={title} type={type}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                brush={brush?.timeWindow}
                onBrushChange={brush?.setTimeWindow as (range: TimeStamp[]) => void}
                chartRef={ref as RefCallback<ReactECharts> | undefined}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </HistoricalCard>
    </Loader>
  )
})
