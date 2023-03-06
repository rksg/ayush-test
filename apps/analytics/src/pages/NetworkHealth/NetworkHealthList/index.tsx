import { useIntl } from 'react-intl'

import { PageHeader, Button } from '@acx-ui/components'
import { TenantLink }         from '@acx-ui/react-router-dom'

import { NetworkHealthTable } from './NetworkHealthTable'

function NetworkHealthList () {
  const { $t } = useIntl()
  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Network Health' })}
        extra={[
          <TenantLink to='/serviceValidation/networkHealth/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Create Test' }) }</Button>
          </TenantLink>
        ]}
      />
      <NetworkHealthTable />
    </>
  )
}

export default NetworkHealthList
