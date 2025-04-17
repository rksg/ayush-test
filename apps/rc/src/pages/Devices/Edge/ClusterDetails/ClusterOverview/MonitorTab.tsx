import { useContext } from 'react'

import { GridCol, GridRow }                                                       from '@acx-ui/components'
import { EdgeClusterNodesUpTimeWidget, EdgeClusterWanPortsTrafficByVolumeWidget } from '@acx-ui/edge/components'

import { EdgeClusterDetailsDataContext } from '../EdgeClusterDetailsDataProvider'

export const MonitorTab = (props: {
   wanPortIfNames: { edgeId: string, ifName: string }[]
  }) => {
  const { wanPortIfNames } = props
  const { clusterInfo } = useContext(EdgeClusterDetailsDataContext)

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        <EdgeClusterNodesUpTimeWidget edges={clusterInfo?.edgeList} />
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <EdgeClusterWanPortsTrafficByVolumeWidget
          edges={clusterInfo?.edgeList}
          wanPortIfNames={wanPortIfNames}
        />
      </GridCol>
    </GridRow>
  )
}