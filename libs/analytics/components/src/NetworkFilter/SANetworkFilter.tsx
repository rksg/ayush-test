import { omit } from 'lodash'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader }             from '@acx-ui/components'
import { AnalyticsFilter }    from '@acx-ui/utils'

import { SlidingDoor } from '..'

import { useNetworkHierarchyQuery } from './services'

type SANetworkFilterProps = {
  shouldQueryAp?: boolean
  shouldQuerySwitch? : boolean
  overrideFilters? : AnalyticsFilter | {}
}

export const SANetworkFilter = ({
  shouldQueryAp = true,
  shouldQuerySwitch = true,
  overrideFilters = {}
}: SANetworkFilterProps) => {
  const { setNetworkPath, filters, pathFilters: { path } } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQueryAp, shouldQuerySwitch, ...overrideFilters }
  const networkHierarchyQuery = useNetworkHierarchyQuery(
    omit(networkFilter, 'path', 'filter')
  )
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
