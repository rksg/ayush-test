import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, Tabs }                                                        from '@acx-ui/components'
import { SwitchInfoWidget }                                                                      from '@acx-ui/rc/components'
import { useGetVenueQuery, useStackMemberListQuery, useSwitchDetailHeaderQuery }                 from '@acx-ui/rc/services'
import { NetworkDevice, NetworkDeviceType, SwitchViewModel, isRouter, SWITCH_TYPE, StackMember } from '@acx-ui/rc/utils'
import { useNavigate, useParams, useTenantLink }                                                 from '@acx-ui/react-router-dom'

import { useSwitchFilter } from '../switchFilter'

import { SwitchOverviewACLs }            from './SwitchOverviewACLs'
import { SwitchOverviewPanel }           from './SwitchOverviewPanel'
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
  const switchDetailQuery = useSwitchDetailHeaderQuery({ params })
  const { data: venue } = useGetVenueQuery({
    params: { tenantId: params.tenantId, venueId: switchDetailQuery.data?.venueId } },
  { skip: !switchDetailQuery.isSuccess })
  const { data: stackMember } = useStackMemberListQuery({ params,
    payload: {
      fields: ['activeUnitId', 'unitId', 'unitStatus', 'name', 'deviceStatus', 'model',
        'serialNumber', 'activeSerial', 'switchMac', 'ip', 'venueName', 'uptime'],
      filters: { activeUnitId: [params.serialNumber] } } },
  { skip: !switchDetailQuery.isSuccess })
  const navigate = useNavigate()
  const basePath = useTenantLink(
    `/devices/switch/${params.switchId}/${params.serialNumber}/details/overview/`
  )

  useEffect(() => {
    if(switchDetailQuery.data && venue && stackMember) {
      setSwitchDetail({
        ...switchDetailQuery.data,
        venueDescription: venue.description,
        unitDetails: stackMember?.data
      })
      setSupportRoutedInterfaces(isRouter(switchDetailQuery.data?.switchType || SWITCH_TYPE.SWITCH))
    }
  }, [switchDetailQuery.data, venue, stackMember])

  useEffect(() => {
    if(switchDetail) {
      const _currentSwitchDevice: NetworkDevice = { ...switchDetail,
        networkDeviceType: NetworkDeviceType.switch } as NetworkDevice
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
      stickyTop={false}
      style={{ marginTop: '25px' }}
    >
      <Tabs.TabPane tab={$t({ defaultMessage: 'Panel' })} key='panel'>
        <SwitchOverviewPanel
          filters={switchFilter}
          stackMember={stackMember?.data as StackMember[]}
          switchDetail={switchDetail}
          currentSwitchDevice={currentSwitchDevice} />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'Ports' })} key='ports'>
        <SwitchOverviewPorts />
      </Tabs.TabPane>
      {supportRoutedInterfaces &&
        <Tabs.TabPane tab={$t({ defaultMessage: 'Routed Interfaces' })} key='routeInterfaces'>
          <SwitchOverviewRouteInterfaces />
        </Tabs.TabPane>
      }
      <Tabs.TabPane tab={$t({ defaultMessage: 'VLANs' })} key='vlans'>
        <SwitchOverviewVLANs />
      </Tabs.TabPane>
      <Tabs.TabPane tab={$t({ defaultMessage: 'ACLs' })} key='acls'>
        <SwitchOverviewACLs />
      </Tabs.TabPane>
    </Tabs>
  </>
}
