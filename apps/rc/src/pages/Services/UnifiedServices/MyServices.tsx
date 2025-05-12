import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, Loader, PageHeader }                              from '@acx-ui/components'
import {
  AddProfileButton, canCreateAnyUnifiedService, getServiceCatalogRoutePath
} from '@acx-ui/rc/utils'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { ServiceSortOrder, ServicesToolBar }   from './ServicesToolBar'
import { useUnifiedServiceListWithTotalCount } from './useUnifiedServiceListWithTotalCount'
import { useUnifiedServiceSearchFilter }       from './useUnifiedServiceSearchFilter'

export function MyServices () {
  const { $t } = useIntl()
  const {
    unifiedServiceListWithTotalCount: rawUnifiedServiceList,
    isFetching
  } = useUnifiedServiceListWithTotalCount()
  const defaultSortOrder = ServiceSortOrder.ASC

  const {
    setSearchTerm, setFilters, setSortOrder, filteredServices
  } = useUnifiedServiceSearchFilter(rawUnifiedServiceList, defaultSortOrder)

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
        defaultSortOrder={defaultSortOrder}
        setSortOrder={setSortOrder}
      />
      <Loader states={[{ isLoading: isFetching }]}>
        <GridRow>
          {filteredServices.map(service => (
            <GridCol key={service.type} col={{ span: 6 }}>
              <UnifiedServiceCard
                key={service.type}
                unifiedService={service}
                type={'default'}
              />
            </GridCol>
          ))}
        </GridRow>
      </Loader>
    </Space>
  </>
}
