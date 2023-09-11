
import { SwitchesTrafficByVolume }                                                                     from '@acx-ui/analytics/components'
import { SwitchStatusByTime }                                                                          from '@acx-ui/analytics/components'
import { GridCol, GridRow }                                                                            from '@acx-ui/components'
import { TopologyFloorPlanWidget }                                                                     from '@acx-ui/rc/components'
import { NetworkDevice, NetworkDevicePosition, ShowTopologyFloorplanOn, StackMember, SwitchViewModel } from '@acx-ui/rc/utils'
import type { AnalyticsFilter }                                                                        from '@acx-ui/utils'

import { ResourceUtilization } from './ResourceUtilization'
import { SwitchFrontRearView } from './SwitchFrontRearView'
import { TopPorts }            from './TopPorts'

export function SwitchOverviewPanel (props:{
  filters: AnalyticsFilter,
  switchDetail: SwitchViewModel,
  currentSwitchDevice: NetworkDevice,
  stackMember: StackMember[]
}) {
  const { filters, switchDetail, currentSwitchDevice, stackMember } = props
  return <><GridRow>
    <GridCol col={{ span: 24 }}>
      <SwitchFrontRearView stackMember={stackMember} />
    </GridCol>
  </GridRow>
  <GridRow>
    <GridCol col={{ span: 24 }} style={{ height: '380px' }}>
      { switchDetail && <TopologyFloorPlanWidget
        showTopologyFloorplanOn={ShowTopologyFloorplanOn.SWITCH_OVERVIEW}
        currentDevice={currentSwitchDevice}
        venueId={switchDetail?.venueId}
        devicePosition={switchDetail?.position as NetworkDevicePosition}/>
      }
    </GridCol>
  </GridRow>
  <GridRow>
    { filters && <SwitchWidgets filters={{ ...filters }}/> }
  </GridRow>
  </>
}

function SwitchWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <>
      <GridCol col={{ span: 24 }} style={{ height: '100px' }}>
        <SwitchStatusByTime filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ResourceUtilization filters={filters} />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'traffic' }} type='donut' />
      </GridCol>
      <GridCol col={{ span: 16 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'traffic' }} type='line' />
      </GridCol>
      <GridCol col={{ span: 8 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'error' }} type='donut' />
      </GridCol>
      <GridCol col={{ span: 16 }} style={{ height: '280px' }}>
        <TopPorts filters={{ ...filters, by: 'error' }} type='line' />
      </GridCol>
    </>
  )
}
