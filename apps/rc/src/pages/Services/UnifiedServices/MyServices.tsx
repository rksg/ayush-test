import { useIntl } from 'react-intl'

import { GridCol, GridRow, PageHeader }                                                              from '@acx-ui/components'
import {
  AddProfileButton, canCreateAnyUnifiedService, canReadUnifiedService, getServiceCatalogRoutePath
} from '@acx-ui/rc/utils'

import { UnifiedServiceCard } from '../UnifiedServiceCard'

import { useUnifiedServiceListWithTotalCount } from './useUnifiedServiceListWithTotalCount'

export function MyServices () {
  const { $t } = useIntl()
  const unifiedServiceList = useUnifiedServiceListWithTotalCount()

  const resolvedUnifiedServiceList = unifiedServiceList
    .filter(service => (service.totalCount ?? 0) > 0 && canReadUnifiedService(service))

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
    <GridRow>
      {resolvedUnifiedServiceList.map(service => {
        return (
          <GridCol key={service.type} col={{ span: 6 }}>
            <UnifiedServiceCard
              key={service.type}
              unifiedService={service}
              type={'default'}
            />
          </GridCol>
        )
      })}
    </GridRow>
  </>
}
