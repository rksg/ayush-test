import React, { useMemo } from 'react'

import { Loader, GoogleMap }         from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import VenuesMap             from './VenuesMap'
import { massageVenuesData } from './VenuesMap/helper'

export function Map () {
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  if (!isMapEnabled) {
    return <GoogleMap.NotEnabled />
  }
  return (<ActualMap/>)
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

export default Map
