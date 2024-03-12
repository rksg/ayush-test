import { useParams } from 'react-router-dom'

import { IncidentTabContent }   from '@acx-ui/analytics/components'
import { pathToFilter }         from '@acx-ui/analytics/utils'
import { useSwitchContext }     from '@acx-ui/rc/utils'
import { useDateFilter }        from '@acx-ui/utils'
import type { AnalyticsFilter } from '@acx-ui/utils'
import type { NetworkPath }     from '@acx-ui/utils'

export function SwitchIncidentsTab () {
  const { dateFilter } = useDateFilter()
  const { switchId } = useParams()
  const switchContext = useSwitchContext()
  const path = switchContext?.networkPath?
    (switchContext?.networkPath as unknown as NetworkPath) :
    [{ type: 'switch', name: switchId as string }] as NetworkPath

  const filters = {
    ...dateFilter,
    filter: pathToFilter(path.filter((p) => p.type !== 'switchGroup'))
  } as AnalyticsFilter

  return <IncidentTabContent filters={filters} disableGraphs/>
}