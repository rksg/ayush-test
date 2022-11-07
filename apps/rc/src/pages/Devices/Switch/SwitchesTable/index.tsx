import { useIntl } from 'react-intl'

import { Button, PageHeader } from '@acx-ui/components'
import { TenantLink }         from '@acx-ui/react-router-dom'

export default function SwitchesTable () {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Switch' })}
        extra={[
          <TenantLink to='/devices/switches/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          </TenantLink>
        ]}
      />
      {/* TODO: Switch list */}
    </>
  )
}


