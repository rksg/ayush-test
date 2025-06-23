import { useIntl } from 'react-intl'

import { DetailsItemList }         from '@acx-ui/main/components'
import { useMspCustomerListQuery } from '@acx-ui/msp/services'
import { ConfigTemplate }          from '@acx-ui/rc/utils'

import { useEcFilters } from '../../utils'

export function AppliedToTenantList ({ selectedTemplate }: { selectedTemplate: ConfigTemplate }) {
  const { $t } = useIntl()
  const { appliedOnTenants } = selectedTemplate

  const mspEcTenantsPayload = {
    filters: {
      ...useEcFilters(),
      id: appliedOnTenants
    },
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
  />
}
