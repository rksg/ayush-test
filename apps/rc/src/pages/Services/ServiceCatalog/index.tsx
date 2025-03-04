import { useState } from 'react'


import { Typography }             from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader, RadioCard, RadioCardCategory }                                    from '@acx-ui/components'
import { Features, TierFeatures, useIsBetaEnabled, useIsSplitOn, useIsTierAllowed }                      from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType, useIsEdgeFeatureReady } from '@acx-ui/rc/components'
import {
  IncompatibilityFeatures,
  ServiceOperation,
  ServiceType,
  isServiceCardEnabled,
  isServiceCardSetEnabled,
  serviceTypeLabelMapping,
  serviceTypeDescMapping
} from '@acx-ui/rc/utils'

import { ServiceCard } from '../ServiceCard'


import * as UI from './styledComponents'

interface ServiceCardItem {
  title: string
  items: {
    type: ServiceType
    categories: RadioCardCategory[]
    disabled?: boolean
    helpIcon?: React.ReactNode
    isBetaFeature?: boolean
  }[]
}

export default function ServiceCatalog () {
  const { $t } = useIntl()
  const networkSegmentationSwitchEnabled = useIsSplitOn(Features.NETWORK_SEGMENTATION_SWITCH)
  const propertyManagementEnabled = useIsTierAllowed(Features.CLOUDPATH_BETA)
  const isEdgeSdLanReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_TOGGLE)
  const isEdgeSdLanHaReady = useIsEdgeFeatureReady(Features.EDGES_SD_LAN_HA_TOGGLE)
  const isEdgeHaReady = useIsEdgeFeatureReady(Features.EDGE_HA_TOGGLE)
  const isEdgeDhcpHaReady = useIsEdgeFeatureReady(Features.EDGE_DHCP_HA_TOGGLE)
  const isEdgeFirewallHaReady = useIsEdgeFeatureReady(Features.EDGE_FIREWALL_HA_TOGGLE)
  const isEdgePinReady = useIsEdgeFeatureReady(Features.EDGE_PIN_HA_TOGGLE)
  const isEdgeMdnsReady = useIsEdgeFeatureReady(Features.EDGE_MDNS_PROXY_TOGGLE)
  const isEdgeTnmServiceReady = useIsEdgeFeatureReady(Features.EDGE_THIRDPARTY_MGMT_TOGGLE)
  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  const isEdgeOltEnabled = useIsSplitOn(Features.EDGE_NOKIA_OLT_MGMT_TOGGLE)

  // eslint-disable-next-line max-len
  const [edgeCompatibilityFeature, setEdgeCompatibilityFeature] = useState<IncompatibilityFeatures | undefined>()

  const sets = [
    {
      title: $t({ defaultMessage: 'Connectivity' }),
      items: [
        { type: ServiceType.DHCP, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_DHCP,
          categories: [RadioCardCategory.EDGE],
          helpIcon: <ApCompatibilityToolTip
            title=''
            showDetailButton
            onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.DHCP)}
          />,
          disabled: !isEdgeHaReady || !isEdgeDhcpHaReady
        },
        { type: ServiceType.DPSK, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.PIN,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.SWITCH, RadioCardCategory.EDGE],
          helpIcon: <ApCompatibilityToolTip
            title=''
            showDetailButton
            onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.PIN)}
          />,
          disabled: !isEdgePinReady
        },
        {
          type: ServiceType.EDGE_SD_LAN,
          categories: [RadioCardCategory.WIFI, RadioCardCategory.EDGE],
          helpIcon: isEdgeCompatibilityEnabled
            ? <ApCompatibilityToolTip
              title={''}
              showDetailButton
              onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.SD_LAN)}
            />
            : undefined,
          disabled: !(isEdgeSdLanReady || isEdgeSdLanHaReady)
        },
        {
          type: ServiceType.EDGE_OLT,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeOltEnabled
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Security' }),
      items: [
        { type: ServiceType.EDGE_FIREWALL,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeHaReady || !isEdgeFirewallHaReady
        }
      ]
    },
    {
      title: $t({ defaultMessage: 'Application' }),
      items: [
        { type: ServiceType.MDNS_PROXY, categories: [RadioCardCategory.WIFI] },
        {
          type: ServiceType.EDGE_MDNS_PROXY,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeMdnsReady,
          helpIcon: <ApCompatibilityToolTip
            title=''
            showDetailButton
            onClick={() => setEdgeCompatibilityFeature(IncompatibilityFeatures.EDGE_MDNS_PROXY)}
          />,
          isBetaFeature: useIsBetaEnabled(TierFeatures.EDGE_MDNS_PROXY)
        },
        {
          type: ServiceType.EDGE_TNM_SERVICE,
          categories: [RadioCardCategory.EDGE],
          disabled: !isEdgeTnmServiceReady
        },
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
          disabled: !isEdgePinReady || !networkSegmentationSwitchEnabled
        },
        {
          type: ServiceType.RESIDENT_PORTAL,
          categories: [RadioCardCategory.WIFI],
          disabled: !propertyManagementEnabled
        }
      ]
    }
  ] as ServiceCardItem []

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Service Catalog' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
      />
      {sets.filter(set => isServiceCardSetEnabled(set, ServiceOperation.LIST)).map(set => {
        return <UI.CategoryContainer key={set.title}>
          <Typography.Title level={3}>
            { set.title }
          </Typography.Title>
          <GridRow>
            {set.items.filter(i => isServiceCardEnabled(i, ServiceOperation.LIST)).map(item => {
              return item.type === ServiceType.EDGE_OLT
                ? <UI.OltCardWrapper key={item.type} col={{ span: 6 }}>
                  <RadioCard
                    type={'button'}
                    buttonText={defineMessage({ defaultMessage: 'Add' })}
                    key={item.type}
                    value={item.type}
                    title={$t(serviceTypeLabelMapping[item.type])}
                    description={$t(serviceTypeDescMapping[item.type])}
                    categories={item.categories}
                  />
                </UI.OltCardWrapper>
                : <GridCol key={item.type} col={{ span: 6 }}>
                  <ServiceCard
                    key={item.type}
                    serviceType={item.type}
                    categories={item.categories}
                    type={'button'}
                    helpIcon={item.helpIcon}
                    isBetaFeature={item.isBetaFeature}
                  />
                </GridCol>
            })}

          </GridRow>
        </UI.CategoryContainer>
      })}
      {isEdgeCompatibilityEnabled && <EdgeCompatibilityDrawer
        visible={!!edgeCompatibilityFeature}
        type={EdgeCompatibilityType.ALONE}
        title={$t({ defaultMessage: 'Compatibility Requirement' })}
        featureName={edgeCompatibilityFeature}
        onClose={() => setEdgeCompatibilityFeature(undefined)}
      />}
    </>
  )
}