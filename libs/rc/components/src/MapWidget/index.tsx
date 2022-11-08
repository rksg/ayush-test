import { useMemo } from 'react'

import { useIntl } from 'react-intl'

import { Loader }                    from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import VenuesMap             from './VenuesMap'
import { massageVenuesData } from './VenuesMap/helper'

export function MapWidget () {
  const { $t } = useIntl()
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  if (!isMapEnabled) {
    return <span>{ $t({ defaultMessage: 'Map is not enabled' }) }</span>
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
