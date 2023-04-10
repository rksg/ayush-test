import { useMemo } from 'react'

import { Loader, GoogleMap }                                      from '@acx-ui/components'
import { Features, useIsSplitOn }                                 from '@acx-ui/feature-toggle'
import { useDashboardOverviewQuery, useDashboardV2OverviewQuery } from '@acx-ui/rc/services'
import { useParams }                                              from '@acx-ui/react-router-dom'
import { useDashboardFilter, NetworkNodePath }                    from '@acx-ui/utils'

import { usePreference } from '../usePreference'

import VenuesMap             from './VenuesMap'
import { massageVenuesData } from './VenuesMap/helper'

export function MapWidget () {
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  if (!isMapEnabled) {
    return <GoogleMap.NotEnabled />
  }

  return <ActualMap/>
}

export function MapWidgetV2 () {
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  if (!isMapEnabled) {
    return <GoogleMap.NotEnabled />
  }

  return <ActualMapV2 />
}

function ActualMap () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  })

  const data = useMemo(() => massageVenuesData(queryResults.data), [queryResults])
  return (
    <Loader states={[queryResults]}>
      <VenuesMap cluster={true} data={data} enableVenueFilter={true} />
    </Loader>
  )
}

function ActualMapV2 () {
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
  })

  const {
    currentMapRegion,
    getReqState,
    updateReqState
  } = usePreference()

  const data = useMemo(() => massageVenuesData(queryResults.data), [queryResults])
  const isLoading = getReqState.isLoading || getReqState.isFetching || updateReqState.isLoading

  return (
    <Loader states={[queryResults, getReqState, updateReqState]}>
      { isLoading === false &&
        <VenuesMap
          cluster={true}
          data={data}
          enableVenueFilter={true}
          region={currentMapRegion}
        />
      }
    </Loader>
  )
}
