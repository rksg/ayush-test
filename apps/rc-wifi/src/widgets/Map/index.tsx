import { Loader }                    from '@acx-ui/components'
import { useSplitTreatment }         from '@acx-ui/feature-toggle'
import { useDashboardOverviewQuery } from '@acx-ui/rc/services'
import { useParams }                 from '@acx-ui/react-router-dom'

import { GoogleMap }         from '../../VenuesMap'
import { massageVenuesData } from '../../VenuesMap/helper'

export function Map () {
  const isMapEnabled = useSplitTreatment('acx-ui-maps-api-toggle')
  const queryResults = useDashboardOverviewQuery({
    params: useParams()
  },
  {
    selectFromResult: ({ data, ...rest }) => ({
      data: massageVenuesData(data),
      ...rest
    })
  })

  // TODO - This is temporary until implemented in widgets
  if (!isMapEnabled) {
    return <span>Map is not enabled</span>
  }

  return (
    <Loader states={[queryResults]}>
      <GoogleMap cluster={true} data={queryResults.data} />
    </Loader>
  )
}
