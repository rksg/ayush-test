import { Loader }                                                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                                                    from '@acx-ui/feature-toggle'
import { useGetIotControllerListQuery, useRwgListQuery, useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'
import { useParams }                                                                 from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                 from '@acx-ui/types'
import { hasRoles, useUserProfileContext }                                           from '@acx-ui/user'
import { useTrackLoadTime, widgetsMapping }                                          from '@acx-ui/utils'

import {
  getApDonutChartData,
  getEdgeDonutChartData,
  getRwgDonutChartData,
  getIotControllerDonutChartData,
  getVenueSwitchDonutChartData } from '../DevicesWidget/helper'
import { DevicesWidget } from '../DevicesWidget/index'

export function VenueDevicesWidget () {
  const params = useParams()
  const queryResults = useVenueDetailsHeaderQuery({
    params
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        apData: getApDonutChartData(data?.aps?.summary),
        switchData: getVenueSwitchDonutChartData(data),
        edgeData: getEdgeDonutChartData(data?.edges)
      },
      ...rest
    })
  })
  const { isCustomRole } = useUserProfileContext()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const rwgHasPermission = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR,
    RolesEnum.READ_ONLY
  ]) || isCustomRole
  const { data: rwgs } = useRwgListQuery({ params: useParams() },
    { skip: !(showRwgUI && rwgHasPermission) })

  const showIotControllerUI = useIsSplitOn(Features.IOT_PHASE_2_TOGGLE)
  const { data: iotControllers } = useGetIotControllerListQuery({ params: useParams() },
    { skip: !(showIotControllerUI) })

  useTrackLoadTime({
    itemName: widgetsMapping.VENUE_DEVICES_WIDGET,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <DevicesWidget
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
        edgeData={queryResults.data.edgeData}
        rwgData={getRwgDonutChartData(rwgs?.data || [])}
        iotControllerData={getIotControllerDonutChartData(iotControllers?.data || [])}
      />
    </Loader>
  )
}
