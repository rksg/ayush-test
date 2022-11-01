import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Dropdown, PageHeader } from '@acx-ui/components'
// import { ApTable } from '../../../../components/ApTable'
import { TenantLink } from '@acx-ui/react-router-dom'

export function ApsTable () {
  const { $t } = useIntl()
  const addMenu = <Menu
    items={[{
      key: 'ap',
      label: <TenantLink to='devices/aps/add'>{$t({ defaultMessage: 'AP' })}</TenantLink>
    }, {
      key: 'import-from-file',
      label: <TenantLink to='TBD'>{$t({ defaultMessage: 'Import from file' })}</TenantLink>
    }, {
      key: 'ap-group',
      label: <TenantLink to='TBD'>{$t({ defaultMessage: 'AP Group' })}</TenantLink> }
    ]}
  />

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'WiFi' })}
        extra={[
          <Dropdown overlay={addMenu}>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add' }) }</Button>
          }</Dropdown>
        ]}
      />
      {/* TODO:  */}
      {/* <ApTable
        rowSelection={{
          type: 'checkbox',
          ...rowSelection(useIntl())
        }}
      /> */}
    </>
  )
}
