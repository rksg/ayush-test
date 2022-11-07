import {  Loader }                   from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import {  useParams }                from '@acx-ui/react-router-dom'

import { getApDonutChartData, getSwitchDonutChartData } from '../DevicesWidget/helper'
import { DevicesWidget }                                from '../DevicesWidget/index'

export function DevicesDashboardWidget () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: {
        apData: getApDonutChartData(data?.summary?.aps?.summary),
        switchData: getSwitchDonutChartData(data)
      },
      ...rest
    })
  })

  return (
    <Loader states={[queryResults]}>
      <DevicesWidget
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
      />
    </Loader>
  )
}
