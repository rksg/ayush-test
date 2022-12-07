import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Dropdown,
  PageHeader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { ApTable }                from '@acx-ui/rc/components'
import { TenantLink }             from '@acx-ui/react-router-dom'
import { notAvailableMsg }        from '@acx-ui/utils'

export default function ApsTable () {
  const { $t } = useIntl()
  const addMenu = <Menu
    items={[{
      key: 'ap',
      label: <TenantLink to='devices/aps/add'>{$t({ defaultMessage: 'AP' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: <TenantLink to='TODO'>{$t({ defaultMessage: 'Import from file' })}</TenantLink>,
      title: $t(notAvailableMsg),
      disabled: !useIsSplitOn(Features.DEVICES)
    }, {
      key: 'ap-group',
      label: <TenantLink to='devices/apgroups/add'>
        {$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'WiFi' })}
        extra={[
          <Dropdown overlay={addMenu} key='addMenu'>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          }</Dropdown>
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
