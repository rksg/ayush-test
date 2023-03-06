import { Empty }   from 'antd'
import { useIntl } from 'react-intl'
import AutoSizer   from 'react-virtualized-auto-sizer'

import { Card }                                                             from '@acx-ui/components'
import { ContentSwitcher, ContentSwitcherProps }                            from '@acx-ui/components'
import { NetworkDevice, NetworkDevicePosition, SHOW_TOPOLOGY_FLOORPLAN_ON } from '@acx-ui/rc/utils'
import { TenantLink }                                                       from '@acx-ui/react-router-dom'
import { getIntl }                                                          from '@acx-ui/utils'

import { ApFloorplan }     from '../ApFloorplan'
import { FloorPlan }       from '../FloorPlan'
import { SwitchFloorplan } from '../SwitchFloorplan'
import { TopologyGraph }   from '../Topology'


export function TopologyFloorPlanWidget (props: {
  showTopologyFloorplanOn: SHOW_TOPOLOGY_FLOORPLAN_ON,
  currentDevice?: NetworkDevice,
  venueId?: string,
  devicePosition?: NetworkDevicePosition }) {
  const { $t } = useIntl()
  const { showTopologyFloorplanOn, currentDevice, venueId, devicePosition } = props
  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Topology' }),
      value: 'topology',
      children: <TopologyGraph
        showTopologyOn={showTopologyFloorplanOn}
        venueId={venueId}
        deviceMac={currentDevice?.apMac || currentDevice?.switchMac}/>
    },
    {
      label: $t({ defaultMessage: 'Floor Plans' }),
      value: 'floor-plans',
      children: getFloorplanComponent (showTopologyFloorplanOn,
        currentDevice as NetworkDevice,
        venueId as string,
        devicePosition as NetworkDevicePosition)
    }
  ]

  return (
    <Card>
      <AutoSizer>
        {({ height, width }) => (
          <div style={{ width, height }}>
            <ContentSwitcher
              defaultValue='floor-plans'
              tabDetails={tabDetails}
              size='small'
              align='left'
            />
          </div>
        )}
      </AutoSizer>
    </Card>
  )
}

export function getFloorplanComponent (showTopologyFloorplanOn: SHOW_TOPOLOGY_FLOORPLAN_ON,
  currentDevice: NetworkDevice,
  venueId: string,
  devicePosition: NetworkDevicePosition) {

  const { $t } = getIntl()

  switch(showTopologyFloorplanOn) {
    case SHOW_TOPOLOGY_FLOORPLAN_ON.VENUE_OVERVIEW:
      return <FloorPlan />
    case SHOW_TOPOLOGY_FLOORPLAN_ON.SWITCH_OVERVIEW:
      return (devicePosition && devicePosition.floorplanId) ? <SwitchFloorplan
        activeDevice={currentDevice}
        venueId={venueId}
        switchPosition={devicePosition as NetworkDevicePosition}
      />
        : <div style={{
          width: '100%',
          height: 'calc(100% - 80px)',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'inline-flex'
        }}><Empty description={$t({
            defaultMessage: 'This Switch is not placed on any floor plan' })}>
            <TenantLink to={`/venues/${venueId}/venue-details/overview`}>
              {$t({ defaultMessage: 'Go to floor plans to place the Switch' })}
            </TenantLink>
          </Empty>
        </div>
    case SHOW_TOPOLOGY_FLOORPLAN_ON.AP_OVERVIEW:
      return (devicePosition && devicePosition.floorplanId) ? <ApFloorplan
        activeDevice={currentDevice}
        venueId={venueId}
        apPosition={devicePosition as NetworkDevicePosition}
      />
        : <div style={{
          width: '100%',
          height: 'calc(100% - 80px)',
          justifyContent: 'center',
          alignItems: 'center',
          display: 'inline-flex'
        }}>
          <Empty description={$t({ defaultMessage: 'This AP is not placed on any floor plan' })}>
            <TenantLink to={`/venues/${venueId}/venue-details/overview`}>
              {$t({ defaultMessage: 'Go to floor plans to place the Access Point' })}
            </TenantLink>
          </Empty>
        </div>
  }

  return
}
