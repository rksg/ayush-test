import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { cssStr, Loader, Card , DonutChart }                   from '@acx-ui/components'
import type { DonutChartData }                                 from '@acx-ui/components'
import { Features, useIsSplitOn }                              from '@acx-ui/feature-toggle'
import { useDashboardV2OverviewQuery, useVenueSummariesQuery } from '@acx-ui/rc/services'
import {
  Dashboard,
  ApVenueStatusEnum
} from '@acx-ui/rc/utils'
import { useNavigateToPath, useParams }                         from '@acx-ui/react-router-dom'
import { useDashboardFilter, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { getAPStatusDisplayName } from '../MapWidget/VenuesMap/helper'

import * as UI from './styledComponents'


const seriesMapping = () => [
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
    color: cssStr('--acx-semantics-green-50') }
] as Array<{ key: string, name: string, color: string }>

export const getVenuesDonutChartData = (overviewData?: Dashboard): DonutChartData[] => {
  const chartData: DonutChartData[] = []
  const venuesSummary = overviewData?.summary?.venues?.summary
  if (venuesSummary) {
    seriesMapping().forEach(({ key, name, color }) => {
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

export function VenuesDashboardWidgetV2 () {
  const { $t } = useIntl()
  const onArrowClick = useNavigateToPath('/venues/')
  const { venueIds } = useDashboardFilter()

  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const isNewDashboardQueryEnabled = useIsSplitOn(Features.DASHBOARD_NEW_API_TOGGLE)
  const query = isNewDashboardQueryEnabled ? useVenueSummariesQuery : useDashboardV2OverviewQuery

  const queryResults = query({
    params: useParams(),
    payload: {
      filters: {
        venueIds
      }
    }
  },{
    selectFromResult: ({ data, ...rest }) => ({
      data: getVenuesDonutChartData(data),
      ...rest
    })
  })

  useTrackLoadTime({
    itemName: widgetsMapping.VENUES_DASHBOARD_WIDGET,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults]}>
      <Card title={$t({ defaultMessage: '<VenuePlural></VenuePlural>' })}
        onArrowClick={onArrowClick}>
        <AutoSizer>
          {({ height, width }) => (
            <UI.Container onClick={onArrowClick}>
              <DonutChart
                style={{ width, height }}
                size={'medium'}
                data={queryResults.data} />
            </UI.Container>
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}
