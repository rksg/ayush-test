import { useMemo } from 'react'

import { Loader, GoogleMap }                                    from '@acx-ui/components'
import { Features, useIsSplitOn }                               from '@acx-ui/feature-toggle'
import { useDashboardV2OverviewQuery }                          from '@acx-ui/rc/services'
import { useParams }                                            from '@acx-ui/react-router-dom'
import { useDashboardFilter, useTrackLoadTime, widgetsMapping } from '@acx-ui/utils'

import { usePreference } from '../usePreference'

import VenuesMap             from './VenuesMap'
import { massageVenuesData } from './VenuesMap/helper'

export function MapWidgetV2 () {
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  if (!isMapEnabled) {
    return <GoogleMap.NotEnabled />
  }

  return <ActualMapV2 />
}

function ActualMapV2 () {
  const { venueIds } = useDashboardFilter()
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const queryResults = useDashboardV2OverviewQuery({
    params: useParams(),
    payload: {
      filters: {
        venueIds
      }
    }
  })

  const {
    currentMapRegion,
    getReqState,
    updateReqState
  } = usePreference()

  const data = useMemo(() => massageVenuesData(queryResults.data), [queryResults])
  const isLoading = getReqState.isLoading || getReqState.isFetching || updateReqState.isLoading

  useTrackLoadTime({
    itemName: widgetsMapping.MAP,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader states={[queryResults, getReqState, updateReqState]}>
      { // due to GoogleMap js script cannot be reloaded with different loader configs
        isLoading === false &&
        <VenuesMap
          cluster={true}
          data={data}
          enableVenueFilter={true}
          language={'en'}
          region={currentMapRegion}
        />
      }
    </Loader>
  )
}
