import { useAnalyticsFilter }  from '@acx-ui/analytics/utils'
import { SlidingDoor, Loader } from '@acx-ui/components'

import { useNetworkHierarchyQuery } from './services'

type MlisaNetworkFilterProps = {
  shouldQuerySwitch? : boolean
 }

export const MlisaNetworkFilter = ({ shouldQuerySwitch = true }: MlisaNetworkFilterProps) => {
  const { setNetworkPath, filters, path } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQuerySwitch: shouldQuerySwitch }
  const networkHierarchyQuery = useNetworkHierarchyQuery(networkFilter)
  return (
    <div style={{ width: 250 }}>
      <Loader states={[networkHierarchyQuery]}>
        {networkHierarchyQuery?.data && (
          <SlidingDoor
            data={networkHierarchyQuery.data}
            setNetworkPath={setNetworkPath}
            defaultSelectedNode={path}
          />
        )}
      </Loader>
    </div>
  )
}
