import { useAnalyticsFilter }    from '@acx-ui/analytics/utils'
import { RevolvingDoor, Loader } from '@acx-ui/components'

import { useNetworkHierarchyQuery } from './services'

export const MlisaNetworkFilter = () => {
  const { setNetworkPath, filters, path } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQuerySwitch: true }
  const networkHierarchyQuery = useNetworkHierarchyQuery(networkFilter)
  return (
    <div style={{ width: 250 }}>
      <Loader states={[networkHierarchyQuery]}>
        {networkHierarchyQuery?.data && (
          <RevolvingDoor
            data={networkHierarchyQuery.data}
            setNetworkPath={setNetworkPath}
            defaultSelectedNode={path}
          />
        )}
      </Loader>
    </div>
  )
}
