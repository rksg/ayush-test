
import { useState } from 'react'

import { Menu, Button }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery }             from '@acx-ui/analytics/services'
import { ManagedUser }                  from '@acx-ui/analytics/utils'
import { Loader, PageHeader, Dropdown } from '@acx-ui/components'

import { UsersTable }           from './Table'
import { UserDrawer, UserType } from './UserDrawer'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

export default function Users () {
  const { $t } = useIntl()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerType, setDrawerType] = useState<UserType>('edit')
  const [selectedRow, setSelectedRow] = useState<ManagedUser | null>(null)

  const usersQuery = useGetUsersQuery()
  const { data } = usersQuery

  const usersCount = data?.length || 0
  const addMenu = <Menu
    items={[{
      key: 'add-internal-user',
      label: <div onClick={()=> {
        setDrawerType('create')
        setOpenDrawer(!openDrawer)}
      }>
        {$t({ defaultMessage: 'Internal' })}</div>
    }, {
      key: 'third-party-user',
      label: <div onClick={()=> {
        setDrawerType('invite3rdParty')
        setOpenDrawer(!openDrawer)}
      }>
        {$t({ defaultMessage: '3rd Party' })}</div>
    }]
    }
  />
  return <Loader states={[usersQuery]}>
    <PageHeader
      title={<>{$t(title,{ usersCount })} ({usersCount})</>}
      extra={[
        <Dropdown overlay={addMenu} placement={'bottomRight'}>{() =>
          <Button type='primary'>{ $t({ defaultMessage: 'Add User...' }) }</Button>
        }</Dropdown>
      ]}
    />
    <UsersTable
      data={usersQuery.data}
      toggleDrawer={setOpenDrawer}
      setSelectedRow={setSelectedRow}
      setDrawerType={setDrawerType}
    />
    <UserDrawer
      opened={openDrawer}
      toggleDrawer={setOpenDrawer}
      type={drawerType}
      selectedRow={selectedRow}
    />
  </Loader>
}
