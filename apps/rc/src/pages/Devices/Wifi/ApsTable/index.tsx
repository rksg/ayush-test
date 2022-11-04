import { Menu }    from 'antd'
import { useIntl } from 'react-intl'

import { Button, Dropdown, PageHeader } from '@acx-ui/components'
// import { ApTable } from '../../../../components/ApTable'
import { TenantLink } from '@acx-ui/react-router-dom'

export const addMenu = <Menu
  items={[
    { key: 'ap', label: <TenantLink to='devices/aps/add'>AP</TenantLink> },
    { key: 'import-from-file', label: <TenantLink to='TBD'>Import from file</TenantLink> },
    { key: 'ap-group', label: <TenantLink to='TBD'>AP Group</TenantLink> }
  ]}
/>

export default function ApsTable () {
  const { $t } = useIntl()

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
