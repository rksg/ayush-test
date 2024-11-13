import { groupBy, isNaN } from 'lodash'
import AutoSizer          from 'react-virtualized-auto-sizer'

import {
  Card,
  Loader,
  MultiLineTimeSeriesChart,
  NoData } from '@acx-ui/components'
import { formatter }                      from '@acx-ui/formatter'
import { useGetEdgeTnmGraphHistoryQuery } from '@acx-ui/rc/services'
import { TimeStamp }                      from '@acx-ui/types'

interface EdgeTnmGraphProps {
  serviceId: string | undefined,
  itemIds: string[] | undefined,
  itemNameMap: Record<string, string>
}
export const EdgeTnmGraph = (props: EdgeTnmGraphProps) => {
  const { serviceId, itemIds, itemNameMap } = props

  const { chartData, isLoading, isFetching } = useGetEdgeTnmGraphHistoryQuery({
    params: { serviceId },
    payload: { ids: itemIds }
  }, {
    skip: !serviceId || !itemIds,
    selectFromResult: ({ data, ...others }) => {
      const itemDataMap = groupBy(data, 'itemid')
      const series = Object.keys(itemDataMap).map(itmeId => ({
        key: `series-${itmeId}`,
        name: itemNameMap[itmeId],
        // eslint-disable-next-line max-len
        data: itemDataMap[itmeId].map(v => [v.clock, isNaN(v.value) ? 0 : Number(v.value)]) as [TimeStamp, number][]
      }))

      return {
        chartData: series,
        ...others
      }
    }
  })

  return <Loader states={[{ isLoading, isFetching }]}
    style={{ backgroundColor: 'transparent', minHeight: 100 }}
  >
    <Card title={''} type='no-border'>
      <AutoSizer>
        {({ height, width }) => (
          chartData.length
            ? <MultiLineTimeSeriesChart
              style={{ height, width }}
              data={chartData}
              dataFormatter={formatter('percentFormatRound')}
            />
            : <NoData />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}