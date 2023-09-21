import { omit } from 'lodash'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader }             from '@acx-ui/components'

import { SlidingDoor } from '..'

import { useNetworkHierarchyQuery } from './services'

type SANetworkFilterProps = {
  shouldQuerySwitch? : boolean
 }

export const SANetworkFilter = ({ shouldQuerySwitch = true }: SANetworkFilterProps) => {
  const { setNetworkPath, filters, path } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQuerySwitch: shouldQuerySwitch }
  const networkHierarchyQuery = useNetworkHierarchyQuery(omit(networkFilter, 'path', 'filter'))
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
