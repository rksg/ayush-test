import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import {
  HistoricalCard,
  Loader,
  MultiLineTimeSeriesChart,
  NoData
} from '@acx-ui/components'
import { formatter } from '@acx-ui/formatter'

// import { useEdgeTrafficByVolumeQuery, TrafficByVolumeData } from '@acx-ui/rc/services'

// type Key = keyof Omit<TrafficByVolumeData, 'time'>
function EdgeTrafficByVolumeWidget () {
  const { $t } = useIntl()
  // TODO: retrieve by API, use fake data for testing
  // const seriesMapping = [
  //   { key: 'traffic_port1', name: 'Port 1' },
  //   { key: 'traffic_port2', name: 'Port 2' },
  //   { key: 'traffic_port3', name: 'Port 3' }
  // ] as Array<{ key: Key, name: string }>


  //   const queryResults = useEdgeTrafficByVolumeQuery(filters, {
  //     selectFromResult: ({ data, ...rest }) => ({
  //       data: getSeriesData(data, seriesMapping),
  //       ...rest
  //     })
  //   })

  const queryResults = { data: [], isLoading: false }

  return (
    <Loader states={[queryResults]}>
      <HistoricalCard title={$t({ defaultMessage: 'Traffic by Volume' })}>
        <AutoSizer>
          {({ height, width }) => (
            queryResults.data.length ?
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

export { EdgeTrafficByVolumeWidget }