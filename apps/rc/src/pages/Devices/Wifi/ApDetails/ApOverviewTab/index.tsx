import { useEffect, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  ConnectedClientsOverTime,
  NetworkHistory,
  TopApplicationsByTraffic,
  TopSSIDsByClient,
  TopSSIDsByTraffic,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import { AnalyticsFilter }                                                      from '@acx-ui/analytics/utils'
import { GridCol, GridRow, NoData }                                             from '@acx-ui/components'
import { ApInfoWidget }                                                         from '@acx-ui/rc/components'
import { useApDetailsQuery, useApViewModelQuery }                               from '@acx-ui/rc/services'
import { ApDetails, ApPosition, ApViewModel, NetworkDevice, NetworkDeviceType } from '@acx-ui/rc/utils'
import { useDateFilter }                                                        from '@acx-ui/utils'

import { useApContext } from '../ApContext'

import ApFloorplan      from './ApFloorplan'
import { ApPhoto }      from './ApPhoto'
import { ApProperties } from './ApProperties'


export function ApOverviewTab () {
  const { dateFilter } = useDateFilter()
  const [ apFilter, setApFilter ] = useState(null as unknown as AnalyticsFilter)
  const [currentApDevice, setCurrentApDevice] = useState<NetworkDevice>({} as NetworkDevice)
  const { $t } = useIntl()
  const params = useApContext()
  const apViewModelPayload = {
    fields: ['name', 'venueName', 'deviceGroupName', 'description', 'lastSeenTime',
      'serialNumber', 'apMac', 'IP', 'extIp', 'model', 'fwVersion',
      'meshRole', 'hops', 'apUpRssi', 'deviceStatus', 'deviceStatusSeverity',
      'isMeshEnable', 'lastUpdTime', 'deviceModelType', 'apStatusData.APSystem.uptime',
      'venueId', 'uplink', 'apStatusData', 'apStatusData.cellularInfo', 'tags'],
    filters: { serialNumber: [params.serialNumber] }
  }
  const { data: currentAP, isLoading: isLoadingApViewModel, isFetching: isFetchingApViewModel }
  = useApViewModelQuery({
    params, payload: apViewModelPayload
  })
  const { data: apDetails, isLoading: isLoadingApDetails, isFetching: isFetchingApDetails }
  = useApDetailsQuery({ params })
  useEffect(() => {
    if(currentAP) {
      const _currentApDevice: NetworkDevice = { ...currentAP,
        networkDeviceType: NetworkDeviceType.ap } as NetworkDevice
      _currentApDevice.position=apDetails?.position
      setCurrentApDevice(_currentApDevice)
      setApFilter({
        ...dateFilter,
        path: [{ type: 'AP', name: currentAP.apMac as string }]
      })
    }
  }, [currentAP, dateFilter])


  return (  // TODO: Remove background: '#F7F7F7' and Add Floor plan
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '152px' }}>
        { apFilter && <ApInfoWidget currentAP={currentAP as ApViewModel} filters={apFilter} /> }
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '152px' }}>
        <ApPhoto />
      </GridCol>
      <GridCol col={{ span: 18 }} style={{ background: '#F7F7F7' }}>
        {apDetails?.position?.floorplanId ? <ApFloorplan
          activeDevice={currentApDevice}
          venueId={apDetails?.venueId}
          apPosition={apDetails?.position as ApPosition}/>
          : <NoData text={$t({ defaultMessage: 'This AP is not placed on any floor plan' })}/>}
      </GridCol>
      <GridCol col={{ span: 6 }}>
        <ApProperties
          currentAP={currentAP as ApViewModel}
          apDetails={apDetails as ApDetails}
          isLoading={
            isLoadingApViewModel || isLoadingApDetails ||
            isFetchingApViewModel || isFetchingApDetails
          }
        />
      </GridCol>
      { apFilter && <ApWidgets filters={apFilter}/> }
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <NetworkHistory filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopApplicationsByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByClient filters={filters} />
      </GridCol>
    </>
  )
}