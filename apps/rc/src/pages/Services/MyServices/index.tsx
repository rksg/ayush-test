import { useIntl } from 'react-intl'

import { Button, GridCol, PageHeader } from '@acx-ui/components'
import { useServiceListQuery }         from '@acx-ui/rc/services'
import {
  getSelectServiceRoutePath,
  ServiceTechnology,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { ServiceCard, ServiceCardMode } from '../ServiceCard'

import * as UI from './styledComponents'

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

  // TODO should invoke self List API here when API is ready, ex: useGetMdnsProxyListQuery, useGetDpskListQuery....
  const serviceListQueryMap = {
    [ServiceType.MDNS_PROXY]: useServiceListQuery({
      params, payload: { ...defaultPayload, filters: { type: [ServiceType.MDNS_PROXY] } }
    }),
    [ServiceType.DHCP]: useServiceListQuery({
      params, payload: { ...defaultPayload, filters: { type: [ServiceType.DHCP] } }
    }),
    [ServiceType.DPSK]: useServiceListQuery({
      params, payload: { ...defaultPayload, filters: { type: [ServiceType.DPSK] } }
    }),
    [ServiceType.WIFI_CALLING]: useServiceListQuery({
      params, payload: { ...defaultPayload, filters: { type: [ServiceType.WIFI_CALLING] } }
    }),
    [ServiceType.PORTAL]: useServiceListQuery({
      params, payload: { ...defaultPayload, filters: { type: [ServiceType.PORTAL] } }
    })
  }


  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'My Services' })}
        extra={[
          <TenantLink to={getSelectServiceRoutePath(true)} key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Service' })}</Button>
          </TenantLink>
        ]}
      />
      <UI.CardsRow>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.DHCP}
            technology={ServiceTechnology.WIFI}
            count={serviceListQueryMap[ServiceType.DHCP].data?.totalCount}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.DPSK}
            technology={ServiceTechnology.WIFI}
            count={serviceListQueryMap[ServiceType.DPSK].data?.totalCount}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.WIFI_CALLING}
            technology={ServiceTechnology.WIFI}
            count={serviceListQueryMap[ServiceType.WIFI_CALLING].data?.totalCount}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
      </UI.CardsRow>
      <UI.CardsRow>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.PORTAL}
            technology={ServiceTechnology.WIFI}
            count={serviceListQueryMap[ServiceType.PORTAL].data?.totalCount}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.MDNS_PROXY}
            technology={ServiceTechnology.WIFI}
            count={serviceListQueryMap[ServiceType.MDNS_PROXY].data?.totalCount}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
      </UI.CardsRow>
    </>
  )
}
