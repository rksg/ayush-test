import { forwardRef, RefObject } from 'react'

import EChartsReact from 'echarts-for-react'
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
  let seriesMapping = [
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

  if (hideIncidents) {
    seriesMapping = seriesMapping.filter(value => !value.name.includes('impacted'))
  }

  const queryResults = useNetworkHistoryQuery(filters, {
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
                style={{ width: width, height: height }}
                data={queryResults.data}
                lineColors={lineColors}
                brush={brush?.timeWindow}
                onBrushChange={brush?.setTimeWindow as (range: TimeStamp[]) => void}
                chartRef={ref as RefObject<EChartsReact> | undefined}
              />
              : <NoData/>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
})

export default NetworkHistoryWidget
