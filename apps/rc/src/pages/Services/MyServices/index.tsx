import { useIntl } from 'react-intl'

import { Button, GridCol, PageHeader } from '@acx-ui/components'
import {
  getSelectServiceRoutePath,
  ServiceTechnology,
  ServiceType
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

import { ServiceCard, ServiceCardMode } from '../ServiceCard'

import * as UI from './styledComponents'

export default function MyServices () {
  const { $t } = useIntl()
  // TODO just for display
  const serviceCount = {
    [ServiceType.DHCP]: 2,
    [ServiceType.DPSK]: 5,
    [ServiceType.WIFI_CALLING]: 4,
    [ServiceType.PORTAL]: 1,
    [ServiceType.MDNS_PROXY]: 1
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
            count={serviceCount[ServiceType.DHCP]}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.DPSK}
            technology={ServiceTechnology.WIFI}
            count={serviceCount[ServiceType.DPSK]}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.WIFI_CALLING}
            technology={ServiceTechnology.WIFI}
            count={serviceCount[ServiceType.WIFI_CALLING]}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
      </UI.CardsRow>
      <UI.CardsRow>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.PORTAL}
            technology={ServiceTechnology.WIFI}
            count={serviceCount[ServiceType.PORTAL]}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
        <GridCol col={{ span: 8 }}>
          <ServiceCard
            type={ServiceType.MDNS_PROXY}
            technology={ServiceTechnology.WIFI}
            count={serviceCount[ServiceType.MDNS_PROXY]}
            action={ServiceCardMode.LIST}
          />
        </GridCol>
      </UI.CardsRow>
    </>
  )
}
