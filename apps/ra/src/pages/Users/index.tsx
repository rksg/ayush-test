import { useState, useEffect } from 'react'

import { Menu, Button }           from 'antd'
import { defineMessage, useIntl } from 'react-intl'

import {
  useGetUsersQuery,
  useRefreshUserDetailsMutation,
  useGetTenantSettingsQuery,
  useDeleteUserResourceGroupMutation,
  useDeleteInvitationMutation
} from '@acx-ui/analytics/services'
import type { Settings, ManagedUser }                                        from '@acx-ui/analytics/utils'
import { PageHeader, Loader, showToast, showActionModal, Dropdown, Tooltip } from '@acx-ui/components'

import { ImportSSOFileDrawer }    from './ImportSSOFileDrawer'
import { UsersTable }             from './Table'
import { UserDrawer, DrawerType } from './UserDrawer'

export const messages = {
  'title': defineMessage({
    defaultMessage: '{usersCount, plural, one {User} other {Users}}'
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
  }),
  'ssoDisclaimer': defineMessage({
    defaultMessage: 'At this time, only Azure AD is officially supported'
  })

}

const isValidSSO = (settings: Partial<Settings> | undefined) => {
  if (!settings || !settings.sso) return false
  const ssoConfig = JSON.parse(settings.sso)
  return typeof ssoConfig?.metadata === 'string'
}

const Users = () => {
  const { $t } = useIntl()
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerType, setDrawerType] = useState<DrawerType>('edit')
  const [selectedRow, setSelectedRow] = useState<ManagedUser | null>(null)
  const [retrieveUserDetails, setRetrieveUserDetails] = useState(false)
  const [deleteUser, setDeleteUser] = useState({ deleteUser: false, showModal: false })
  const usersQuery = useGetUsersQuery()
  const [refreshUserDetails] = useRefreshUserDetailsMutation()
  const [deleteUserResourceGroup] = useDeleteUserResourceGroupMutation()
  const [deleteInvitation] = useDeleteInvitationMutation()

  const [visible, setVisible] = useState(false)
  const settingsQuery = useGetTenantSettingsQuery()
  const isEditMode = isValidSSO(settingsQuery.data)
  const [usersCount, setUsersCount] = useState(0)
  useEffect(() => {
    usersQuery.data && setUsersCount(usersQuery.data.length)
  }, [usersQuery.data])

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
        .finally(() => setDeleteUser({ showModal: false, deleteUser: false }))
    }
  },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [selectedRow,deleteUser])

  const addMenu = <Menu
    items={[{
      key: 'add-internal-user',
      label: <div onClick={()=> {
        setDrawerType('addInternal')
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
        title={<>{$t(messages.title, { usersCount })} ({usersCount})</>}
        extra={[
          <Loader states={[settingsQuery]}><Tooltip
            title={$t(messages.ssoDisclaimer)}
            placement='left'>
            <Button
              type={isEditMode ? 'primary' : 'default'}
              onClick={() => setVisible(true)}>
              {isEditMode
                ? $t({ defaultMessage: 'Configure SSO' })
                : $t({ defaultMessage: 'Setup SSO' })}
            </Button>
          </Tooltip></Loader>,
          <Dropdown overlay={addMenu} placement={'bottomRight'}>{() =>
            <Button type='primary'>{ $t({ defaultMessage: 'Add User...' }) }</Button>
          }</Dropdown>]}
      />
      <UsersTable
        data={usersQuery.data}
        toggleDrawer={setOpenDrawer}
        setSelectedRow={setSelectedRow}
        getLatestUserDetails={() => setRetrieveUserDetails(true)}
        handleDeleteUser={() => setDeleteUser({ ...deleteUser, showModal: true })}
        setUsersCount={setUsersCount}
        setDrawerType={setDrawerType}
      />
      <UserDrawer
        opened={openDrawer}
        toggleDrawer={setOpenDrawer}
        type={drawerType}
        selectedRow={selectedRow}
      />
      <ImportSSOFileDrawer
        title={isEditMode
          ? $t({ defaultMessage: 'Configure SSO with 3rd Party Provider' })
          : $t({ defaultMessage: 'Set Up SSO with 3rd Party Provider' })}
        visible={visible}
        isEditMode={isEditMode}
        setVisible={setVisible}
      />
    </Loader>
  )
}

export default Users
