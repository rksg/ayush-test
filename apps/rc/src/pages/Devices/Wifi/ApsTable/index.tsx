import { useIntl } from 'react-intl'

import {
  Button,
  PageHeader
} from '@acx-ui/components'
import { ApTable }    from '@acx-ui/rc/components'
import { TenantLink } from '@acx-ui/react-router-dom'

export default function ApsTable () {
  const { $t } = useIntl()

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'WiFi' })}
        extra={[
          <TenantLink to='/devices/aps/add' key='add'>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          </TenantLink>
        ]}
      />
      <ApTable
        rowSelection={{
          type: 'checkbox'
        }}
      />
    </>
  )
}
