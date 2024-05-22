import { Loader }                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useRwgListQuery, useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'
import { useParams }                                   from '@acx-ui/react-router-dom'

import {
  getApDonutChartData,
  getEdgeDonutChartData,
  getRwgDonutChartData,
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

  const showRwgUI = useIsSplitOn(Features.RUCKUS_WAN_GATEWAY_UI_SHOW)
  const { data: rwgs } = useRwgListQuery({ params: useParams() }, { skip: !showRwgUI })

  return (
    <Loader states={[queryResults]}>
      <DevicesWidget
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
        edgeData={queryResults.data.edgeData}
        rwgData={getRwgDonutChartData(rwgs?.data || [])}
      />
    </Loader>
  )
}
