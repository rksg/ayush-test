import { useIntl } from 'react-intl'
import styled      from 'styled-components/macro'

import { GridCol, GridRow, PageHeader }                                             from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { useIsEdgeFeatureReady }                                                    from '@acx-ui/rc/components'
import {
  useGetDHCPProfileListViewModelQuery,
  useGetDhcpStatsQuery,
  useGetDpskListQuery,
  useGetEdgeFirewallViewDataListQuery,
  useGetEdgeMdnsProxyViewDataListQuery,
  useGetEdgePinViewDataListQuery,
  useGetEdgeTnmServiceListQuery,
  useGetEnhancedMdnsProxyListQuery,
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useGetResidentPortalListQuery,
  useWebAuthTemplateListQuery,
  useGetEdgeMvSdLanViewDataListQuery
} from '@acx-ui/rc/services'
import {
  getSelectServiceRoutePath,
  hasSomeServicesPermission,
  isServiceCardEnabled,
  ServiceOperation,
  ServiceType,
  useDhcpStateMap,
  useMdnsProxyStateMap
} from '@acx-ui/rc/utils'
import { useParams }                  from '@acx-ui/react-router-dom'
import { RadioCardCategory }          from '@acx-ui/types'
import { isCoreTier, getUserProfile } from '@acx-ui/user'

import { ServiceCard }                                                         from '../ServiceCard'
import { AddProfileButton }                                                    from '../UnifiedServices/MyServices'
import { useMdnsProxyConsolidationTotalCount, useDhcpConsolidationTotalCount } from '../UnifiedServices/useUnifiedServiceListWithTotalCount'

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
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeTnmServiceReady = useIsEdgeFeatureReady(Features.EDGE_THIRDPARTY_MGMT_TOGGLE)
  const isEnabledRbacService = useIsSplitOn(Features.RBAC_SERVICE_POLICY_TOGGLE)
  const isEdgeOltEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)
  const dhcpStateMap = useDhcpStateMap()
  const mdnsProxyDisabledMap = useMdnsProxyStateMap()

  const services = [
    {
      type: ServiceType.MDNS_PROXY,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetEnhancedMdnsProxyListQuery({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }, {
        skip: !mdnsProxyDisabledMap[ServiceType.MDNS_PROXY]
      }).data?.totalCount,
      disabled: !mdnsProxyDisabledMap[ServiceType.MDNS_PROXY]
    },
    {
      type: ServiceType.EDGE_MDNS_PROXY,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgeMdnsProxyViewDataListQuery({
        params, payload: defaultPayload
      }, {
        skip: !mdnsProxyDisabledMap[ServiceType.EDGE_MDNS_PROXY]
      }).data?.totalCount,
      disabled: !mdnsProxyDisabledMap[ServiceType.EDGE_MDNS_PROXY],
      isBetaFeature: useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)
    },
    {
      type: ServiceType.MDNS_PROXY_CONSOLIDATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useMdnsProxyConsolidationTotalCount({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }, !mdnsProxyDisabledMap[ServiceType.MDNS_PROXY_CONSOLIDATION]).data?.totalCount,
      disabled: !mdnsProxyDisabledMap[ServiceType.MDNS_PROXY_CONSOLIDATION]
    },
    {
      type: ServiceType.DHCP,
      categories: [RadioCardCategory.WIFI],
      totalCount: useGetDHCPProfileListViewModelQuery({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }).data?.totalCount,
      disabled: !dhcpStateMap[ServiceType.DHCP]
    },
    {
      type: ServiceType.EDGE_DHCP,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !dhcpStateMap[ServiceType.EDGE_DHCP]
      }).data?.totalCount,
      disabled: !dhcpStateMap[ServiceType.EDGE_DHCP]
    },
    {
      type: ServiceType.DHCP_CONSOLIDATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      totalCount: useDhcpConsolidationTotalCount({
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      }, !dhcpStateMap[ServiceType.DHCP_CONSOLIDATION]).data?.totalCount,
      disabled: !dhcpStateMap[ServiceType.DHCP_CONSOLIDATION]
    },
    {
      type: ServiceType.PIN,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgePinViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgePinReady
      }).data?.totalCount,
      disabled: !isEdgePinReady
    },
    {
      type: ServiceType.EDGE_SD_LAN,
      categories: [RadioCardCategory.EDGE],
      totalCount: useGetEdgeMvSdLanViewDataListQuery({
        params, payload: { fields: ['id', 'edgeClusterId'] }
      }).data?.totalCount
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
        skip: !isEdgeFirewallHaReady
      }).data?.totalCount,
      disabled: !isEdgeFirewallHaReady
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
        params, payload: { ...defaultPayload }, enableRbac: true
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
        params, payload: { ...defaultPayload }, enableRbac: true
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
