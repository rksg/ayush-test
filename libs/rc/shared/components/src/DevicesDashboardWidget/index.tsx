import {  Loader }                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                       from '@acx-ui/feature-toggle'
import { useDashboardV2OverviewQuery, useRwgListQuery } from '@acx-ui/rc/services'
import { useParams }                                    from '@acx-ui/react-router-dom'
import { RolesEnum }                                    from '@acx-ui/types'
import { hasRoles, useUserProfileContext }              from '@acx-ui/user'
import { useDashboardFilter }                           from '@acx-ui/utils'

import {
  getApStackedBarChartData,
  getSwitchStackedBarChartData,
  getEdgeStackedBarChartData,
  getRwgStackedBarChartData } from '../DevicesWidget/helper'
import { DevicesWidgetv2 } from '../DevicesWidget/index'

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
  const { isCustomRole } = useUserProfileContext()
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN,
    RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY]) || isCustomRole

  const { data: rwgs, isLoading: rwgLoading } =
    useRwgListQuery({ params: useParams() }, { skip: !(showRwgUI && rwgHasPermission) })

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
