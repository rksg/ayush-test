import { useEffect, useState } from 'react'

import {
  ConnectedClientsOverTime,
  NetworkHistory,
  TopApplicationsByTraffic,
  TopSSIDsByClient,
  TopSSIDsByTraffic,
  TrafficByVolume
} from '@acx-ui/analytics/components'
import { GridCol, GridRow }                       from '@acx-ui/components'
import { ApInfoWidget, TopologyFloorPlanWidget }  from '@acx-ui/rc/components'
import { useApDetailsQuery, useApViewModelQuery } from '@acx-ui/rc/services'
import {
  ApDetails,
  ApViewModel,
  NetworkDevice,
  NetworkDevicePosition,
  NetworkDeviceType,
  ShowTopologyFloorplanOn,
  useApContext
} from '@acx-ui/rc/utils'
import { getUserProfile, isCoreTier } from '@acx-ui/user'
import type { AnalyticsFilter }       from '@acx-ui/utils'

import { useApFilter } from '../apFilter'

import { ApPhoto }      from './ApPhoto'
import { ApProperties } from './ApProperties'

const apViewModelRbacPayloadFields = [
  'name', 'venueId', 'venueName', 'apGroupName', 'description', 'lastSeenTime',
  'serialNumber', 'macAddress', 'networkStatus', 'model', 'firmwareVersion',
  'meshRole', 'hops', 'apUpRssi', 'status', 'statusSeverity',
  'meshEnabled', 'lastUpdatedTime', 'deviceModelType', 'meshStatus',
  'uplink', 'uptime', 'tags', 'radioStatuses', 'lanPortStatuses', 'afcStatus', 'cellularStatus',
  'switchId', 'switchPort', 'poePort']

export function ApOverviewTab () {
  const [currentApDevice, setCurrentApDevice] = useState<NetworkDevice>({} as NetworkDevice)
  const params = useApContext()
  const apFilter = useApFilter(params)
  const apViewModelPayload = {
    fields: apViewModelRbacPayloadFields,
    filters: { serialNumber: [params.serialNumber] }
  }

  const { data: currentAP, isLoading: isLoadingApViewModel, isFetching: isFetchingApViewModel }
  = useApViewModelQuery({
    params, payload: apViewModelPayload,
    enableRbac: true
  })
  const { data: apDetails, isLoading: isLoadingApDetails, isFetching: isFetchingApDetails }
  = useApDetailsQuery({ params, enableRbac: true })
  useEffect(() => {
    if(currentAP) {
      const _currentApDevice: NetworkDevice = { ...currentAP,
        networkDeviceType: NetworkDeviceType.ap } as NetworkDevice
      _currentApDevice.position=apDetails?.position
      setCurrentApDevice(_currentApDevice)
    }
  }, [currentAP])

  return (
    <GridRow>
      <GridCol col={{ span: 18 }} style={{ height: '152px' }}>
        { currentAP && <ApInfoWidget currentAP={currentAP as ApViewModel} filters={apFilter} /> }
      </GridCol>
      <GridCol col={{ span: 6 }} style={{ height: '152px' }}>
        <ApPhoto />
      </GridCol>
      <GridCol col={{ span: 18 }} style={{ height: '420px' }}>
        { apDetails && <TopologyFloorPlanWidget
          showTopologyFloorplanOn={ShowTopologyFloorplanOn.AP_OVERVIEW}
          currentDevice={currentApDevice}
          venueId={apDetails?.venueId}
          devicePosition={apDetails?.position as NetworkDevicePosition}/>
        }
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
      { currentAP && <ApWidgets filters={apFilter}/> }
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const filters = props.filters

  return (
    <>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TrafficByVolume filters={filters} />
      </GridCol>
      {!isCore &&
        <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
          <NetworkHistory filters={filters} />
        </GridCol>
      }
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <ConnectedClientsOverTime filters={filters} />
      </GridCol>
      {!isCore &&
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopApplicationsByTraffic filters={filters} tabId={'ap-overview-ap-top-traffic'} />
      </GridCol>
      }
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByClient filters={filters} />
      </GridCol>
    </>
  )
}
