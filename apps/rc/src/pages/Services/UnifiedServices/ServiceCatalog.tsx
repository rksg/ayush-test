import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader }                                                                                from '@acx-ui/components'
import { ApCompatibilityToolTip, EdgeCompatibilityDrawer, EdgeCompatibilityType, useIsWifiCallingProfileLimitReached } from '@acx-ui/rc/components'
import {
  collectAvailableProductsAndCategories, IncompatibilityFeatures,
  PolicyType, ServiceType, UnifiedServiceType,
  useAvailableUnifiedServicesList
} from '@acx-ui/rc/utils'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { ServicesToolBar }                                             from './ServicesToolBar'
import { getDefaultSearchFilterValues, useUnifiedServiceSearchFilter } from './useUnifiedServiceSearchFilter'

const edgeServicesHelpIconMap: Partial<Record<UnifiedServiceType, IncompatibilityFeatures>> = {
  [ServiceType.EDGE_DHCP]: IncompatibilityFeatures.DHCP,
  [ServiceType.PIN]: IncompatibilityFeatures.PIN,
  [ServiceType.EDGE_MDNS_PROXY]: IncompatibilityFeatures.EDGE_MDNS_PROXY,
  [ServiceType.EDGE_SD_LAN]: IncompatibilityFeatures.SD_LAN,
  [PolicyType.TUNNEL_PROFILE]: IncompatibilityFeatures.TUNNEL_PROFILE,
  [PolicyType.HQOS_BANDWIDTH]: IncompatibilityFeatures.HQOS
}

const serviceCatalogSettingsId = 'service-catalog'

export function ServiceCatalog () {
  const { $t } = useIntl()
  const rawUnifiedServiceList = useAvailableUnifiedServicesList()
  const { products, categories } = collectAvailableProductsAndCategories(rawUnifiedServiceList)

  // The function passed to useState will only run once on the initial render.
  // This ensures getDefaultSearchFilterValues is called only once for initialization and not on every render.
  // eslint-disable-next-line max-len
  const [defaultSearchFilterValues] = useState(() => getDefaultSearchFilterValues(serviceCatalogSettingsId))

  const {
    setSearchTerm, setFilters, setSortOrder, filteredServices
  // eslint-disable-next-line max-len
  } = useUnifiedServiceSearchFilter(rawUnifiedServiceList, defaultSearchFilterValues, serviceCatalogSettingsId)

  const [
    edgeCompatibilityFeature,
    setEdgeCompatibilityFeature
  ] = useState<IncompatibilityFeatures | undefined>()

  const { isLimitReached: isWifiCallingLimitReached } = useIsWifiCallingProfileLimitReached()

  const buildHelpIcon = (type: UnifiedServiceType): React.ReactNode | null => {
    const edgeIncompatibilityType = edgeServicesHelpIconMap[type]
    if (edgeIncompatibilityType) {
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
      title={$t({ defaultMessage: 'Service Catalog' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
    />
    <Space direction='vertical' size='large'>
      <ServicesToolBar
        setSearchTerm={setSearchTerm}
        setFilters={setFilters}
        setSortOrder={setSortOrder}
        defaultValues={defaultSearchFilterValues}
        availableFilters={{ products, categories }}
      />
      <GridRow>
        {filteredServices.map(service => (
          <GridCol key={service.type} col={{ span: 6 }}>
            <UnifiedServiceCard
              key={service.type}
              unifiedService={service}
              type={'button'}
              helpIcon={buildHelpIcon(service.type)}
              isLimitReached={
                service.type === ServiceType.WIFI_CALLING && isWifiCallingLimitReached
              }
            />
          </GridCol>
        ))}
      </GridRow>
    </Space>
    <EdgeCompatibilityDrawer
      visible={!!edgeCompatibilityFeature}
      type={EdgeCompatibilityType.ALONE}
      title={$t({ defaultMessage: 'Compatibility Requirement' })}
      featureName={edgeCompatibilityFeature}
      onClose={() => setEdgeCompatibilityFeature(undefined)}
    />
  </>
}
