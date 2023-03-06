import { useIntl } from 'react-intl'

import { Button, PageHeader }     from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { hasAccesses }            from '@acx-ui/user'
import { EdgesTable }             from '@acx-ui/rc/components'
import { TenantLink }             from '@acx-ui/react-router-dom'


const Edges = () => {
  const { $t } = useIntl()
  const earlyBetaEnabled = useIsSplitOn(Features.EDGE_EARLY_BETA)
  const isEdgeEnabled = useIsSplitOn(Features.EDGES) || earlyBetaEnabled

  if (!isEdgeEnabled) {
    return <span>{ $t({ defaultMessage: 'SmartEdge is not enabled' }) }</span>
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'SmartEdge' })}
        extra={hasAccesses([
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
