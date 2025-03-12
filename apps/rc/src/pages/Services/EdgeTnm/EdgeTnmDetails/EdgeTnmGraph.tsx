import { useEffect } from 'react'

import { groupBy, isNaN } from 'lodash'
import AutoSizer          from 'react-virtualized-auto-sizer'

import {
  MultiLineTimeSeriesChart,
  NoData,
  Loader,
  Card
} from '@acx-ui/components'
import { formatter }                      from '@acx-ui/formatter'
import { useGetEdgeTnmGraphHistoryQuery } from '@acx-ui/rc/services'
import { TimeStamp }                      from '@acx-ui/types'

interface EdgeTnmGraphProps {
  serviceId: string | undefined,
  graphName: string | undefined,
  itemIds: string[] | undefined,
  itemNameMap: Record<string, string>,
  isLoading?: boolean
}
export const EdgeTnmGraph = (props: EdgeTnmGraphProps) => {
  const { serviceId, graphName, itemIds, itemNameMap, isLoading: isParentLoading = false } = props

  const { chartData, isLoading, isFetching } = useGetEdgeTnmGraphHistoryQuery({
    params: { serviceId },
    payload: { ids: itemIds }
  }, {
    skip: !serviceId || !itemIds,
    selectFromResult: ({ data, ...others }) => {
      const itemDataMap = groupBy(data, 'itemid')
      const series = Object.keys(itemDataMap).map(itmeId => ({
        key: itemNameMap[itmeId],
        name: itemNameMap[itmeId],
        // eslint-disable-next-line max-len
        data: itemDataMap[itmeId]?.map(v => [Number(v.clock)*1000, isNaN(v.value) ? 0 : Number(v.value)]) as [TimeStamp, number][] ?? []
      }))

      return {
        chartData: series,
        ...others
      }
    }
  })

  useEffect(() => {
    if (isFetching) {
      // scroll to page bottom
      window.scrollTo(0, document.body.scrollHeight)
    }
  }, [isFetching])

  return <Loader states={[{ isLoading: isLoading || isParentLoading, isFetching }]}
    style={{ backgroundColor: 'transparent', minHeight: 400 }}
  >
    <Card title={graphName ?? ''} type='no-border'>
      <AutoSizer>
        {({ height, width }) => (
          chartData.length
            ? <MultiLineTimeSeriesChart
              style={{ height, width }}
              data={chartData}
              dataFormatter={formatter('countFormat')}
              grid={{ top: '20%' }}
            />
            : <NoData />
        )}
      </AutoSizer>
    </Card>
  </Loader>
}