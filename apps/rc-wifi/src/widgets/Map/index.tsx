import { Loader }                    from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'
import { useSplitTreatment }         from '@acx-ui/utils'

import { GoogleMap }         from '../../VenuesMap'
import { massageVenuesData } from '../../VenuesMap/helper'

export function Map () {
  const isMapEnabled = useSplitTreatment('acx-ui-maps-api-toggle')
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  })

  // TODO - This is temporary until implemented in widgets
  if (!isMapEnabled) {
    return <span>Map is not enabled</span>
  }

  const massagedVenues = massageVenuesData(queryResults.data)
  return (
    <Loader states={[queryResults]}>
      <GoogleMap cluster={true} data={massagedVenues} />
    </Loader>
  )
}
