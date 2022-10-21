import { forwardRef, RefCallback } from 'react'

import ReactECharts from 'echarts-for-react'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { getSeriesData, IncidentFilter } from '@acx-ui/analytics/utils'
import {
  Card,
  CardTypes,
  Loader,
  MultiLineTimeSeriesChart,
  cssStr,
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
  brush?: { timeWindow: TimeStampRange, setTimeWindow: (range: TimeStampRange) => void }
}

const NetworkHistoryWidget = forwardRef<
  ReactECharts,
  NetworkHistoryWidgetComponentProps
>((props, ref) => {
  const {
    hideTitle,
    type = 'default',
    filters,
    hideIncidents=false,
    brush
  } = props
  const { $t } = useIntl()
  let seriesMapping = [
    {
      key: 'newClientCount',
      name: $t({ defaultMessage: 'New Clients' })
    },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: Key; name: string }>
  const lineColors = [
    cssStr('--acx-accents-blue-50'),
    cssStr('--acx-accents-blue-30')
  ]
  if (!hideIncidents) {
    seriesMapping.push({
      key: 'impactedClientCount',
      name: $t({ defaultMessage: 'Impacted Clients' })
    })
    lineColors.push(cssStr('--acx-accents-orange-50'))
  }
  const queryResults = useNetworkHistoryQuery({ ...filters, hideIncidents }, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(data!, seriesMapping),
      ...rest
    })
  })
  const title = hideTitle ? '' : $t({ defaultMessage: 'Network History' })
  return (
    <Loader states={[queryResults]}>
      <Card title={title} type={type}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <MultiLineTimeSeriesChart
                style={{ width, height }}
                data={queryResults.data}
                lineColors={lineColors}
                brush={brush?.timeWindow}
                onBrushChange={brush?.setTimeWindow as (range: TimeStamp[]) => void}
                chartRef={ref as RefCallback<ReactECharts> | undefined}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
})

export default NetworkHistoryWidget
