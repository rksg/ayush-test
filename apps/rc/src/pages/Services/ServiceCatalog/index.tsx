import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  ServiceType,
  ServiceTechnology
} from '@acx-ui/rc/utils'

import { ServiceCard, ServiceCardMode } from '../ServiceCard'

import * as UI from './styledComponents'


export default function ServiceCatalog () {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Service Catalog' })} />
      <UI.CategoryContainer>
        <Typography.Title level={3}>
          { $t({ defaultMessage: 'Connectivity' }) }
        </Typography.Title>
        <GridRow>
          <GridCol col={{ span: 8 }}>
            <ServiceCard
              type={ServiceType.DHCP}
              technology={ServiceTechnology.WIFI}
              action={ServiceCardMode.ADD}
            />
          </GridCol>
          <GridCol col={{ span: 8 }}>
            <ServiceCard
              type={ServiceType.DPSK}
              technology={ServiceTechnology.WIFI}
              action={ServiceCardMode.ADD}
            />
          </GridCol>
          {networkSegmentationEnabled &&
            <GridCol col={{ span: 8 }}>
              <ServiceCard
                type={ServiceType.NETWORK_SEGMENTATION}
                technology={ServiceTechnology.WIFI}
                action={ServiceCardMode.ADD}
              />
            </GridCol>
          }
        </GridRow>
      </UI.CategoryContainer>
      <UI.CategoryContainer>
        <Typography.Title level={3}>
          { $t({ defaultMessage: 'Application' }) }
        </Typography.Title>
        <GridRow>
          <GridCol col={{ span: 8 }}>
            <ServiceCard
              type={ServiceType.MDNS_PROXY}
              technology={ServiceTechnology.WIFI}
              action={ServiceCardMode.ADD}
            />
          </GridCol>
          <GridCol col={{ span: 8 }}>
            <ServiceCard
              type={ServiceType.WIFI_CALLING}
              technology={ServiceTechnology.WIFI}
              action={ServiceCardMode.ADD}
            />
          </GridCol>
        </GridRow>
      </UI.CategoryContainer>
      <UI.CategoryContainer>
        <Typography.Title level={3}>
          { $t({ defaultMessage: 'Guests & Residents' }) }
        </Typography.Title>
        <GridRow>
          <GridCol col={{ span: 8 }}>
            <ServiceCard
              type={ServiceType.PORTAL}
              technology={ServiceTechnology.WIFI}
              action={ServiceCardMode.ADD}
            />
          </GridCol>
        </GridRow>
      </UI.CategoryContainer>
    </>
  )
}
