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
import { GridCol, GridRow, Tooltip, cssStr }      from '@acx-ui/components'
import { Features, useIsSplitOn }                 from '@acx-ui/feature-toggle'
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
import { AlertNote }    from './styledComponents'

const apViewModelRbacPayloadFields = [
  'name', 'venueId', 'venueName', 'apGroupName', 'description', 'lastSeenTime',
  'serialNumber', 'macAddress', 'networkStatus', 'model', 'firmwareVersion',
  'meshRole', 'hops', 'apUpRssi', 'status', 'statusSeverity',
  'meshEnabled', 'lastUpdatedTime', 'deviceModelType', 'meshStatus',
  'uplink', 'uptime', 'tags', 'radioStatuses', 'lanPortStatuses', 'afcStatus', 'cellularStatus',
  'switchId', 'switchPort', 'poePort', 'poeUnderPowered']

interface PoeUnderpoweredAlertProps {
  message: string;
}

const PoeUnderpoweredAlert: React.FC<PoeUnderpoweredAlertProps> = ({ message }) => (
  <AlertNote
    data-testid='ap-compatibility-alert-note'
    message={
      <>
        <Tooltip.Info
          isFilled
          iconStyle={{
            height: '16px',
            width: '16px',
            marginRight: '6px',
            marginBottom: '-3px',
            color: cssStr('--acx-accents-orange-30')
          }} />
        <span style={{ lineHeight: '28px' }}>
          {message}
        </span>
      </>}
    type='info' />
)

export function ApOverviewTab () {
  const { $t } = useIntl()
  const [currentApDevice, setCurrentApDevice] = useState<NetworkDevice>({} as NetworkDevice)
  const isFlagUnderPoweredEnabled =
    useIsSplitOn(Features.FLAG_UNDERPOWERED_APS_AND_WARN_LIMITED_FUNCTIONALITY)
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
      { isFlagUnderPoweredEnabled && currentAP?.poeUnderPowered &&
        <GridCol col={{ span: 18 }} style={{ height: '30px' }}>
          <PoeUnderpoweredAlert
            message={$t({
              defaultMessage:
              // eslint-disable-next-line max-len
              'Insufficient PoE detected. Some capabilities will remain non-operational and Wi-Fi networks may not be broadcast.'
            })}/>
        </GridCol>
      }
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
