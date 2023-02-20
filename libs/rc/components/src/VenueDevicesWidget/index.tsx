import { Loader }                     from '@acx-ui/components'
import { useVenueDetailsHeaderQuery } from '@acx-ui/rc/services'
import { useParams }                  from '@acx-ui/react-router-dom'

import {
  getApDonutChartData,
  getEdgeDonutChartData,
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

  return (
    <Loader states={[queryResults]}>
      <DevicesWidget
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
        edgeData={queryResults.data.edgeData}
      />
    </Loader>
  )
}
