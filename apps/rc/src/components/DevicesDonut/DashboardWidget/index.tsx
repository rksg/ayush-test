import {  Loader }                   from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import {  useParams }                from '@acx-ui/react-router-dom'

import { getApDonutChartData, getSwitchDonutChartData } from '../helper'
import DevicesDonut                                     from '../index'

function DevicesDashboardWidget () {
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
      <DevicesDonut
        apData={queryResults.data.apData}
        switchData={queryResults.data.switchData}
      />
    </Loader>
  )
}

export default DevicesDashboardWidget
