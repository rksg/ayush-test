import {  Loader }                                                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                                                  from '@acx-ui/feature-toggle'
import { useDashboardOverviewQuery, useDashboardV2OverviewQuery, useRwgListQuery } from '@acx-ui/rc/services'
import { useParams }                                                               from '@acx-ui/react-router-dom'
import { useDashboardFilter }                                                      from '@acx-ui/utils'

import {
  getApDonutChartData,
  getEdgeDonutChartData,
  getSwitchDonutChartData,
  getApStackedBarChartData,
  getSwitchStackedBarChartData,
  getEdgeStackedBarChartData,
  getRwgStackedBarChartData,
  getRwgDonutChartData
} from '../DevicesWidget/helper'
import { DevicesWidget, DevicesWidgetv2 } from '../DevicesWidget/index'

export function DevicesDashboardWidget () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        apData: getApDonutChartData(data?.summary?.aps?.summary),
        switchData: getSwitchDonutChartData(data),
        edgeData: getEdgeDonutChartData(data?.summary?.edges)
      },
      ...rest
    })
  })

  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)

  const { data: rwgs } = useRwgListQuery({ params: useParams() }, { skip: !showRwgUI })

  return (
    <Loader states={[queryResults]}>
      <DevicesWidget
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
        edgeData={queryResults.data.edgeData}
        rwgData={getRwgDonutChartData(rwgs?.data || [])}
        enableArrowClick
      />
    </Loader>
  )
}

export function DevicesDashboardWidgetV2 () {
  const { venueIds } = useDashboardFilter()

  const queryResults = useDashboardV2OverviewQuery({
    params: useParams(),
    payload: {
      filters: {
        venueIds
      }
    }
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        apStackedData: getApStackedBarChartData(data?.summary?.aps?.summary),
        switchStackedData: getSwitchStackedBarChartData(data),
        edgeStackedData: getEdgeStackedBarChartData(data?.summary?.edges),
        apTotalCount: data?.aps?.totalCount,
        switchTotalCount: data?.switches?.totalCount,
        edgeTotalCount: data?.summary?.edges?.totalCount
      },
      ...rest
    })
  })

  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)

  const { data: rwgs } = useRwgListQuery({ params: useParams() }, { skip: !showRwgUI })

  return (
    <Loader states={[queryResults]}>
      <DevicesWidgetv2
        apStackedData={queryResults.data.apStackedData}
        switchStackedData={queryResults.data.switchStackedData}
        edgeStackedData={queryResults.data.edgeStackedData}
        rwgStackedData={getRwgStackedBarChartData(rwgs?.data || [])}
        apTotalCount={queryResults.data.apTotalCount || 0}
        switchTotalCount={queryResults.data.switchTotalCount || 0}
        edgeTotalCount={queryResults.data.edgeTotalCount || 0}
        rwgTotalCount={rwgs?.totalCount || 0}
        enableArrowClick
      />
    </Loader>
  )
}
