import { Typography }             from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader }             from '@acx-ui/components'
import { RadioCardCategory }                        from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ServiceType
} from '@acx-ui/rc/utils'

import { ServiceCard } from '../ServiceCard'


import * as UI from './styledComponents'


export default function ServiceCatalog () {
  const { $t } = useIntl()
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)

  const sets = [
    {
      key: 'connectivity',
      title: defineMessage({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_DHCP,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled
        },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.NETWORK_SEGMENTATION,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeReady
        }
      ]
    },
    {
      key: 'security',
      title: defineMessage({ defaultMessage: 'Security' }),
      items: [
        { type: ServiceType.EDGE_FIREWALL,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeReady
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
          disabled: !isEdgeEnabled || !networkSegmentationSwitchEnabled
        },
        {
          type: ServiceType.RESIDENT_PORTAL,
          categories: [RadioCardCategory.WIFI],
          disabled: !propertyManagementEnabled
        }
      ]
    }
  ]

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Service Catalog' })}
        breadcrumb={isNavbarEnhanced ? [
          { text: $t({ defaultMessage: 'Network Control' }) }
        ]: undefined}
      />
      {sets.map(set => {
        const isAllDisabled = _.findIndex(set.items,
          (o) => o.disabled === undefined || o.disabled === false ) === -1

        return isAllDisabled
          ? null
          : <UI.CategoryContainer key={set.key}>
            <Typography.Title level={3}>
              { $t(set.title) }
            </Typography.Title>
            <GridRow>
              {set.items.map(item => item.disabled
                ? null
                : <GridCol key={item.type} col={{ span: 6 }}>
                  <ServiceCard
                    key={item.type}
                    serviceType={item.type}
                    categories={item.categories}
                    type={'button'}
                  />
                </GridCol>)}
            </GridRow>
          </UI.CategoryContainer>
      }
      )}
    </>
  )
}
