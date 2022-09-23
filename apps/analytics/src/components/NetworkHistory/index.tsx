import { forwardRef, RefObject } from 'react'

import EChartsReact from 'echarts-for-react'
import { useIntl }  from 'react-intl'
import AutoSizer    from 'react-virtualized-auto-sizer'

import { getSeriesData, IncidentFilter, MultiLineTimeSeriesChartData } from '@acx-ui/analytics/utils'
import {
  Card,
  CardTypes,
  Loader,
  MultiLineTimeSeriesChart,
  cssStr,
  NoData
} from '@acx-ui/components'
import { TimeStamp } from '@acx-ui/types'

import { TimeWindow } from '../../pages/Health/HealthPageContext'

import { NetworkHistoryData, useNetworkHistoryQuery } from './services'


type Key = keyof Omit<NetworkHistoryData, 'time'>

const lineColors = [
  cssStr('--acx-accents-blue-30'),
  cssStr('--acx-accents-blue-50'),
  cssStr('--acx-accents-orange-50')
]

interface NetworkHistoryWidgetComponentProps {
  hideTitle?: boolean;
  type?: CardTypes;
  filters: IncidentFilter;
  hideIncidents?: boolean;
  brush?: { timeWindow: TimeWindow, setTimeWindow: (range: TimeWindow) => void }
}

const NetworkHistoryWidget = forwardRef<
  EChartsReact, 
  NetworkHistoryWidgetComponentProps
>((props, ref) => {
  const {
    hideTitle,
    type = 'default',
    filters,
    hideIncidents,
    brush
  } = props
  const { $t } = useIntl()
  const seriesMappingIncidents = [
    { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
    {
      key: 'impactedClientCount',
      name: $t({ defaultMessage: 'Impacted Clients' })
    },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: Key; name: string }>

  const seriesMappingWithoutIncidents = [
    { key: 'newClientCount', name: $t({ defaultMessage: 'New Clients' }) },
    {
      key: 'connectedClientCount',
      name: $t({ defaultMessage: 'Connected Clients' })
    }
  ] as Array<{ key: Key; name: string }>

  const queryResults = useNetworkHistoryQuery(filters, {
    selectFromResult: ({ data, ...rest }) => ({
      data: getSeriesData(
        data!, 
        (hideIncidents) ? seriesMappingWithoutIncidents : seriesMappingIncidents
      ),
      ...rest
    })
  })

  const title = hideTitle ? '' : $t({ defaultMessage: 'Network History' })

  const Chart = ({ style, data, lineColors }: {
    style: React.CSSProperties
    data: MultiLineTimeSeriesChartData[],
    lineColors: string[]
  }) => (brush)
    ? ( <MultiLineTimeSeriesChart
      style={{ width: style.width, height: style.height }}
      data={data}
      lineColors={lineColors}
      brush={brush.timeWindow}
      onBrushChange={brush.setTimeWindow as (range: TimeStamp[]) => void}
      chartRef={ref as RefObject<EChartsReact> | undefined}
    />)
    : (<MultiLineTimeSeriesChart
      style={{ width: style.width, height: style.height }}
      data={data}
      lineColors={lineColors}
      chartRef={ref as RefObject<EChartsReact> | undefined}
    />)

  return (
    <Loader states={[queryResults]}>
      <Card title={title} type={type}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
              <Chart
                style={{ width, height }}
                data={queryResults.data}
                lineColors={lineColors}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
})

export default NetworkHistoryWidget
