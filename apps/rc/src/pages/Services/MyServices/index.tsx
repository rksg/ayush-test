import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed }                from '@acx-ui/feature-toggle'
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
  useGetEdgeFirewallViewDataListQuery
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
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

  const services = [
    {
      type: ServiceType.MDNS_PROXY,
      category: RadioCardCategory.WIFI,
      tableQuery: useGetEnhancedMdnsProxyListQuery({ params, payload: defaultPayload })
    },
    {
      type: ServiceType.DHCP,
      category: RadioCardCategory.WIFI,
      tableQuery: useGetDHCPProfileListViewModelQuery({ params, payload: defaultPayload })
    },
    {
      type: ServiceType.EDGE_DHCP,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled
      }),
      disabled: !isEdgeEnabled
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      tableQuery: useGetNetworkSegmentationViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeReady
      }),
      disabled: !isEdgeEnabled || !isEdgeReady
    },
    {
      type: ServiceType.EDGE_FIREWALL,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetEdgeFirewallViewDataListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeEnabled || !isEdgeReady
      }),
      disabled: !isEdgeEnabled || !isEdgeReady
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
      tableQuery: useGetEnhancedPortalProfileListQuery({ params, payload: { filters: {} } })
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      categories: [RadioCardCategory.SWITCH],
      tableQuery: useWebAuthTemplateListQuery({ params, payload: { ...defaultPayload } }, {
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
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) }
        ]: undefined}
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
