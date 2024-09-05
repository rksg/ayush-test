import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                   from '@acx-ui/rc/components'
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
  isServicePolicyCardEnabled,
  ServicePolicyCardData,
  servicePolicyCardDataToScopeKeys,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { EdgeScopes }            from '@acx-ui/types'
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
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)

  const services: ServicePolicyCardData<ServiceType>[] = [
    {
      type: ServiceType.MDNS_PROXY,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedMdnsProxyListQuery({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
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
        skip: !isEdgeHaReady || !isEdgeDhcpHaReady
      }).data?.totalCount,
      disabled: !isEdgeHaReady || !isEdgeDhcpHaReady
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      totalCount: useGetNetworkSegmentationViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgePinReady
      }).data?.totalCount,
      disabled: !isEdgePinReady
    },
    {
      type: ServiceType.EDGE_SD_LAN,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useGetEdgeSdLanP2ViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
      }).data?.totalCount,
      disabled: !(isEdgeSdLanReady || isEdgeSdLanHaReady),
      scopeKeysMap: {
        create: [EdgeScopes.CREATE],
        read: [EdgeScopes.READ]
      }
    },
    {
      type: ServiceType.EDGE_FIREWALL,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgeFirewallViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeHaReady || !isEdgeFirewallHaReady
      }).data?.totalCount,
      disabled: !isEdgeHaReady || !isEdgeFirewallHaReady
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
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
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
        skip: !isEdgePinReady || !networkSegmentationSwitchEnabled
      }).data?.totalCount,
      disabled: !isEdgePinReady || !networkSegmentationSwitchEnabled
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

  // eslint-disable-next-line max-len
  const allServicesScopeKeysForCreate = servicePolicyCardDataToScopeKeys(services, 'create')

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'My Services' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={filterByAccess([
          <TenantLink to={getSelectServiceRoutePath(true)} scopeKey={allServicesScopeKeysForCreate}>
            <Button type='primary'>{$t({ defaultMessage: 'Add Service' })}</Button>
          </TenantLink>
        ])}
      />
      <GridRow>
        {services.filter(s => isServicePolicyCardEnabled<ServiceType>(s, 'read')).map(service => {
          return (
            <GridCol key={service.type} col={{ span: 6 }}>
              <ServiceCard
                key={service.type}
                serviceType={service.type}
                categories={service.categories}
                count={service.totalCount}
                type={'default'}
                scopeKeysMap={service.scopeKeysMap}
                isBetaFeature={service.isBetaFeature}
              />
            </GridCol>
          )
        })}
      </GridRow>
    </>
  )
}