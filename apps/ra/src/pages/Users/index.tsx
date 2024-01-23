
import React, { useState } from 'react'

import { Menu, Button }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery }               from '@acx-ui/analytics/services'
import { ManagedUser }                    from '@acx-ui/analytics/utils'
import {  PageHeader, Loader, Dropdown  } from '@acx-ui/components'

import { UsersTable } from './Table'
import { UserDrawer } from './UserDrawer'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

const Users: React.FC = () => {
  const { $t } = useIntl()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerType, setDrawerType] = useState<'edit' | 'create'>('edit')
  const [selectedRow, setSelectedRow] = useState<ManagedUser | null>(null)

  const usersQuery = useGetUsersQuery()
  const { data } = usersQuery

  const usersCount = data?.length || 0
  const addMenu = <Menu
    items={[{
      key: 'add-internal-user',
      label: <span onClick={()=> {
        setDrawerType('create')
        setOpenDrawer(!openDrawer)}
      }>
        {$t({ defaultMessage: 'Internal' })}</span>
    }]
    }
  />

  return (
    <Loader states={[usersQuery]}>
      <PageHeader
        title={<>{$t(title, { usersCount })} ({usersCount})</>}
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
  )
}

export default Users
