import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { EdgesTable }         from '@acx-ui/rc/components'
import { TenantLink }         from '@acx-ui/react-router-dom'
import { filterByAccess }     from '@acx-ui/user'

export const OldEdgeListPage = () => {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'SmartEdge' })}
        extra={filterByAccess([
          <TenantLink to='/devices/edge/add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          </TenantLink>
        ])}
      />
      <EdgesTable
        rowSelection={{ type: 'checkbox' }}
      />
    </>
  )
}