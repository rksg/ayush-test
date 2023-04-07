import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import {
  useGetDHCPProfileListViewModelQuery,
  useGetDhcpStatsQuery,
  useGetDpskListQuery,
  useGetEnhancedMdnsProxyListQuery,
  useGetNetworkSegmentationStatsListQuery,
  useGetEnhancedPortalProfileListQuery,
  useGetEnhancedWifiCallingServiceListQuery,
  useWebAuthTemplateListQuery,
  useGetResidentPortalListQuery
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
  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isEdgeDhcpEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled
  const propertyManagementEnabled = useIsSplitOn(Features.PROPERTY_MANAGEMENT)

  const services = [
    {
      type: ServiceType.MDNS_PROXY,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetEnhancedMdnsProxyListQuery({
        params, payload: defaultPayload
      })
    },
    {
      type: ServiceType.DHCP,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetDHCPProfileListViewModelQuery({ params,
        payload: { ...defaultPayload } })
    },
    {
      type: ServiceType.EDGE_DHCP,
      categories: [RadioCardCategory.EDGE],
      tableQuery: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeDhcpEnabled
      }),
      disabled: !isEdgeDhcpEnabled
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
      tableQuery: useGetNetworkSegmentationStatsListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !networkSegmentationEnabled
      }),
      disabled: !networkSegmentationEnabled
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
        skip: !networkSegmentationEnabled || !networkSegmentationSwitchEnabled
      }),
      disabled: !networkSegmentationEnabled || !networkSegmentationSwitchEnabled
    },
    {
      type: ServiceType.RESIDENT_PORTAL,
      categories: [RadioCardCategory.WIFI],
      tableQuery: useGetResidentPortalListQuery({ params, payload: { filters: {} } }),
      disabled: !propertyManagementEnabled
    },
  ]


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'My Services' })}
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
