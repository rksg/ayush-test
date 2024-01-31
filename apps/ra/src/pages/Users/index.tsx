

import React, { useEffect, useState } from 'react'

import { Menu, Button }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'



import {
  useGetUsersQuery,
  useRefreshUserDetailsMutation,
  useDeleteUserResourceGroupMutation,
  useDeleteInvitationMutation
} from '@acx-ui/analytics/services'
import { ManagedUser }                                                       from '@acx-ui/analytics/utils'
import { PageHeader, Loader, Tooltip, showToast, showActionModal, Dropdown } from '@acx-ui/components'

import { UsersTable }           from './Table'
import { UserDrawer, UserType } from './UserDrawer'

export const messages = {
  'title': defineMessage({
    defaultMessage: '{usersCount, plural, one {User} other {Users}}'
  }),
  'info': defineMessage({
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
  }),
  'editUser': defineMessage({ defaultMessage: 'Edit User' }),
  'save': defineMessage({ defaultMessage: 'Save' }),
  'cancel': defineMessage({ defaultMessage: 'Cancel' }),
  'refreshSuccessful': defineMessage({ defaultMessage: 'Refreshed user details successfully' }),
  'refreshFailure': defineMessage({ defaultMessage: 'Refresh user details is unsuccessful' }),
  'deleteSuccessful': defineMessage({ defaultMessage: 'Deleted user details successfully' }),
  'deleteFailure': defineMessage({ defaultMessage: 'Delete user details is unsuccessful' }),
  'editUserSuccess': defineMessage({ defaultMessage: 'Updated user details successfully' }),
  'editUserFailure': defineMessage({ defaultMessage: 'Update user details is unsuccessful' }),
  'deleteModalContent': defineMessage({
    defaultMessage: 'Do you really want to remove {firstName} {lastName}?'
  }),
  'deleteModalTitle': defineMessage({ defaultMessage: 'Delete user' }),
  'admin': defineMessage({ defaultMessage: 'Admin' }),
  'report-only': defineMessage({ defaultMessage: 'Report Only' }),
  'network-admin': defineMessage({ defaultMessage: 'Network Admin' }),
  'disabledDeleteText': defineMessage({
    defaultMessage:
      // eslint-disable-next-line max-len
      'You are not allowed to delete yourself. Or, if you are an invited user, you are not allowed to delete users in the host account.'
  }),
  'disabledEditText': defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage:
      // eslint-disable-next-line max-len
      'You are not allowed to edit yourself or invited users. If you are an invited user, you are not allowed to edit users in the host account.'
  }),
  'refreshText': defineMessage({
    defaultMessage: 'Retrieve latest email, first name, {br}last name from Ruckus Support Portal.'
  }),
  'editText': defineMessage({
    defaultMessage: 'Edit'
  }),
  'deleteText': defineMessage({
    defaultMessage: 'Delete'
  })
}

const Users = () => {
  const { $t } = useIntl()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerType, setDrawerType] = useState<UserType>('edit')
  const [selectedRow, setSelectedRow] = useState<ManagedUser | null>(null)
  const [retrieveUserDetails, setRetrieveUserDetails] = useState(false)
  const [deleteUser, setDeleteUser] = useState({ deleteUser: false, showModal: false })
  const usersQuery = useGetUsersQuery()
  const [refreshUserDetails] = useRefreshUserDetailsMutation()
  const [deleteUserResourceGroup] = useDeleteUserResourceGroupMutation()
  const [deleteInvitation] = useDeleteInvitationMutation()

  const usersCount = usersQuery.data?.length || 0
  useEffect(() => {
    if (retrieveUserDetails && selectedRow) {
      refreshUserDetails({ userId: selectedRow.id })
        .then((response) => {
          usersQuery.refetch()
            .then( () => {
              const isSuccess = (response as { data: string })?.data
              showToast({
                type: isSuccess ? 'success' : 'error',
                content: $t(isSuccess ? messages.refreshSuccessful: messages.refreshFailure)
              })
            }
            )
        }).finally(() => setRetrieveUserDetails(false))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retrieveUserDetails])

  useEffect(() => {
    if(deleteUser.showModal && selectedRow){
      showActionModal({
        type: 'confirm',
        title: $t(messages.deleteModalTitle) ,
        content: $t(messages.deleteModalContent, {
          firstName: selectedRow?.firstName, lastName: selectedRow?.lastName
        }),
        onOk: () => {
          setDeleteUser({ deleteUser: true, showModal: false })
        }
      })
    }
    if (deleteUser.deleteUser && selectedRow) {
      const deleteUserAction = !(selectedRow.invitation?.state === 'pending')
        ? deleteUserResourceGroup({ userId: selectedRow.id })
        : deleteInvitation(
          { resourceGroupId: selectedRow.resourceGroupId,
            userId: selectedRow.id
          })
      deleteUserAction
        .then((response) => {
          usersQuery.refetch()
            .then(() => {
              const isSuccess = !(response as { error: string })?.error
              showToast({
                type: isSuccess ? 'success' : 'error',
                content: $t(isSuccess ? messages.deleteSuccessful: messages.deleteFailure)
              })
            }
            )
        })
        .finally(() => setDeleteUser({ showModal: false ,deleteUser: false }))
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [selectedRow,deleteUser])

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
  return (
    <Loader states={[{
      isLoading: false || usersQuery.isLoading,
      isFetching: retrieveUserDetails || deleteUser.deleteUser || usersQuery.isFetching
    }]}>
      <PageHeader
        title={
          <>
            {$t(messages.title, { usersCount })} ({usersCount})
            <Tooltip.Info
              data-html
              title={$t(messages.info, { br: <br/> })}
            />
          </>
        }
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
        getLatestUserDetails={() => setRetrieveUserDetails(true)}
        handleDeleteUser={() => setDeleteUser({ ...deleteUser, showModal: true })}
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
