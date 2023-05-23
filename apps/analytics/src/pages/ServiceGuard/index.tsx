import { defineMessage, useIntl } from 'react-intl'

import { PageHeader, Button }     from '@acx-ui/components'
import { useIsSplitOn, Features } from '@acx-ui/feature-toggle'
import { TenantLink }             from '@acx-ui/react-router-dom'

import { ServiceGuardTable }            from './ServiceGuardTable'
import { useAllServiceGuardSpecsQuery } from './services'

export function useServiceGuard () {
  const { $t } = useIntl()
  const isNavbarEnhancement = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)
  const queryResults = useAllServiceGuardSpecsQuery()
  const title = defineMessage({
    defaultMessage: 'Service Validation {count, select, null {} other {({count})}}'
  })

  const extra = [
    <TenantLink to='/analytics/serviceValidation/add' key='add'>
      <Button type='primary'>{ $t({ defaultMessage: 'Create Test' }) }</Button>
    </TenantLink>
  ]

  const component = <>
    {!isNavbarEnhancement && <PageHeader
      title={$t(title, { count: null })}
      extra={extra}
    />}
    <ServiceGuardTable />
  </>

  return {
    title: $t(title, { count: queryResults.data?.length || 0 }),
    headerExtra: extra,
    component
  }
}
