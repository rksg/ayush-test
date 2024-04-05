import { useState, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import {
  useGetUsersQuery,
  useRefreshUserDetailsMutation,
  useGetTenantSettingsQuery,
  useDeleteUserResourceGroupMutation,
  useDeleteInvitationMutation
} from '@acx-ui/analytics/services'
import type { Settings, ManagedUser }         from '@acx-ui/analytics/utils'
import { Loader, showToast, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'

import { ImportSSOFileDrawer }    from './ImportSSOFileDrawer'
import { UsersTable }             from './Table'
import { UserDrawer, DrawerType } from './UserDrawer'

export const messages = {
  title: defineMessage({
    defaultMessage: '{usersCount, plural, one {User} other {Users}}'
  }),
  editUser: defineMessage({ defaultMessage: 'Edit User' }),
  save: defineMessage({ defaultMessage: 'Save' }),
  cancel: defineMessage({ defaultMessage: 'Cancel' }),
  refreshSuccessful: defineMessage({ defaultMessage: 'Refreshed user details successfully' }),
  refreshFailure: defineMessage({ defaultMessage: 'Refresh user details is unsuccessful' }),
  deleteSuccessful: defineMessage({ defaultMessage: 'Deleted user details successfully' }),
  deleteFailure: defineMessage({ defaultMessage: 'Delete user details is unsuccessful' }),
  editUserSuccess: defineMessage({ defaultMessage: 'Updated user details successfully' }),
  editUserFailure: defineMessage({ defaultMessage: 'Update user details is unsuccessful' }),
  deleteModalContent: defineMessage({
    defaultMessage: 'Do you really want to remove {firstName} {lastName}?'
  }),
  deleteModalTitle: defineMessage({ defaultMessage: 'Delete user' }),
  disabledDeleteText: defineMessage({
    defaultMessage:
      // eslint-disable-next-line max-len
      'You are not allowed to delete yourself. Or, if you are an invited user, you are not allowed to delete users in the host account.'
  }),
  disabledEditText: defineMessage({
    // eslint-disable-next-line max-len
    defaultMessage:
      // eslint-disable-next-line max-len
      'You are not allowed to edit yourself or invited users. If you are an invited user, you are not allowed to edit users in the host account.'
  }),
  refreshText: defineMessage({
    defaultMessage: 'Retrieve latest email, first name, {br}last name from Ruckus Support Portal.'
  }),
  editText: defineMessage({
    defaultMessage: 'Edit'
  }),
  deleteText: defineMessage({
    defaultMessage: 'Delete'
  }),
  ssoDisclaimer: defineMessage({
    defaultMessage: 'At this time, only Azure AD is officially supported'
  })
}

interface SSOValue {
  type: 'saml2'
  metadata: string
  fileName: string
}

const getSSOsettings = (settings: Partial<Settings> | undefined): SSOValue | null => {
  if (!settings || !settings.sso) return null
  return JSON.parse(settings.sso)
}

const Users = () => {
  const { $t } = useIntl()
  const isUsersPageEnabled = useIsSplitOn(Features.RUCKUS_AI_USERS_TOGGLE)
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
  const ssoConfig = getSSOsettings(settingsQuery.data)
  const isEditMode = typeof ssoConfig?.metadata === 'string'

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

  return (
    <Loader states={[{
      isLoading: false || usersQuery.isLoading,
      isFetching: retrieveUserDetails || deleteUser.deleteUser || usersQuery.isFetching
    }]}>
      <UsersTable
        data={usersQuery.data}
        toggleDrawer={setOpenDrawer}
        selectedRow={selectedRow}
        setSelectedRow={setSelectedRow}
        getLatestUserDetails={() => setRetrieveUserDetails(true)}
        handleDeleteUser={() => setDeleteUser({ ...deleteUser, showModal: true })}
        setDrawerType={setDrawerType}
        setOpenDrawer={setOpenDrawer}
        openDrawer={openDrawer}
        isUsersPageEnabled={isUsersPageEnabled}
        isEditMode={isEditMode}
        setVisible={setVisible}
        deleteUser={deleteUser}
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
        samlFileName={ssoConfig?.fileName}
      />
    </Loader>
  )
}

export default Users
