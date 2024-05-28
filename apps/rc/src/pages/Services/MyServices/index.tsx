import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCardCategory } from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed }  from '@acx-ui/feature-toggle'
import {
  useGetDHCPProfileListViewModelQuery,
  useGetDhcpStatsQuery,
  useGetDpskListQuery,
  useGetEnhancedMdnsProxyListQuery,
  useGetNetworkSegmentationViewDataListQuery,
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useWebAuthTemplateListQuery,
  useGetResidentPortalListQuery,
  useGetEdgeFirewallViewDataListQuery,
  useGetEdgeSdLanP2ViewDataListQuery
} from '@acx-ui/rc/services'
import {
  getSelectServiceRoutePath,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { ServiceCard } from '../ServiceCard'

const defaultPayload = {
  fields: ['id']
}

export default function MyServices () {
  const { $t } = useIntl()
  const params = useParams()
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsSplitOn(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsSplitOn(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsSplitOn(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const services = [
    {
      type: ServiceType.MDNS_PROXY,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetEnhancedMdnsProxyListQuery({ params, payload: defaultPayload })
    },
    {
      type: ServiceType.DHCP,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetDHCPProfileListViewModelQuery({ params, payload: defaultPayload })
    },
    {
      type: ServiceType.EDGE_DHCP,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeHaReady || !isEdgeDhcpHaReady
      }),
      disabled: !isEdgeEnabled || !isEdgeHaReady || !isEdgeDhcpHaReady
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      tableQuery: useGetNetworkSegmentationViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeReady || !isEdgePinReady
      }),
      disabled: !isEdgeEnabled || !isEdgeReady || !isEdgePinReady
    },
    {
      type: ServiceType.EDGE_SD_LAN,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      tableQuery: useGetEdgeSdLanP2ViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeReady || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
      }),
      disabled: !isEdgeEnabled || !isEdgeReady || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
    },
    {
      type: ServiceType.EDGE_FIREWALL,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetEdgeFirewallViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeHaReady || !isEdgeFirewallHaReady
      }),
      disabled: !isEdgeEnabled || !isEdgeHaReady || !isEdgeFirewallHaReady
    },
    {
      type: ServiceType.DPSK,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetDpskListQuery({})
    },
    {
      type: ServiceType.WIFI_CALLING,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetEnhancedWifiCallingServiceListQuery({
        params, payload: defaultPayload
      })
    },
    {
      type: ServiceType.PORTAL,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetEnhancedPortalProfileListQuery({
        params, payload: { filters: {}, enableRbac: isEnabledRbacService } })
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      categories: [RadioCardCategory.SWITCH],
      tableQuery: useWebAuthTemplateListQuery({
        params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled
      }, {
        skip: !isEdgeEnabled || !networkSegmentationSwitchEnabled
      }),
      disabled: !isEdgeEnabled || !networkSegmentationSwitchEnabled
    },
    {
      type: ServiceType.RESIDENT_PORTAL,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetResidentPortalListQuery({ params, payload: { filters: {} } }, {
        skip: !propertyManagementEnabled
      }),
      disabled: !propertyManagementEnabled
    }
  ]


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'My Services' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={filterByAccess([
          <TenantLink to={getSelectServiceRoutePath(true)}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Service' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        {services.map(service => {
          return (
            !service.disabled &&
            <GridCol key={service.type} col={{ span: 6 }}>
              <ServiceCard
                key={service.type}
                serviceType={service.type}
                categories={service.categories}
                count={service.tableQuery.data?.totalCount}
                type={'default'}
              />
            </GridCol>
          )
        })}
      </GridRow>
    </>
  )
}
