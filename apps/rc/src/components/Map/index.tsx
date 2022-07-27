import { Loader }                    from '@acx-ui/components'
import { useSplitTreatment }         from '@acx-ui/feature-toggle'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { VenuesMap }         from './VenuesMap'
import { massageVenuesData } from './VenuesMap/helper'

export function Map () {
  const isMapEnabled = useSplitTreatment('acx-ui-maps-api-toggle')
  if (!isMapEnabled) {
    return <span>Map is not enabled</span>
  }
  return (<ActualMap/>)
}

function ActualMap () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },
  {
    selectFromResult: ({ data, ...rest }) => ({
      data: massageVenuesData(data),
      ...rest
    })
  })
  return (
    <Loader states={[queryResults]}>
      <VenuesMap cluster={true} data={queryResults.data} enableVenueFilter={true} />
    </Loader>
  )
}
