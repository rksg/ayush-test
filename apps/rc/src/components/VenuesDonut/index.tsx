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
import { useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { getAPStatusDisplayName } from '../Map/VenuesMap/helper'

const seriesMapping = [
  { key: ApVenueStatusEnum.REQUIRES_ATTENTION,
    name: getAPStatusDisplayName(ApVenueStatusEnum.REQUIRES_ATTENTION, false),
    color: cssStr('--acx-semantics-red-50') },
  { key: ApVenueStatusEnum.TRANSIENT_ISSUE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.TRANSIENT_ISSUE, false),
    color: cssStr('--acx-semantics-yellow-40') },
  { key: ApVenueStatusEnum.IN_SETUP_PHASE,
    name: getAPStatusDisplayName(ApVenueStatusEnum.IN_SETUP_PHASE, false),
    color: cssStr('--acx-neutrals-50') },
  { key: ApVenueStatusEnum.OPERATIONAL,
    name: getAPStatusDisplayName(ApVenueStatusEnum.OPERATIONAL, false),
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

function VenuesDonutWidget () {
  const basePath = useTenantLink('/venues/')
  const navigate = useNavigate()

  const onClick = () => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}`
    })
  }

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
              data={queryResults.data}
              onClick={onClick} />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default VenuesDonutWidget
