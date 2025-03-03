import { useState, useEffect, useCallback } from 'react'

import { fetchBaseQuery }         from '@reduxjs/toolkit/query'
import { TypedUseMutationResult } from '@reduxjs/toolkit/query/react'
import { defineMessage, useIntl } from 'react-intl'

import {
  useGetUsersQuery,
  useRefreshUserDetailsMutation,
  useGetTenantSettingsQuery,
  useDeleteUserResourceGroupMutation,
  useDeleteInvitationMutation,
  useBrand360Config,
  DisplayUser
} from '@acx-ui/analytics/services'
import type { Settings }                      from '@acx-ui/analytics/utils'
import { Loader, showToast, showActionModal } from '@acx-ui/components'
import { Features, useIsSplitOn }             from '@acx-ui/feature-toggle'
import { hasPermission }                      from '@acx-ui/user'
import { getIntl }                            from '@acx-ui/utils'

import { ImportSSOFileDrawer }    from './ImportSSOFileDrawer'
import { UsersTable, messages }   from './Table'
import { UserDrawer, DrawerType } from './UserDrawer'

interface SSOValue {
  type: 'saml2'
  metadata: string
  fileName: string
}

const getSSOsettings = (settings: Partial<Settings> | undefined): SSOValue | null => {
  if (!settings || !settings.sso) return null
  return JSON.parse(settings.sso)
}

function useHandleMutationResponse (
  response: TypedUseMutationResult<unknown, unknown, ReturnType<typeof fetchBaseQuery>>,
  successMessage: string,
  defaultErrorMessage: string,
  onSuccess?: () => void
) {
  useEffect(() => {
    if (response.isSuccess) {
      onSuccess?.()
      showToast({ type: 'success', content: successMessage })
      response.reset()
    }

    if (response.isError) {
      const { $t } = getIntl()
      let message: string = defaultErrorMessage

      if ('data' in response.error && response.error.data) {
        const { data, status } = response.error
        let error = String(data)
        try {
          error = JSON.parse(error).error
        } catch {
          /* ignore when error is not JSON */
        }
        message = $t({ defaultMessage: 'Error: {message}. (status code: {code})' }, {
          message: error,
          code: status
        })
      }

      showToast({ type: 'error', content: message })
      response.reset()
    }
  }, [response, onSuccess, successMessage, defaultErrorMessage])
}


export const useUsers = () => {
  const { $t } = useIntl()
  const isUsersPageEnabled = useIsSplitOn(Features.RUCKUS_AI_USERS_TOGGLE)
  const [openDrawer, setOpenDrawer] = useState(false)
  const [drawerType, setDrawerType] = useState<DrawerType>('edit')
  const [selectedRow, setSelectedRow] = useState<DisplayUser | null>(null)
  const [refreshUserDetails, refreshResponse] = useRefreshUserDetailsMutation()
  const [deleteUserResourceGroup, deleteUserResponse] = useDeleteUserResourceGroupMutation()
  const [deleteInvitation, deleteInvitationResponse] = useDeleteInvitationMutation()

  const { names: { brand } } = useBrand360Config()
  const usersQuery = useGetUsersQuery(brand, {
    skip: !hasPermission({ permission: 'READ_USERS' })
  })

  const [visible, setVisible] = useState(false)
  const settingsQuery = useGetTenantSettingsQuery()
  const ssoConfig = getSSOsettings(settingsQuery.data)
  const isEditMode = typeof ssoConfig?.metadata === 'string'

  const deselectRow = useCallback(() => setSelectedRow(null), [])

  const showDeleteUserModal = useCallback(() => {
    const user = selectedRow!
    showActionModal({
      type: 'confirm',
      title: $t(messages.deleteModalTitle) ,
      content: $t(messages.deleteModalContent, {
        firstName: user.firstName,
        lastName: user.lastName
      }),
      onOk: () => {
        if (user.invitation?.state === 'pending') {
          deleteInvitation({
            resourceGroupId: user.resourceGroupId,
            userId: user.id
          })
        } else {
          deleteUserResourceGroup({ userId: user.id })
        }
      }
    })
  }, [$t, deleteInvitation, deleteUserResourceGroup, selectedRow])

  useHandleMutationResponse(
    refreshResponse,
    $t(messages.refreshSuccessful),
    $t(messages.refreshFailure),
    deselectRow
  )

  useHandleMutationResponse(
    deleteUserResponse,
    $t(messages.deleteSuccessful),
    $t(messages.deleteFailure),
    deselectRow
  )

  useHandleMutationResponse(
    deleteInvitationResponse,
    $t(messages.deleteSuccessful),
    $t(messages.deleteFailure),
    deselectRow
  )

  const isFetching = [
    refreshResponse.isLoading,
    deleteUserResponse.isLoading,
    deleteInvitationResponse.isLoading,
    usersQuery.isFetching
  ].some(Boolean)

  const [count, setCount] = useState(usersQuery.data?.length || 0)
  useEffect(() => { setCount(usersQuery.data?.length || 0) }, [usersQuery.data?.length])

  const title = defineMessage({
    defaultMessage: 'Users {count, select, null {} other {({count})}}',
    description: 'Translation string - Users'
  })

  const component = <Loader states={[{ isLoading: usersQuery.isLoading, isFetching }]}>
    <UsersTable
      data={usersQuery.data}
      setOpenDrawer={setOpenDrawer}
      selectedRow={selectedRow}
      setSelectedRow={setSelectedRow}
      refreshUserDetails={refreshUserDetails}
      handleDeleteUser={showDeleteUserModal}
      setDrawerType={setDrawerType}
      openDrawer={openDrawer}
      isUsersPageEnabled={isUsersPageEnabled}
      isEditMode={isEditMode}
      setVisible={setVisible}
      onDisplayRowChange={
        useCallback((dataSource: DisplayUser[]) => setCount(dataSource.length), [])
      }
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

  return { title: $t(title, { count }), component }
}
