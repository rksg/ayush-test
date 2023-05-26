import { useIntl } from 'react-intl'

import { Button, PageHeader }         from '@acx-ui/components'
import { Features, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { EdgesTable }                 from '@acx-ui/rc/components'
import { TenantLink }                 from '@acx-ui/react-router-dom'
import { filterByAccess }             from '@acx-ui/user'


const Edges = () => {
  const { $t } = useIntl()
  const isEdgeEnabled = useIsTierAllowed(Features.EDGES)

  if (!isEdgeEnabled) {
    return <span>{ $t({ defaultMessage: 'SmartEdge is not enabled' }) }</span>
  }

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

export default Edges
