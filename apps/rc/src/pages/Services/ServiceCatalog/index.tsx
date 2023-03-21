import { Typography }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader } from '@acx-ui/components'
import { RadioCardCategory }            from '@acx-ui/components'
import { Features, useIsSplitOn }       from '@acx-ui/feature-toggle'
import {
  ServiceType
} from '@acx-ui/rc/utils'

import { ServiceCard } from '../ServiceCard'


import * as UI from './styledComponents'


export default function ServiceCatalog () {
  const { $t } = useIntl()
  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const networkSegmentationEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION)
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const isEdgeDhcpEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled
  const isEdgeFirewallEnabled = useIsSplitOn(Features.EDGES)

  const sets = [
    {
      key: 'connectivity',
      title: defineMessage({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_DHCP,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeDhcpEnabled
        },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.NETWORK_SEGMENTATION,
          categories: [RadioCardCategory.WIFI],
          disabled: !networkSegmentationEnabled
        }
      ]
    },
    {
      key: 'security',
      title: defineMessage({ defaultMessage: 'Security' }),
      items: [
        { type: ServiceType.EDGE_FIREWALL,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeFirewallEnabled
        }
      ]
    },
    {
      key: 'application',
      title: defineMessage({ defaultMessage: 'Application' }),
      items: [
        { type: ServiceType.MDNS_PROXY, categories: [RadioCardCategory.WIFI] },
        { type: ServiceType.WIFI_CALLING, categories: [RadioCardCategory.WIFI] }
      ]
    },
    {
      key: 'guests',
      title: defineMessage({ defaultMessage: 'Guests & Residents' }),
      items: [
        { type: ServiceType.PORTAL, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.WEBAUTH_SWITCH,
          categories: [RadioCardCategory.SWITCH],
          disabled: !networkSegmentationEnabled || !networkSegmentationSwitchEnabled
        }
      ]
    }
  ]

  return (
    <>
      <PageHeader title={$t({ defaultMessage: 'Service Catalog' })} />
      {sets.map(set =>
        <UI.CategoryContainer key={set.key}>
          <Typography.Title level={3}>
            { $t(set.title) }
          </Typography.Title>
          <GridRow>
            {set.items.map(item => item.disabled
              ? null
              : <GridCol col={{ span: 6 }}>
                <ServiceCard
                  key={item.type}
                  serviceType={item.type}
                  categories={item.categories}
                  type={'button'}
                />
              </GridCol>)}
          </GridRow>
        </UI.CategoryContainer>
      )}
    </>
  )
}
