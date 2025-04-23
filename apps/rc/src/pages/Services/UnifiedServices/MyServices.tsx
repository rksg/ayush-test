import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader }                                       from '@acx-ui/components'
import {
  AddProfileButton, canCreateAnyUnifiedService, getServiceCatalogRoutePath
} from '@acx-ui/rc/utils'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { ServiceSortOrder, ServicesToolBar }   from './ServicesToolBar'
import { useFilteredUnifiedServices }          from './useFilteredUnifiedServices'
import { useUnifiedServiceListWithTotalCount } from './useUnifiedServiceListWithTotalCount'

export function MyServices () {
  const { $t } = useIntl()
  const rawUnifiedServiceList = useUnifiedServiceListWithTotalCount()
  const defaultSortOrder = ServiceSortOrder.ASC

  const {
    setSearchTerm, setFilters, setSortOrder, unifiedServices
  } = useFilteredUnifiedServices(rawUnifiedServiceList, defaultSortOrder)

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
      <GridRow>
        {unifiedServices.map(service => (
          <GridCol key={service.type} col={{ span: 6 }}>
            <UnifiedServiceCard
              key={service.type}
              unifiedService={service}
              type={'default'}
            />
          </GridCol>
        ))}
      </GridRow>
    </Space>
  </>
}
