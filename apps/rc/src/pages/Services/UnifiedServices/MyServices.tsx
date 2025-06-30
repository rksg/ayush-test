import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import { Button, GridCol, GridRow, PageHeader } from '@acx-ui/components'
import {
  canCreateAnyUnifiedService,
  collectAvailableProductsAndCategories,
  filterByAccessForServicePolicyMutation,
  getServiceCatalogRoutePath
} from '@acx-ui/rc/utils'
import { TenantLink }     from '@acx-ui/react-router-dom'
import { getUserProfile } from '@acx-ui/user'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { ServiceSortOrder, ServicesToolBar }   from './ServicesToolBar'
import { SkeletonLoaderCard }                  from './SkeletonLoaderCard'
import { useUnifiedServiceListWithTotalCount } from './useUnifiedServiceListWithTotalCount'
import { useUnifiedServiceSearchFilter }       from './useUnifiedServiceSearchFilter'

export function MyServices () {
  const { $t } = useIntl()
  const defaultSortOrder = ServiceSortOrder.ASC

  const {
    unifiedServiceListWithTotalCount: rawUnifiedServiceList,
    isFetching
  } = useUnifiedServiceListWithTotalCount()

  const { products, categories } = collectAvailableProductsAndCategories(rawUnifiedServiceList)

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
        availableFilters={{ products, categories }}
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


interface AddProfileButtonProps {
  targetPath: string
  linkText: string
  hasSomeProfilesPermission: () => boolean
}

export function AddProfileButton (props: AddProfileButtonProps) {
  const { targetPath, linkText, hasSomeProfilesPermission } = props

  const AddButton = <TenantLink to={targetPath}>
    <Button type='primary'>{linkText}</Button>
  </TenantLink>

  if (getUserProfile().rbacOpsApiEnabled) {
    return hasSomeProfilesPermission() ? AddButton : null
  }
  return filterByAccessForServicePolicyMutation([AddButton])[0]
}
