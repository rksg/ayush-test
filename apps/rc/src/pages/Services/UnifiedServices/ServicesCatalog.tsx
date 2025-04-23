import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader }                                                                                                 from '@acx-ui/components'
import { Features }                                                                                                                     from '@acx-ui/feature-toggle'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType }                                                       from '@acx-ui/rc/components'
import { IncompatibilityFeatures, PolicyType, ServiceType, UnifiedServiceType, useAvailableUnifiedServicesList, useIsEdgeFeatureReady } from '@acx-ui/rc/utils'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { ServiceSortOrder, ServicesToolBar } from './ServicesToolBar'
import { useUnifiedServiceSearchFilter }     from './useUnifiedServiceSearchFilter'

const edgeServicesHelpIconMap: Partial<Record<UnifiedServiceType, IncompatibilityFeatures>> = {
  [ServiceType.EDGE_DHCP]: IncompatibilityFeatures.DHCP,
  [ServiceType.PIN]: IncompatibilityFeatures.PIN,
  [ServiceType.EDGE_MDNS_PROXY]: IncompatibilityFeatures.EDGE_MDNS_PROXY,
  [ServiceType.EDGE_SD_LAN]: IncompatibilityFeatures.SD_LAN,
  [PolicyType.TUNNEL_PROFILE]: IncompatibilityFeatures.TUNNEL_PROFILE,
  [PolicyType.HQOS_BANDWIDTH]: IncompatibilityFeatures.HQOS
}

export function ServicesCatalog () {
  const { $t } = useIntl()
  const rawUnifiedServiceList = useAvailableUnifiedServicesList()
  const defaultSortOrder = ServiceSortOrder.ASC

  const {
    setSearchTerm, setFilters, setSortOrder, filteredServices
  } = useUnifiedServiceSearchFilter(rawUnifiedServiceList, defaultSortOrder)

  const isEdgeCompatibilityEnabled = useIsEdgeFeatureReady(Features.EDGE_COMPATIBILITY_CHECK_TOGGLE)
  // eslint-disable-next-line max-len
  const [ edgeCompatibilityFeature, setEdgeCompatibilityFeature ] = useState<IncompatibilityFeatures | undefined>()

  const buildHelpIcon = (type: UnifiedServiceType): React.ReactNode | null => {
    const edgeIncompatibilityType = edgeServicesHelpIconMap[type]
    if (isEdgeCompatibilityEnabled && edgeIncompatibilityType) {
      return <ApCompatibilityToolTip
        title={''}
        showDetailButton
        onClick={() => setEdgeCompatibilityFeature(edgeIncompatibilityType)}
      />
    }

    return null
  }

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'Services Catalog' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
    />
    <Space direction='vertical' size='large'>
      <ServicesToolBar
        setSearchTerm={setSearchTerm}
        setFilters={setFilters}
        defaultSortOrder={defaultSortOrder}
        setSortOrder={setSortOrder}
      />
      <GridRow>
        {filteredServices.map(service => (
          <GridCol key={service.type} col={{ span: 6 }}>
            <UnifiedServiceCard
              key={service.type}
              unifiedService={service}
              type={'button'}
              helpIcon={buildHelpIcon(service.type)}
            />
          </GridCol>
        ))}
      </GridRow>
    </Space>
    {isEdgeCompatibilityEnabled && <EdgeCompatibilityDrawer
      visible={!!edgeCompatibilityFeature}
      type={EdgeCompatibilityType.ALONE}
      title={$t({ defaultMessage: 'Compatibility Requirement' })}
      featureName={edgeCompatibilityFeature}
      onClose={() => setEdgeCompatibilityFeature(undefined)}
    />}
  </>
}
