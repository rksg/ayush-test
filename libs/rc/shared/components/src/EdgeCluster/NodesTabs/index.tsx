import { Tabs }                       from '@acx-ui/components'
import { useGetEdgeClusterListQuery } from '@acx-ui/rc/services'

interface NodesTabsProps {
  clusterId: string
}

export const NodesTabs = (props: NodesTabsProps) => {
  const { clusterId } = props
  const clusterOptionsDefaultPayload = {
    searchString: '',
    filters: { clusterId: [clusterId], isCluster: [true] },
    fields: [
      'name',
      'clusterId',
      'edgeList'
    ],
    sortField: 'name',
    sortOrder: 'ASC',
    pageSize: 1
  }

  const { clusterData } = useGetEdgeClusterListQuery(
    { payload: clusterOptionsDefaultPayload },
    {
      selectFromResult: ({ data }) => {
        return {
          clusterData: data?.data[0]
        }
      }
    })

  return <Tabs >
    {clusterData?.edgeList?.map((node) => {
      return <Tabs.TabPane
        key={node.serialNumber}
        tab={node.name}
      />
    })}
  </Tabs>
}