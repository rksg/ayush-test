import { useState } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader }                               from '@acx-ui/components'
import {
  AddProfileButton, canCreateAnyUnifiedService,
  collectAvailableProductsAndCategories, getServiceCatalogRoutePath
} from '@acx-ui/rc/utils'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { ServicesToolBar }                                             from './ServicesToolBar'
import { SkeletonLoaderCard }                                          from './SkeletonLoaderCard'
import { useUnifiedServiceListWithTotalCount }                         from './useUnifiedServiceListWithTotalCount'
import { getDefaultSearchFilterValues, useUnifiedServiceSearchFilter } from './useUnifiedServiceSearchFilter'

const myServicesSettingsId = 'my-services'

export function MyServices () {
  const { $t } = useIntl()
  const {
    unifiedServiceListWithTotalCount: rawUnifiedServiceList,
    isFetching
  } = useUnifiedServiceListWithTotalCount()

  const { products, categories } = collectAvailableProductsAndCategories(rawUnifiedServiceList)

  // The function passed to useState will only run once on the initial render.
  // This ensures getDefaultSearchFilterValues is called only once for initialization and not on every render.
  // eslint-disable-next-line max-len
  const [defaultSearchFilterValues] = useState(() => getDefaultSearchFilterValues(myServicesSettingsId))

  const {
    setSearchTerm, setFilters, setSortOrder, filteredServices
    // eslint-disable-next-line max-len
  } = useUnifiedServiceSearchFilter(rawUnifiedServiceList, defaultSearchFilterValues, myServicesSettingsId)

  return <>
    <PageHeader
      title={$t({ defaultMessage: 'My Services' })}
      breadcrumb={[{ text: $t({ defaultMessage: 'Network Control' }) }]}
      extra={<AddProfileButton
        hasSomeProfilesPermission={() => canCreateAnyUnifiedService()}
        linkText={$t({ defaultMessage: 'Add Service' })}
        targetPath={getServiceCatalogRoutePath()}
      />}
    />
    <Space direction='vertical' size='large'>
      <ServicesToolBar
        setSearchTerm={setSearchTerm}
        setFilters={setFilters}
        setSortOrder={setSortOrder}
        availableFilters={{ products, categories }}
        defaultValues={defaultSearchFilterValues}
      />
      {isFetching
        ? <SkeletonLoaderCard />
        : <GridRow>
          {filteredServices.map(service => (
            <GridCol key={service.type} col={{ span: 6 }}>
              <UnifiedServiceCard
                key={service.type}
                unifiedService={service}
                type={'default'}
              />
            </GridCol>
          ))}
        </GridRow>}
    </Space>
  </>
}
