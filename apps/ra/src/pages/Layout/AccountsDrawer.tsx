import { useState } from 'react'

import { useIntl } from 'react-intl'

import { defaultSort, sortProp, Tenant, UserProfile } from '@acx-ui/analytics/utils'
import { LayoutUI as UI, Drawer, Table, TableProps }  from '@acx-ui/components'
import { CaretDownSolid, HomeSolid }                  from '@acx-ui/icons'
import { Link, useTenantLink }                        from '@acx-ui/react-router-dom'

type Invitation = {
  accountName: string
  role: string
  type: string
}
// AccountCircleSolid
export function AccountsDrawer ({ user }: { user: UserProfile }) {
  const { accountId, selectedTenant, tenants, invitations } = user
  console.log(invitations, tenants)
  const { $t } = useIntl()
  const roles = {
    'admin': $t({ defaultMessage: 'Admin' }),
    'network-admin': $t({ defaultMessage: 'Network Admin' }),
    'report-only': $t({ defaultMessage: 'Report Only' })
  }
  const [visible, setVisible] = useState(false)
  const basePath = useTenantLink('')
  const columns: TableProps<Tenant>['columns'] = [
    {
      width: 200,
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('name', defaultSort) },
      render: (_, { name, id }) => <>
        {accountId === id ? <HomeSolid height={16} viewBox='0 -4 24 24' /> : ''}
        <Link
          onClick={() => setVisible(false)}
          to={{ ...basePath, search: `?selectedTenants=${window.btoa(JSON.stringify([id]))}` }}
          children={name}
        />
      </>
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      sorter: { compare: sortProp('role', defaultSort) },
      render: (_, { role }) => roles[role],
      searchable: true,
      dataIndex: 'role',
      key: 'role'
    }
  ]
  return <UI.CompanyNameDropdown>
    <UI.CompanyName onClick={()=>setVisible(!visible)}>{selectedTenant.name}</UI.CompanyName>
    <UI.DropdownCaretIcon children={<CaretDownSolid />}/>
    <Drawer
      width={500}
      title={$t({ defaultMessage: 'Accounts' })}
      visible={visible}
      onClose={() => setVisible(false)}
    >
      <div><b>Invitations</b>
        {(invitations as unknown as Invitation[]).map(({ accountName, role, type } : Invitation) => (type === 'tenant'
          ? <div>You have been invited to {accountName} as {role}. Please <a href='#'> accept</a> or <a href='#'> reject</a> the invitation</div>
          : <div>You have <a href='#'>pending brand invitation(s)</a></div>
        ))}
      </div>
      <Table<Tenant>
        settingsId='rai-tenant-table'
        columns={columns}
        dataSource={tenants}
        rowKey='id'
        rowClassName={({ id }) => selectedTenant.id === id ? 'ant-table-row-selected' : ''}
      />
    </Drawer>
  </UI.CompanyNameDropdown>
}
