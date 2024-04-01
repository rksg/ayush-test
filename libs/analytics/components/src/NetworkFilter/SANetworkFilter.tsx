import { omit } from 'lodash'

import { useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader }             from '@acx-ui/components'
import { AnalyticsFilter }    from '@acx-ui/utils'

import { SlidingDoor } from '..'

import { NetworkNode, useNetworkHierarchyQuery } from './services'

type SANetworkFilterProps = {
  shouldQueryAp?: boolean
  shouldQuerySwitch? : boolean
  overrideFilters? : AnalyticsFilter | {}
}

function stripChildren (node: NetworkNode): NetworkNode {
  if (!node) return node
  if (node.type === 'zone' || node.type === 'domain')
    return { ...node, children: [] }
  return { ...node, children: node.children?.map(stripChildren) ?? [] }
}

export const SANetworkFilter = ({
  shouldQueryAp = true,
  shouldQuerySwitch = true,
  overrideFilters = {}
}: SANetworkFilterProps) => {
  const { setNetworkPath, filters, pathFilters: { path } } = useAnalyticsFilter()
  const networkFilter = { ...filters, shouldQueryAp, shouldQuerySwitch, ...overrideFilters }
  const networkHierarchyQuery = useNetworkHierarchyQuery(
    omit(networkFilter, 'path', 'filter'),
    {
      selectFromResult: ({ data, ...rest }) => ({
        ...rest,
        data: stripChildren(data as NetworkNode)
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
