
import { useState } from 'react'

import { Menu, Button }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import { useGetUsersQuery }                      from '@acx-ui/analytics/services'
import { ManagedUser }                           from '@acx-ui/analytics/utils'
import { Loader, PageHeader, Tooltip, Dropdown } from '@acx-ui/components'

import { UsersTable } from './Table'
import { UserDrawer } from './UserDrawer'

const title = defineMessage({
  defaultMessage: '{usersCount, plural, one {User} other {Users}}'
})

const info = defineMessage({
  defaultMessage: `"Invite 3rd Party" allows you to invite a user who does not
  belong to your organisation into this RUCKUS AI account.
  {br}
  {br}
  "Add Internal User" allows you to include a user who belongs to your
  organisation into this RUCKUS AI account.
  {br}
  {br}
  In all cases, please note that the invitee needs to have an existing
  Ruckus Support account.`
})

export default function Users () {
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
      label: <div onClick={()=> {
        setDrawerType('create')
        setOpenDrawer(!openDrawer)}
      }>
        {$t({ defaultMessage: 'Internal' })}</div>
    }, {
      key: 'third-party-user',
      label: <div onClick={()=> {
        setDrawerType('create')
        setOpenDrawer(!openDrawer)}
      }>
        {$t({ defaultMessage: '3rd Party' })}</div>
    }]
    }
  />
  return <Loader states={[usersQuery]}>
    <PageHeader
      title={<>
        {$t(title,{ usersCount })} ({usersCount})
        <Tooltip.Info
          data-html
          title={$t(info, { br: <br/> })} />
      </>}
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
