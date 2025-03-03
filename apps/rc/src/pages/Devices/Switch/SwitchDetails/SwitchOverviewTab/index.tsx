import { useContext, useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  GridCol,
  GridRow,
  Loader,
  Tabs
} from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { SwitchInfoWidget }       from '@acx-ui/rc/components'
import {
  useGetVenueQuery,
  useStackMemberListQuery
} from '@acx-ui/rc/services'
import {
  NetworkDevice,
  NetworkDeviceType,
  SwitchViewModel,
  isRouter,
  SWITCH_TYPE,
  StackMember,
  isFirmwareVersionAbove10020b,
  isFirmwareVersionAbove10010g2Or10020b
} from '@acx-ui/rc/utils'
import {
  useNavigate,
  useParams,
  useTenantLink
} from '@acx-ui/react-router-dom'
import { MacACLs }                           from '@acx-ui/switch/components'
import { TABLE_QUERY_LONG_POLLING_INTERVAL } from '@acx-ui/utils'

import { SwitchDetailsContext } from '..'
import { useSwitchFilter }      from '../switchFilter'

import { SwitchOverviewACLs }            from './SwitchOverviewACLs'
import { SwitchOverviewPanel }           from './SwitchOverviewPanel'
import SwitchOverviewPortProfiles        from './SwitchOverviewPortProfiles'
import { SwitchOverviewPorts }           from './SwitchOverviewPorts'
import { SwitchOverviewRouteInterfaces } from './SwitchOverviewRouteInterfaces'
import { SwitchOverviewVLANs }           from './SwitchOverviewVLANs'

export function SwitchOverviewTab () {
  const { $t } = useIntl()
  const params = useParams()
  const [ switchDetail, setSwitchDetail ] = useState(null as unknown as SwitchViewModel)
  const switchFilter = useSwitchFilter(switchDetail)
  const [supportRoutedInterfaces, setSupportRoutedInterfaces] = useState(false)
  const [currentSwitchDevice, setCurrentSwitchDevice] = useState<NetworkDevice>({} as NetworkDevice)
  const [syncedStackMember, setSyncedStackMember] = useState([] as StackMember[])
  const switchPortProfileEnabled = useIsSplitOn(Features.SWITCH_CONSUMER_PORT_PROFILE_TOGGLE)
  const switchMacAclEnabled = useIsSplitOn(Features.SWITCH_SUPPORT_MAC_ACL_TOGGLE)

  const { switchDetailsContextData } = useContext(SwitchDetailsContext)
  const { switchDetailHeader, switchData } = switchDetailsContextData

  const { data: venue } = useGetVenueQuery({
    params: { tenantId: params.tenantId, venueId: switchDetailHeader?.venueId } },
  { skip: !switchDetailHeader?.venueId })
  const { data: stackMember } = useStackMemberListQuery({ params,
    payload: {
      fields: ['activeUnitId', 'unitId', 'unitStatus', 'name', 'deviceStatus', 'model',
        'serialNumber', 'activeSerial', 'switchMac', 'ip', 'venueName', 'uptime'],
      filters: { activeUnitId: [params.serialNumber] } } },
  { skip: !switchDetailHeader, pollingInterval: TABLE_QUERY_LONG_POLLING_INTERVAL })

  const navigate = useNavigate()
  const basePath = useTenantLink(
    `/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/`
  )

  useEffect(() => {
    if(switchDetailHeader && venue && stackMember && switchData) {
      const stackMemberIds = switchData?.stackMembers?.map(s => s.id)
      const syncedStackMember
        = stackMember?.data?.filter(stack => stackMemberIds?.includes(stack.id))

      setSwitchDetail({
        ...switchDetailHeader,
        description: switchData.description,
        enableStack: switchData.enableStack,
        venueDescription: venue.description,
        unitDetails: syncedStackMember
      })
      setSyncedStackMember(syncedStackMember)
      setSupportRoutedInterfaces(isRouter(switchDetailHeader?.switchType || SWITCH_TYPE.SWITCH))
    }
  }, [switchDetailHeader, switchData, venue, stackMember])

  useEffect(() => {
    if(switchDetail) {
      const _currentSwitchDevice: NetworkDevice = {
        ...switchDetail,
        networkDeviceType: NetworkDeviceType.switch
      } as NetworkDevice
      switchDetail.position = {
        floorplanId: switchDetail?.floorplanId,
        xPercent: switchDetail?.xPercent,
        yPercent: switchDetail?.yPercent
      }
      _currentSwitchDevice.position=switchDetail?.position
      setCurrentSwitchDevice(_currentSwitchDevice)
    }
  }, [switchDetail])

  const onTabChange = (tab: string) => {
    navigate({
      ...basePath,
      pathname: `${basePath.pathname}/${tab}`
    })
  }


  return <>
    <GridRow>
      <GridCol col={{ span: 24 }} style={{ height: '148px' }}>
        <Loader states={[{ isLoading: !switchDetail }]}>
          { switchDetail &&
          <SwitchInfoWidget
            switchDetail={switchDetail as SwitchViewModel}
            filters={switchFilter} /> }
        </Loader>
      </GridCol>
    </GridRow>

    <Tabs onChange={onTabChange}
      activeKey={params.activeSubTab}
      type='card'
      style={{ marginTop: '25px' }}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Panel' })} key='panel'>
        <SwitchOverviewPanel
          filters={switchFilter}
          stackMember={syncedStackMember as StackMember[]}
          switchDetail={switchDetail}
          currentSwitchDevice={currentSwitchDevice} />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Ports' })} key='ports'>
        <SwitchOverviewPorts
          switchDetail={switchDetail}
        />
      </Tabs.TabPane>
      {supportRoutedInterfaces &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Routed Interfaces' })} key='routeInterfaces'>
          <SwitchOverviewRouteInterfaces switchDetail={switchDetail} />
        </Tabs.TabPane>
      }
      {switchDetail &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'VLANs' })} key='vlans'>
          <SwitchOverviewVLANs switchDetail={switchDetail} />
        </Tabs.TabPane>
      }
      {switchDetail &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'ACLs' })} key='acls'>
          <SwitchOverviewACLs switchDetail={switchDetail} />
        </Tabs.TabPane>
      }
      {switchDetail && switchMacAclEnabled &&
      isFirmwareVersionAbove10010g2Or10020b(switchDetail.firmware) &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'MAC ACLs' })} key='macacls'>
          <MacACLs switchDetail={switchDetail} />
        </Tabs.TabPane>
      }
      {switchDetail && switchPortProfileEnabled &&
        isFirmwareVersionAbove10020b(switchDetail?.firmware) &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Port Profiles' })} key='portProfiles'>
          <SwitchOverviewPortProfiles switchDetail={switchDetail} />
        </Tabs.TabPane>
      }
    </Tabs>
  </>
}
