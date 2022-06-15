import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { GoogleMap }         from '../../GoogleMap'
import { massageVenuesData } from '../../GoogleMap/helper'

export function Map () {
  const { data } = useDashboardOverviewQuery({
    params: useParams()
  })
  
  const massagedVenues = massageVenuesData(data)
  return (<GoogleMap cluster={true} data={massagedVenues} />)
}
