import { Typography }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { RadioCardCategory }            from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  ServiceType
} from '@acx-ui/rc/utils'

import { ServiceCard, ServiceCardMode } from '../ServiceCard'


import * as UI from './styledComponents'


export default function ServiceCatalog () {
  const { $t } = useIntl()
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)

  const sets = [
    {
      title: defineMessage({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.NETWORK_SEGMENTATION,
          categories: [RadioCardCategory.WIFI],
          disabled: !networkSegmentationEnabled
        }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'Application' }),
      items: [
        { type: ServiceType.MDNS_PROXY, categories: [RadioCardCategory.WIFI] },
        { type: ServiceType.WIFI_CALLING, categories: [RadioCardCategory.WIFI] }
      ]
    },
    {
      title: defineMessage({ defaultMessage: 'More Services' }),
      items: [
        { type: ServiceType.PORTAL, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.WEBAUTH_SWITCH,
          categories: [RadioCardCategory.SWITCH],
          disabled: !networkSegmentationEnabled
        }
      ]
    }
  ]

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Service Catalog' })} />
      {sets.map(set =>
        <UI.CategoryContainer>
          <Typography.Title level={3}>
            { $t(set.title) }
          </Typography.Title>
          <GridRow>
            {set.items.map(item => item.disabled
              ? null
              : <GridCol col={{ span: 6 }}>
                <ServiceCard
                  type={item.type}
                  categories={[RadioCardCategory.WIFI]}
                  action={ServiceCardMode.ADD}
                />
              </GridCol>)}
          </GridRow>
        </UI.CategoryContainer>
      )}
    </>
  )
}
