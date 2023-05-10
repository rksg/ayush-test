import { useIntl } from 'react-intl'

import { PageHeader, Button } from '@acx-ui/components'
import { TenantLink }         from '@acx-ui/react-router-dom'

import { ServiceGuardTable } from './ServiceGuardTable'

function ServiceGuardList () {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Network Health' })}
        extra={[
          <TenantLink to='/analytics/serviceValidation/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Create Test' }) }</Button>
          </TenantLink>
        ]}
      />
      <ServiceGuardTable />
    </>
  )
}

export default ServiceGuardList
