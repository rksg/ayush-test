import { useContext, useEffect, useState } from 'react'

import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  ConnectedClientsOverTime,
  IncidentBySeverity,
  NetworkHistory,
  SwitchesTrafficByVolumeLegacy,
  TopSwitchModels,
  TopApplicationsByTraffic,
  TopSSIDsByClient,
  TopSSIDsByTraffic,
  TopSwitchesByError,
  TopSwitchesByPoEUsage,
  TopSwitchesByTraffic,
  TrafficByVolume,
  VenueHealth,
  SwitchesTrafficByVolume
} from '@acx-ui/analytics/components'
import {
  GridRow,
  GridCol,
  ContentSwitcherProps,
  ContentSwitcher,
  getDefaultEarliestStart
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                from '@acx-ui/feature-toggle'
import { LowPowerBannerAndModal, TopologyFloorPlanWidget, VenueAlarmWidget, VenueDevicesWidget } from '@acx-ui/rc/components'
import {
  useGetVenueRadioCustomizationQuery,
  useGetVenueTripleBandRadioSettingsQuery }                            from '@acx-ui/rc/services'
import { ShowTopologyFloorplanOn }                             from '@acx-ui/rc/utils'
import { useNavigateToPath }                                   from '@acx-ui/react-router-dom'
import { generateVenueFilter, useDateFilter, LoadTimeContext } from '@acx-ui/utils'
import type { AnalyticsFilter }                                from '@acx-ui/utils'

import * as UI from './styledComponents'

export function VenueOverviewTab () {
  const { $t } = useIntl()
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  const { venueId } = useParams()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const { onPageFilterChange } = useContext(LoadTimeContext)

  const venueFilter = {
    ...dateFilter,
    filter: generateVenueFilter([venueId as string])
  }

  const { data: venueRadio } = useGetVenueRadioCustomizationQuery({
    params: { venueId },
    enableRbac: isUseRbacApi
  })

  const { data: tripleBand } = useGetVenueTripleBandRadioSettingsQuery({ params: { venueId } })

  const tabDetails: ContentSwitcherProps['tabDetails'] = [
    {
      label: $t({ defaultMessage: 'Wi-Fi' }),
      value: 'ap',
      children: <ApWidgets filters={venueFilter}/>
    },
    {
      label: $t({ defaultMessage: 'Switch' }),
      value: 'switch',
      children: <SwitchWidgets filters={venueFilter}/>
    }
  ]

  useEffect(() => {
    onPageFilterChange?.(venueFilter, true)
  }, [])

  useEffect(() => {
    onPageFilterChange?.(venueFilter)
  }, [venueFilter])

  return (<>
    {
      (
        (tripleBand?.enabled === true) &&
        (venueRadio?.radioParams6G?.enableAfc === true) &&
        (
          (venueRadio?.radioParams6G?.venueHeight?.minFloor === undefined) ||
          (venueRadio?.radioParams6G?.venueHeight?.maxFloor === undefined)
        )
      ) &&
      <LowPowerBannerAndModal from={'venue'} />
    }
    <CommonDashboardWidgets filters={venueFilter}/>
    <ContentSwitcher
      tabDetails={tabDetails}
      size='large'
      defaultValue={localStorage.getItem('venue-tab') || tabDetails[0].value}
      onChange={(value: string): void => {
        localStorage.setItem('venue-tab', value)
      }}
    />
  </>)
}

function CommonDashboardWidgets (props: { filters: AnalyticsFilter }) {
  const { venueId } = useParams()
  const [incidentCount, setIncidentCount] = useState(0)
  const onIncidentClick =
    useNavigateToPath(`/venues/${venueId}/venue-details/analytics/incidents/overview`)

  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <VenueAlarmWidget />
      </GridCol>
      <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
        <UI.Container
          incidentCount={incidentCount}
          onClick={incidentCount > 0 ? onIncidentClick : undefined}
        >
          <IncidentBySeverity type='donut' filters={filters} setIncidentCount={setIncidentCount}/>
        </UI.Container>
      </GridCol>
      <GridCol col={{ span: 10 }} style={{ height: '176px' }}>
        <VenueDevicesWidget />
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '88px' }}>
        <VenueHealth filters={filters}/>
      </GridCol>

      <GridCol col={{ span: 24 }} style={{ height: '520px' }}>
        <TopologyFloorPlanWidget
          showTopologyFloorplanOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}/>
      </GridCol>
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  return (
    <GridRow>
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
        <TopApplicationsByTraffic filters={filters} tabId={'venue-detail-ap-top-traffic'} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSSIDsByClient filters={filters} />
      </GridCol>
    </GridRow>
  )
}

function SwitchWidgets (props: { filters: AnalyticsFilter }) {
  const filters = props.filters
  const supportPortTraffic = useIsSplitOn(Features.SWITCH_PORT_TRAFFIC)
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        {
          supportPortTraffic ?
            <SwitchesTrafficByVolume filters={filters} />
            :<SwitchesTrafficByVolumeLegacy filters={filters} />
        }
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByPoEUsage filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByTraffic filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchesByError filters={filters} />
      </GridCol>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <TopSwitchModels filters={filters} />
      </GridCol>
    </GridRow>
  )
}
