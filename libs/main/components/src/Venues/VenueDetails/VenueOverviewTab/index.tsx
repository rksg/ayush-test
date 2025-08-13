import { useContext, useEffect, useMemo, useState } from 'react'

import { isEmpty }   from 'lodash'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  ConnectedClientsOverTime,
  IncidentBySeverity,
  NetworkHistory,
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
  getDefaultEarliestStart,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn }        from '@acx-ui/feature-toggle'
import {
  LowPowerBannerAndModal,
  TopologyFloorPlanWidget,
  VenueAlarmWidget, VenueDevicesWidget
} from '@acx-ui/rc/components'
import {
  useGetVenueApCapabilitiesQuery,
  useGetVenueRadioCustomizationQuery,
  useGetVenueTemplateApCapabilitiesQuery,
  useGetVenueTemplateDefaultRegulatoryChannelsQuery,
  useLazyApListQuery,
  useVenueDefaultRegulatoryChannelsQuery
} from '@acx-ui/rc/services'
import { APExtended, Capabilities, ShowTopologyFloorplanOn, VenueDefaultRegulatoryChannels } from '@acx-ui/rc/utils'
import { useNavigateToPath }                                                                 from '@acx-ui/react-router-dom'
import { getUserProfile, isCoreTier }                                                        from '@acx-ui/user'
import { generateVenueFilter, useDateFilter, LoadTimeContext }                               from '@acx-ui/utils'
import type { AnalyticsFilter }                                                              from '@acx-ui/utils'

import { useVenueConfigTemplateQueryFnSwitcher } from '../../venueConfigTemplateApiSwitcher'

import * as UI from './styledComponents'

export function VenueOverviewTab () {
  const { $t } = useIntl()
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const { dateFilter } = useDateFilter({ showResetMsg,
    earliestStart: getDefaultEarliestStart() })
  const { venueId, tenantId } = useParams()
  const isUseRbacApi = useIsSplitOn(Features.WIFI_RBAC_API)
  const { onPageFilterChange } = useContext(LoadTimeContext)
  const [hasSupportAfcAp, setHasSupportAfcAp] = useState(false)

  const [ getApList ] = useLazyApListQuery()

  const venueFilter = {
    ...dateFilter,
    filter: generateVenueFilter([venueId as string])
  }

  const { data: venueRadio } = useGetVenueRadioCustomizationQuery({
    params: { venueId },
    enableRbac: isUseRbacApi
  })

  // available channels from this venue country code
  const { data: supportChannelsData, isLoading: isLoadingSupportChannelsData } =
    useVenueConfigTemplateQueryFnSwitcher<VenueDefaultRegulatoryChannels>({
      useQueryFn: useVenueDefaultRegulatoryChannelsQuery,
      useTemplateQueryFn: useGetVenueTemplateDefaultRegulatoryChannelsQuery,
      enableRbac: isUseRbacApi
    })

  // get venue capabilities
  const { data: venueApCaps, isLoading: isLoadingVenueApCaps } =
    useVenueConfigTemplateQueryFnSwitcher<Capabilities>({
      useQueryFn: useGetVenueApCapabilitiesQuery,
      useTemplateQueryFn: useGetVenueTemplateApCapabilitiesQuery,
      enableRbac: isUseRbacApi
    })

  // filter out support tri-band AP model in venue capabilities
  const { triBandApModels, triBanOutdoorApModels } = useMemo(() => {
    if (venueApCaps) {
      const apModels = venueApCaps.apModels
      const triBandApModels = apModels?.filter(
        apCapability => apCapability.supportTriRadio === true)
        .map(triBandApCapability => triBandApCapability.model) as string[]
      const triBanOutdoorApModels = apModels?.filter(
        apCapability => apCapability.supportTriRadio === true && apCapability.isOutdoor === true)
        .map(triBandApCapability => triBandApCapability.model) as string[]
      return { triBandApModels, triBanOutdoorApModels }
    }
    return {
      triBandApModels: [],
      triBanOutdoorApModels: []
    }
  }, [venueApCaps])

  // Get AP List filter by the current venue ID and triBandApModelNames model.
  useEffect(() => {
    if (!venueRadio || isEmpty(triBandApModels)) {
      return
    }
    let filters = { model: triBandApModels, venueId: [venueId] }
    const payload = {
      fields: ['serialNumber', 'model', 'name'],
      pageSize: 10000,
      filters
    }
    if (getApList) {
      getApList({ params: { tenantId }, payload, enableRbac: isUseRbacApi }, true).unwrap()
        .then((res) => {
          const { data } = res || {}
          if (data.length > 0) {
            // distinct triband AP model list under the venue
            const venueTriBandApModels = data
              .map((ap: APExtended) => ap.model)
              .filter((value, index, array) => array.indexOf(value) === index)

            // filter out triband outdoor AP under the venue
            const venueTriBandOutdoorApModels = venueTriBandApModels
              .filter(apModel => triBanOutdoorApModels.includes(apModel))

            if (venueTriBandOutdoorApModels.length > 0) {
              setHasSupportAfcAp(true)
            } else if (venueRadio.radioParams6G?.enableAfc) {
              setHasSupportAfcAp(true)
            }
          } else {
            setHasSupportAfcAp(false)
          }
        })
    }

    //setHasSupportAfcAp(true)
  }, [venueRadio, triBandApModels, triBanOutdoorApModels])

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

  return (
    <Loader states={[{
      isLoading: isLoadingSupportChannelsData || isLoadingVenueApCaps
    }]}>
      {
        (
          supportChannelsData?.afcEnabled &&
          hasSupportAfcAp &&
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
    </Loader>)
}

function CommonDashboardWidgets (props: { filters: AnalyticsFilter }) {
  const { venueId } = useParams()
  const [incidentCount, setIncidentCount] = useState(0)
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)

  const onIncidentClick =
    useNavigateToPath(`/venues/${venueId}/venue-details/analytics/incidents/overview`)

  const filters = props.filters
  return (
    <GridRow>
      <GridCol col={{ span: isCore ? 12 : 7 }} style={{ height: '176px' }}>
        <VenueAlarmWidget />
      </GridCol>
      {!isCore &&
        <GridCol col={{ span: 7 }} style={{ height: '176px' }}>
          <UI.Container
            incidentCount={incidentCount}
            onClick={incidentCount > 0 ? onIncidentClick : undefined}
          >
            <IncidentBySeverity type='donut' filters={filters} setIncidentCount={setIncidentCount}/>
          </UI.Container>
        </GridCol>
      }
      <GridCol col={{ span: isCore ? 12 : 10 }} style={{ height: '176px' }}>
        <VenueDevicesWidget />
      </GridCol>

      {!isCore &&
        <GridCol col={{ span: 24 }} style={{ height: '88px' }}>
          <VenueHealth filters={filters}/>
        </GridCol>
      }

      <GridCol col={{ span: 24 }} style={{ height: '520px' }}>
        <TopologyFloorPlanWidget
          showTopologyFloorplanOn={ShowTopologyFloorplanOn.VENUE_OVERVIEW}/>
      </GridCol>
    </GridRow>
  )
}

function ApWidgets (props: { filters: AnalyticsFilter }) {
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const filters = props.filters
  return (
    <GridRow>
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
        <TopApplicationsByTraffic filters={filters} tabId={'venue-detail-ap-top-traffic'} />
      </GridCol>
      }
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
  return (
    <GridRow>
      <GridCol col={{ span: 12 }} style={{ height: '280px' }}>
        <SwitchesTrafficByVolume filters={filters} />
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
