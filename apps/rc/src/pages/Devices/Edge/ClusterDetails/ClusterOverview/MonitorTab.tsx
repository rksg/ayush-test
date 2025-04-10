import { GridCol, GridRow }            from '@acx-ui/components'
import { EdgeClusterNodeUpTimeWidget } from '@acx-ui/edge/components'
import {
  EdgeTrafficByVolumeWidget
} from '@acx-ui/rc/components'
import { EdgeClusterStatus } from '@acx-ui/rc/utils'

export const MonitorTab = (props: { clusterData: EdgeClusterStatus | undefined }) => {
  const { clusterData } = props

  return (
    <GridRow>
      <GridCol col={{ span: 24 }}>
        {clusterData?.edgeList?.map((edge, index) => (
          <EdgeClusterNodeUpTimeWidget nodeIndex={index} edgeData={edge} />
        ))}
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <EdgeClusterTrafficByVolumeWidget />
      </GridCol>
    </GridRow>
  )
}