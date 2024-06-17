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
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
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
      // eslint-disable-next-line max-len
      tableQuery: useGetDHCPProfileListViewModelQuery({ params, payload: defaultPayload, enableRbac: isEnabledRbacService })
    },
    {
      type: ServiceType.EDGE_DHCP,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeHaReady || !isEdgeDhcpHaReady
      }),
      disabled: !isEdgeHaReady || !isEdgeDhcpHaReady
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      tableQuery: useGetNetworkSegmentationViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgePinReady
      }),
      disabled: !isEdgePinReady
    },
    {
      type: ServiceType.EDGE_SD_LAN,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
      tableQuery: useGetEdgeSdLanP2ViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
      }),
      disabled: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
    },
    {
      type: ServiceType.EDGE_FIREWALL,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetEdgeFirewallViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeHaReady || !isEdgeFirewallHaReady
      }),
      disabled: !isEdgeHaReady || !isEdgeFirewallHaReady
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
        params, payload: defaultPayload, enableRbac: isEnabledRbacService
      })
    },
    {
      type: ServiceType.PORTAL,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetEnhancedPortalProfileListQuery({
        params, payload: { filters: {} }, enableRbac: isEnabledRbacService })
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      categories: [RadioCardCategory.SWITCH],
      tableQuery: useWebAuthTemplateListQuery({
        params, payload: { ...defaultPayload }, enableRbac: isSwitchRbacEnabled
      }, {
        skip: !isEdgePinReady || !networkSegmentationSwitchEnabled
      }),
      disabled: !isEdgePinReady || !networkSegmentationSwitchEnabled
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
