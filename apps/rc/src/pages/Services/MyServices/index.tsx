import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader, RadioCardCategory } from '@acx-ui/components'
import { Features, useIsSplitOn }                                  from '@acx-ui/feature-toggle'
import {
  useGetDhcpStatsQuery,
  useGetDpskListQuery,
  useGetNetworkSegmentationStatsListQuery,
  useGetPortalProfileListQuery,
  useServiceListQuery,
  useWebAuthTemplateListQuery
} from '@acx-ui/rc/services'
import {
  getSelectServiceRoutePath,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'
import { filterByAccess }        from '@acx-ui/user'

import { ServiceCard } from '../ServiceCard'

const defaultPayload = {
  searchString: '',
  fields: [
    'id',
    'name',
    'type',
    'scope',
    'cog'
  ]
}

export default function MyServices () {
  const { $t } = useIntl()
  const params = useParams()
  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)
  const isEdgeDhcpEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled

  const services = [
    {
      type: ServiceType.MDNS_PROXY,
      category: RadioCardCategory.WIFI,
      tableQuery: useServiceListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [ServiceType.MDNS_PROXY] } }
      })
    },
    {
      type: ServiceType.DHCP,
      category: RadioCardCategory.WIFI,
      tableQuery: useServiceListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [ServiceType.DHCP] } }
      })
    },
    {
      type: ServiceType.EDGE_DHCP,
      category: RadioCardCategory.EDGE,
      tableQuery: useGetDhcpStatsQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !isEdgeDhcpEnabled
      }),
      disabled: !isEdgeDhcpEnabled
    },
    {
      type: ServiceType.NETWORK_SEGMENTATION,
      category: RadioCardCategory.EDGE,
      tableQuery: useGetNetworkSegmentationStatsListQuery({
        params, payload: { ...defaultPayload }
      },{
        skip: !networkSegmentationEnabled
      }),
      disabled: !networkSegmentationEnabled
    },
    {
      type: ServiceType.DPSK,
      category: RadioCardCategory.WIFI,
      tableQuery: useGetDpskListQuery({})
    },
    {
      type: ServiceType.WIFI_CALLING,
      category: RadioCardCategory.WIFI,
      tableQuery: useServiceListQuery({ // TODO should invoke self List API here when API is ready
        params, payload: { ...defaultPayload, filters: { type: [ServiceType.WIFI_CALLING] } }
      })
    },
    {
      type: ServiceType.PORTAL,
      category: RadioCardCategory.WIFI,
      tableQuery: useGetPortalProfileListQuery({ params })
    },
    {
      type: ServiceType.WEBAUTH_SWITCH,
      category: RadioCardCategory.SWITCH,
      tableQuery: useWebAuthTemplateListQuery({ params, payload: {} })
    }
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
            <GridCol col={{ span: 6 }}>
              <ServiceCard
                key={service.type}
                serviceType={service.type}
                categories={[service.category]}
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
