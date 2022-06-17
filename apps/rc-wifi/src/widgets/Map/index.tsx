import { Loader }                    from '@acx-ui/components'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { GoogleMap }         from '../../GoogleMap'
import { massageVenuesData } from '../../GoogleMap/helper'

export function Map () {
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  })
  
  const massagedVenues = massageVenuesData(queryResults.data)
  return (
    <Loader states={[queryResults]}>
      <GoogleMap cluster={true} data={massagedVenues} />
    </Loader>
  )
}
