import { GridCol, GridRow }             from '@acx-ui/components'
import { EdgeClusterNodesUpTimeWidget } from '@acx-ui/edge/components'
import {
  EdgeTrafficByVolumeWidget
} from '@acx-ui/rc/components'

export const MonitorTab = (props: { clusterId: string | undefined }) => {
  return (
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '100px' }}>
        <EdgeClusterNodesUpTimeWidget clusterId={props.clusterId} />
      </GridCol>
      <GridCol col={{ span: 24 }} style={{ height: '280px' }}>
        <EdgeTrafficByVolumeWidget />
      </GridCol>
    </GridRow>
  )
}