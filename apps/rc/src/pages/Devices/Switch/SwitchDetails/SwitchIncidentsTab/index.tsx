import { IncidentTabContent }         from '@acx-ui/analytics/components'
import { Loader }                     from '@acx-ui/components'
import { useSwitchDetailHeaderQuery } from '@acx-ui/rc/services'
import { useParams  }                 from '@acx-ui/react-router-dom'

import { useSwitchFilter } from '../switchFilter'

export function SwitchIncidentsTab () {
  const params = useParams()
  const switchDetailQuery = useSwitchDetailHeaderQuery({ params })
  const filters = useSwitchFilter(switchDetailQuery.data)
  return <Loader states={[switchDetailQuery]}>
    <IncidentTabContent filters={filters} disableGraphs/>
  </Loader>
}