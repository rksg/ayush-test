import {  Loader }                from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useDashboardV2OverviewQuery,
  useDeviceSummariesQuery,
  useRwgListQuery,
  useGetIotControllerListQuery
} from '@acx-ui/rc/services'
import { useParams }                                            from '@acx-ui/react-router-dom'
import { RolesEnum }                                            from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                      from '@acx-ui/user'
import { useDashboardFilter, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import {
  getApStackedBarChartData,
  getSwitchStackedBarChartData,
  getEdgeStackedBarChartData,
  getRwgStackedBarChartData,
  getIotControllerStackedBarChartData
} from '../DevicesWidget/helper'
import { DevicesWidgetv2 } from '../DevicesWidget/index'

export function DevicesDashboardWidgetV2 () {
  const params = useParams()
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

  const showIotControllerUI = useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)

  const { data: iotControllers, isLoading: iotControllerLoading, isSuccess: iotControllerSuccess } =
    useGetIotControllerListQuery({
      payload: {
        fields: [
          'id',
          'name',
          'inboundAddress',
          'publicAddress',
          'publicPort',
          'apiToken',
          'tenantId',
          'status',
          'assocVenueCount'
        ],
        pageSize: 10,
        sortField: 'name',
        sortOrder: 'ASC',
        filters: { tenantId: [params.tenantId] }
      }
    }, { skip: !showIotControllerUI })

  useTrackLoadTime({
    itemName: widgetsMapping.DEVICES_DASHBOARD_WIDGET,
    // eslint-disable-next-line max-len
    states: [queryResults, { isLoading: rwgLoading || iotControllerLoading, isSuccess: rwgSuccess || iotControllerSuccess }],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults, { isLoading: rwgLoading || iotControllerLoading }]}>
      <DevicesWidgetv2
        apStackedData={queryResults.data.apStackedData}
        switchStackedData={queryResults.data.switchStackedData}
        edgeStackedData={queryResults.data.edgeStackedData}
        rwgStackedData={getRwgStackedBarChartData(rwgs?.data || [])}
        iotControllerStackedData={getIotControllerStackedBarChartData(iotControllers?.data || [])}
        apTotalCount={queryResults.data.apTotalCount || 0}
        switchTotalCount={queryResults.data.switchTotalCount || 0}
        edgeTotalCount={queryResults.data.edgeTotalCount || 0}
        rwgTotalCount={rwgs?.totalCount || 0}
        iotControllerTotalCount={iotControllers?.totalCount || 0}
        enableArrowClick
      />
    </Loader>
  )
}
