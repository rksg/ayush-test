import {  Loader }                                                               from '@acx-ui/components'
import { Features, useIsSplitOn }                                                from '@acx-ui/feature-toggle'
import { useDashboardV2OverviewQuery, useDeviceSummariesQuery, useRwgListQuery } from '@acx-ui/rc/services'
import { useParams }                                                             from '@acx-ui/react-router-dom'
import { RolesEnum }                                                             from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                       from '@acx-ui/user'
import { useDashboardFilter, useTrackLoadTime, widgetsMapping }                  from '@acx-ui/utils'

import {
  getApStackedBarChartData,
  getSwitchStackedBarChartData,
  getEdgeStackedBarChartData,
  getRwgStackedBarChartData } from '../DevicesWidget/helper'
import { DevicesWidgetv2 } from '../DevicesWidget/index'

export function DevicesDashboardWidgetV2 () {
  const { venueIds } = useDashboardFilter()

  const isNewDashboardQueryEnabled = useIsSplitOn(Features.DASHBOARD_NEW_API_TOGGLE)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const query = isNewDashboardQueryEnabled ? useDeviceSummariesQuery : useDashboardV2OverviewQuery

  const queryResults = query({
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
        apTotalCount: isNewDashboardQueryEnabled ?
          data?.summary?.aps?.totalCount : data?.aps?.totalCount,
        switchTotalCount: isNewDashboardQueryEnabled ?
          data?.summary?.switches?.totalCount : data?.switches?.totalCount,
        edgeTotalCount: data?.summary?.edges?.totalCount
      },
      ...rest
    })
  })
  const { isCustomRole } = useUserProfileContext()
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole

  const { data: rwgs, isLoading: rwgLoading, isSuccess: rwgSuccess } =
    useRwgListQuery({ params: useParams() }, { skip: !(showRwgUI && rwgHasPermission) })

  useTrackLoadTime({
    itemName: widgetsMapping.DEVICES_DASHBOARD_WIDGET,
    states: [queryResults, { isLoading: rwgLoading, isSuccess: rwgSuccess }],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults, { isLoading: rwgLoading }]}>
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
