
import {
  useAnalyticsFilter
} from '@acx-ui/analytics/utils'
import { RevolvingDoor, Loader } from '@acx-ui/components'

import { useNetworkHierarchyQuery } from './services'

export const AnalyticsNetworkFilter = () => {
  const { filters } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQuerySwitch: true }
  const networkHierarchyQuery = useNetworkHierarchyQuery(networkFilter)
  return (
    <Loader states={[networkHierarchyQuery]}>
      {networkHierarchyQuery?.data && <RevolvingDoor data={networkHierarchyQuery.data} /> }
    </Loader>
  )
}
