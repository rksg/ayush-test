import { Typography } from 'antd'
import { useIntl }    from 'react-intl'

import { GridCol, GridRow, PageHeader }                           from '@acx-ui/components'
import { RadioCardCategory }                                      from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ServicePolicyCardData,
  ServiceType,
  isServicePolicyCardSetVisible,
  isServicePolicyCardVisible
} from '@acx-ui/rc/utils'

import { ServiceCard } from '../ServiceCard'


import * as UI from './styledComponents'


export default function ServiceCatalog () {
  const { $t } = useIntl()
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isEdgeReady = useIsSplitOn(Features.EDGES_TOGGLE)
  const isEdgeSdLanReady = useIsSplitOn(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsSplitOn(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsSplitOn(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsSplitOn(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsSplitOn(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsSplitOn(Features.EDGE_PIN_HA_TOGGLE)

  const sets: { title: string, items: ServicePolicyCardData<ServiceType>[] }[] = [
    {
      title: $t({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_DHCP,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeHaReady || !isEdgeDhcpHaReady
        },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.NETWORK_SEGMENTATION,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeReady || !isEdgePinReady
        },
        {
          type: ServiceType.EDGE_SD_LAN,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeReady || !(isEdgeSdLanReady || isEdgeSdLanHaReady)
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Security' }),
      items: [
        { type: ServiceType.EDGE_FIREWALL,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeEnabled || !isEdgeHaReady || !isEdgeFirewallHaReady
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Application' }),
      items: [
        { type: ServiceType.MDNS_PROXY, categories: [RadioCardCategory.WIFI] },
        { type: ServiceType.WIFI_CALLING, categories: [RadioCardCategory.WIFI] }
      ]
    },
    {
      title: $t({ defaultMessage: 'Guests & Residents' }),
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
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
      />
      {sets.filter(s => isServicePolicyCardSetVisible(s)).map(set => {
        return <UI.CategoryContainer key={set.title}>
          <Typography.Title level={3}>
            { set.title }
          </Typography.Title>
          <GridRow>
            {set.items.filter(i => isServicePolicyCardVisible(i)).map(item => {
              return <GridCol key={item.type} col={{ span: 6 }}>
                <ServiceCard
                  key={item.type}
                  serviceType={item.type}
                  categories={item.categories}
                  type={'button'}
                />
              </GridCol>
            })}
          </GridRow>
        </UI.CategoryContainer>
      })}
    </>
  )
}
