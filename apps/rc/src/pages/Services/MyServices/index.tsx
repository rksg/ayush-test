import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { GridCol, GridRow, PageHeader, RadioCardCategory }                          from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                    from '@acx-ui/rc/components'
import {
  useGetDHCPProfileListViewModelQuery,
  useGetDhcpStatsQuery,
  useGetDpskListQuery,
  useGetEdgeFirewallViewDataListQuery,
  useGetEdgeMdnsProxyViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetEdgeSdLanP2ViewDataListQuery,
  useGetEdgeTnmServiceListQuery,
  useGetEnhancedMdnsProxyListQuery,
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useGetResidentPortalListQuery,
  useWebAuthTemplateListQuery
} from '@acx-ui/rc/services'
import {
  AddProfileButton,
  getSelectServiceRoutePath,
  hasSomeServicesPermission,
  isServiceCardEnabled,
  ServiceOperation,
  ServiceType,
  useIsMdnsProxyConsolidationEnabled
} from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'
import { isCoreTier, getUserProfile } from '@acx-ui/user'

import { ServiceCard }                         from '../ServiceCard'
import { useMdnsProxyConsolidationTotalCount } from '../UnifiedServices/useUnifiedServiceListWithTotalCount'

const defaultPayload = {
  fields: ['id']
}

export default function MyServices () {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const params = useParams()
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isPortalProfileEnabled = useIsSplitOn(Features.PORTAL_PROFILE_CONSOLIDATION_TOGGLE)
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeTnmServiceReady = useIsEdgeFeatureReady(Features.EDGE_THIRDPARTY_MGMT_TOGGLE)
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isEdgeOltEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)
  const isMdnsProxyConsolidationEnabled = useIsMdnsProxyConsolidationEnabled()

  const services = [
    {
      type: ServiceType.MDNS_PROXY,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedMdnsProxyListQuery({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }).data?.totalCount,
      disabled: isMdnsProxyConsolidationEnabled
    },
    {
      type: ServiceType.EDGE_MDNS_PROXY,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgeMdnsProxyViewDataListQuery({
        params, payload: defaultPayload
      }, {
        skip: !isEdgeMdnsReady
      }).data?.totalCount,
      disabled: !isEdgeMdnsReady || isMdnsProxyConsolidationEnabled,
      isBetaFeature: useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)
    },
    {
      type: ServiceType.MDNS_PROXY_CONSOLIDATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useMdnsProxyConsolidationTotalCount({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }, !isMdnsProxyConsolidationEnabled).data?.totalCount,
      disabled: !isMdnsProxyConsolidationEnabled
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
      type: ServiceType.PIN,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      totalCount: useGetEdgePinViewDataListQuery({
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
        params, payload: { fields: ['id', 'edgeClusterId'] }
      },{
        skip: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
      }).data?.totalCount,
      disabled: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
    },
    {
      type: ServiceType.EDGE_TNM_SERVICE,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgeTnmServiceListQuery({}, {
        skip: !isEdgeTnmServiceReady
      }).data?.length,
      disabled: !isEdgeTnmServiceReady
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
      type: ServiceType.PORTAL_PROFILE,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: (useGetEnhancedPortalProfileListQuery({
        params, payload: { filters: {} }, enableRbac: isEnabledRbacService
      }).data?.totalCount ?? 0) + (useWebAuthTemplateListQuery({
        params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled
      }, {
        skip: !isEdgePinReady || !networkSegmentationSwitchEnabled
      }).data?.totalCount ?? 0),
      disabled: !isPortalProfileEnabled
    },
    {
      type: ServiceType.PORTAL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedPortalProfileListQuery({
        params, payload: { filters: {} }, enableRbac: isEnabledRbacService
      }).data?.totalCount,
      disabled: isPortalProfileEnabled
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      categories: [RadioCardCategory.EDGE],
      totalCount: useWebAuthTemplateListQuery({
        params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled
      }, {
        skip: !isEdgePinReady || !networkSegmentationSwitchEnabled
      }).data?.totalCount,
      disabled: isPortalProfileEnabled || (!isEdgePinReady || !networkSegmentationSwitchEnabled)
    },
    {
      type: ServiceType.RESIDENT_PORTAL,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetResidentPortalListQuery({ params, payload: { filters: {} } }, {
        skip: !propertyManagementEnabled || isCore
      }).data?.totalCount,
      disabled: !propertyManagementEnabled || isCore
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'My Services' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
        extra={<AddProfileButton
          hasSomeProfilesPermission={() => hasSomeServicesPermission(ServiceOperation.CREATE)}
          linkText={$t({ defaultMessage: 'Add Service' })}
          targetPath={getSelectServiceRoutePath(true)}
        />}
      />
      <GridRow>
        {services.filter(svc => isServiceCardEnabled(svc, ServiceOperation.LIST)).map(service => {
          return (
            <GridCol key={service.type} col={{ span: 6 }}>
              <ServiceCard
                key={service.type}
                serviceType={service.type}
                categories={service.categories}
                count={service.totalCount}
                type={'default'}
                isBetaFeature={service.isBetaFeature}
              />
            </GridCol>
          )
        })}
        {isEdgeOltEnabled && <OltCardWrapper col={{ span: 6 }}>
          <ServiceCard
            key={'EDGE_OLT'}
            serviceType={ServiceType.EDGE_OLT}
            categories={[RadioCardCategory.EDGE]}
            type={'default'}
            isBetaFeature={false}
          />
        </OltCardWrapper>}
      </GridRow>
    </>
  )
}

const OltCardWrapper = styled(GridCol)`
 & > div.ant-card.ant-card-bordered {
  pointer-events: none;
 }
`
