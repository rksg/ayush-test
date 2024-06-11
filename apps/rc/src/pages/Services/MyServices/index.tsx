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
  isServicePolicyCardVisible,
  radioCategoryToScopeKey,
  ServicePolicyCardData,
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

  const services: ServicePolicyCardData<ServiceType>[] = [
    {
      type: ServiceType.MDNS_PROXY,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedMdnsProxyListQuery({
        params, payload: defaultPayload
      }).data?.totalCount
    },
    {
      type: ServiceType.DHCP,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetDHCPProfileListViewModelQuery({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }).data?.totalCount
    },
    {
      type: ServiceType.EDGE_DHCP,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeHaReady || !isEdgeDhcpHaReady
      }).data?.totalCount,
      disabled: !isEdgeEnabled || !isEdgeHaReady || !isEdgeDhcpHaReady
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      totalCount: useGetNetworkSegmentationViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeReady || !isEdgePinReady
      }).data?.totalCount,
      disabled: !isEdgeEnabled || !isEdgeReady || !isEdgePinReady
    },
    {
      type: ServiceType.EDGE_SD_LAN,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useGetEdgeSdLanP2ViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeReady || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
      }).data?.totalCount,
      disabled: !isEdgeEnabled || !isEdgeReady || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
    },
    {
      type: ServiceType.EDGE_FIREWALL,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgeFirewallViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeHaReady || !isEdgeFirewallHaReady
      }).data?.totalCount,
      disabled: !isEdgeEnabled || !isEdgeHaReady || !isEdgeFirewallHaReady
    },
    {
      type: ServiceType.DPSK,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetDpskListQuery({}).data?.totalCount
    },
    {
      type: ServiceType.WIFI_CALLING,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedWifiCallingServiceListQuery({
        params, payload: defaultPayload
      }).data?.totalCount
    },
    {
      type: ServiceType.PORTAL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedPortalProfileListQuery({
        params, payload: { filters: {} }, enableRbac: isEnabledRbacService
      }).data?.totalCount
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      categories: [RadioCardCategory.SWITCH],
      totalCount: useWebAuthTemplateListQuery({
        params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled
      }, {
        skip: !isEdgeEnabled || !networkSegmentationSwitchEnabled
      }).data?.totalCount,
      disabled: !isEdgeEnabled || !networkSegmentationSwitchEnabled
    },
    {
      type: ServiceType.RESIDENT_PORTAL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetResidentPortalListQuery({ params, payload: { filters: {} } }, {
        skip: !propertyManagementEnabled
      }).data?.totalCount,
      disabled: !propertyManagementEnabled
    }
  ]

  const createScopeKeys = radioCategoryToScopeKey(services.map(s => s.categories).flat(), 'create')

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'My Services' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={filterByAccess([
          <TenantLink to={getSelectServiceRoutePath(true)} scopeKey={createScopeKeys}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Service' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        {services.filter(s => isServicePolicyCardVisible(s)).map(service => {
          return (
            <GridCol key={service.type} col={{ span: 6 }}>
              <ServiceCard
                key={service.type}
                serviceType={service.type}
                categories={service.categories}
                count={service.totalCount}
                type={'default'}
              />
            </GridCol>
          )
        })}
      </GridRow>
    </>
  )
}
