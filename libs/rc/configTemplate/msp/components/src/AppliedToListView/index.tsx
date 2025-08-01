import { useIntl } from 'react-intl'

import { DetailsItemList, useConfigTemplateListContext } from '@acx-ui/main/components'
import { useMspCustomerListQuery }                       from '@acx-ui/msp/services'
import { ConfigTemplate }                                from '@acx-ui/rc/utils'

import { useEcFilters } from '../utils'

export function AppliedToTenantList ({ selectedTemplate }: { selectedTemplate: ConfigTemplate }) {
  const { $t } = useIntl()
  const { appliedOnTenants } = selectedTemplate
  const { setAppliedToViewVisible } = useConfigTemplateListContext()
  const maxItemsToShow = 25

  const mspEcTenantsPayload = {
    filters: {
      ...useEcFilters(),
      id: appliedOnTenants
    },
    page: 1,
    pageSize: maxItemsToShow,
    sortField: 'name',
    sortOrder: 'ASC',
    fields: ['id', 'name']
  }

  const { data, isLoading } = useMspCustomerListQuery(
    { params: {}, payload: mspEcTenantsPayload },
    { skip: !appliedOnTenants?.length }
  )

  return <DetailsItemList
    title={$t({ defaultMessage: 'Applied to' })}
    items={data?.data.map(mspEcTenant => mspEcTenant.name) || []}
    isLoading={isLoading}
    showMore={(data?.totalCount ?? 0) > maxItemsToShow}
    showMoreCallback={() => setAppliedToViewVisible(true)}
  />
}
