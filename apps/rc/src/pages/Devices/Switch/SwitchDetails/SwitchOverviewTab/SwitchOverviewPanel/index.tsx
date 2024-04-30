
import { useState } from 'react'

import { useIntl } from 'react-intl'

import { SwitchesTrafficByVolume }  from '@acx-ui/analytics/components'
import { SwitchStatusByTime }       from '@acx-ui/analytics/components'
import { Button, GridCol, GridRow } from '@acx-ui/components'
import { Features, useIsSplitOn }   from '@acx-ui/feature-toggle'
import {
  SwitchBlinkLEDsDrawer,
  SwitchInfo,
  TopologyFloorPlanWidget
}
  from '@acx-ui/rc/components'
import {
  NetworkDevice,
  NetworkDevicePosition,
  ShowTopologyFloorplanOn,
  StackMember,
  SwitchStatusEnum,
  SwitchViewModel
}
  from '@acx-ui/rc/utils'
import { hasPermission }                     from '@acx-ui/user'
import { TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'
import type { AnalyticsFilter }              from '@acx-ui/utils'

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
  const { $t } = useIntl()
  const [blinkDrawerVisible, setBlinkDrawerVisible] = useState(false)
  const [blinkData, setBlinkData] = useState([] as SwitchInfo[])
  const enableSwitchBlinkLed = useIsSplitOn(Features.SWITCH_BLINK_LED)

  return <>
    {enableSwitchBlinkLed && hasPermission() &&
      <div style={{ textAlign: 'right' }}>
        <Button
          style={{ marginLeft: '20px' }}
          type='link'
          size='small'
          disabled={switchDetail?.deviceStatus!== SwitchStatusEnum.OPERATIONAL}
          onClick={() => {

            const transformedSwitchRows: SwitchInfo[] = [{
              switchId: switchDetail.id,
              venueId: switchDetail.venueId,
              stackMembers: stackMember
            }]
            setBlinkData(transformedSwitchRows)
            setBlinkDrawerVisible(true)

          }}>
          {$t({ defaultMessage: 'Blink LEDs' })}
        </Button>
      </div>
    }

    <GridRow>
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

    {enableSwitchBlinkLed &&
      <SwitchBlinkLEDsDrawer
        visible={blinkDrawerVisible}
        setVisible={setBlinkDrawerVisible}
        switches={blinkData}
        isStack={stackMember.length > 0}
      />}
  </>
}

function SwitchWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <>
      <GridCol col={{ span: 24 }} style={{ height: '100px' }}>
        <SwitchStatusByTime filters={filters}
          refreshInterval={TABLE_QUERY_LONG_POLLING_INTERVAL} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters}
          refreshInterval={TABLE_QUERY_LONG_POLLING_INTERVAL} />
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
