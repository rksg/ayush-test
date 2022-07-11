import AutoSizer from 'react-virtualized-auto-sizer'

import { cssStr, Loader }            from '@acx-ui/components'
import { Card }                      from '@acx-ui/components'
import { DonutChart }                from '@acx-ui/components'
import type { DonutChartData }       from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import {
  Dashboard,
  ApVenueStatusEnum
} from '@acx-ui/rc/services'
import { useParams } from '@acx-ui/react-router-dom'

const seriesMapping = [
  { key: ApVenueStatusEnum.REQUIRES_ATTENTION, name: 'Requires Attention',
    color: cssStr('--acx-semantics-red-50') },
  { key: ApVenueStatusEnum.TRANSIENT_ISSUE, name: 'Temporarily Degraded',
    color: cssStr('--acx-semantics-yellow-40') },
  { key: ApVenueStatusEnum.IN_SETUP_PHASE, name: 'In Setup Phase',
    color: cssStr('--acx-neutrals-50') },
  { key: ApVenueStatusEnum.OPERATIONAL, name: 'Operational',
    color: cssStr('--acx-semantics-green-60') }
] as Array<{ key: string, name: string, color: string }>

export const getVenuesDonutChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const venuesSummary = overviewData?.summary?.venues?.summary
  if (venuesSummary) {
    seriesMapping.forEach(({ key, name, color }) => {
      if (venuesSummary[key]) {
        chartData.push({
          name,
          value: venuesSummary[key],
          color
        })
      }
    })
  }
  return chartData
}

function Venues () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: getVenuesDonutChartData(data),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <Card title='Venues'>
        <AutoSizer>
          {({ height, width }) => (
            <DonutChart
              style={{ width, height }}
              data={queryResults.data} />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default Venues
