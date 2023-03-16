import {  Loader }                                                from '@acx-ui/components'
import { useDashboardOverviewQuery, useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import {  useParams }                                             from '@acx-ui/react-router-dom'
import { useDashboardFilter, NetworkNodePath }                    from '@acx-ui/utils'

import {
  getApDonutChartData,
  getEdgeDonutChartData,
  getSwitchDonutChartData
} from '../DevicesWidget/helper'
import { DevicesWidget } from '../DevicesWidget/index'

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

  return (
    <Loader states={[queryResults]}>
      <DevicesWidget
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
        edgeData={queryResults.data.edgeData}
        enableArrowClick
      />
    </Loader>
  )
}

export function DevicesDashboardWidgetV2 () {
  const { filters } = useDashboardFilter()
  const { filter: { networkNodes } } = filters
  const venueIds = networkNodes?.map((networkNode: NetworkNodePath) => networkNode[0].name)

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
        apData: getApDonutChartData(data?.summary?.aps?.summary),
        switchData: getSwitchDonutChartData(data),
        edgeData: getEdgeDonutChartData(data?.summary?.edges)
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
        enableArrowClick
      />
    </Loader>
  )
}
