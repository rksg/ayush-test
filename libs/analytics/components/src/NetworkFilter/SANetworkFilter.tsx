import { omit } from 'lodash'

import { useAnalyticsFilter }           from '@acx-ui/analytics/utils'
import { Loader }                       from '@acx-ui/components'
import { AnalyticsFilter, NetworkNode } from '@acx-ui/utils'

import { SlidingDoor } from '..'

import { useNetworkHierarchyQuery } from './services'

type SANetworkFilterProps = {
  shouldQueryAp?: boolean
  shouldQuerySwitch? : boolean
  shouldShowOnlyDomains? : boolean
  overrideFilters? : AnalyticsFilter | {}
}

export function filterSystemAndDomain (data: NetworkNode): NetworkNode {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  if (data.type === 'system') {
    return {
      name: data.name,
      type: data.type,
      children: data.children?.filter(child => child.type === 'domain').map(child => ({
        name: child.name,
        type: child.type,
        children: []
      }))
    }
  }
  return {
    name: data.name,
    type: data.type,
    children: data.children?.filter(child => child.type === 'system').map(filterSystemAndDomain)
  }
}

export const SANetworkFilter = ({
  shouldQueryAp = true,
  shouldQuerySwitch = true,
  shouldShowOnlyDomains = false,
  overrideFilters = {}
}: SANetworkFilterProps) => {
  const { setNetworkPath, filters, pathFilters: { path } } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQueryAp, shouldQuerySwitch, ...overrideFilters }
  const networkHierarchyQuery = useNetworkHierarchyQuery(
    omit(networkFilter, 'path', 'filter'),
    {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: shouldShowOnlyDomains ? filterSystemAndDomain(data as NetworkNode) : data
      })
    }
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
