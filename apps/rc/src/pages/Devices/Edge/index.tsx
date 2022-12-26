import { useIntl } from 'react-intl'

import { Button, PageHeader }     from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { EdgesTable }             from '@acx-ui/rc/components'
import { TenantLink }             from '@acx-ui/react-router-dom'


const Edges = () => {
  const { $t } = useIntl()
  const isEdgesEnable = useIsSplitOn(Features.EDGES)

  if (!isEdgesEnable) {
    return <span>{ $t({ defaultMessage: 'Edges is not enabled' }) }</span>
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'SmartEdge' })}
        extra={
          <TenantLink to='/devices/edge/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          </TenantLink>
        }
      />
      <EdgesTable
        rowSelection={{ type: 'checkbox' }}
      />
    </>
  )
}

export default Edges