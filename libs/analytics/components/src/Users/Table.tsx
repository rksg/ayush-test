import { useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { DisplayUser } from '@acx-ui/analytics/services'
import {
  useRoles,
  defaultSort,
  getUserProfile,
  sortProp
} from '@acx-ui/analytics/utils'
import { Table, TableProps } from '@acx-ui/components'
import { getIntl }           from '@acx-ui/utils'

export const messages = {
  refreshSuccessful: defineMessage({ defaultMessage: 'Refreshed user details successfully' }),
  refreshFailure: defineMessage({ defaultMessage: 'Refresh user details is unsuccessful' }),
  deleteSuccessful: defineMessage({ defaultMessage: 'Deleted user details successfully' }),
  deleteFailure: defineMessage({ defaultMessage: 'Delete user details is unsuccessful' }),
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
  })
}

const getUserActions = (
  selectedRow: DisplayUser,
  { refreshUserDetails, setOpenDrawer, handleDeleteUser, setDrawerType }: {
    refreshUserDetails: CallableFunction,
    setOpenDrawer: CallableFunction,
    handleDeleteUser: CallableFunction,
    setDrawerType: CallableFunction
  }) => {
  const { $t } = getIntl()
  const user = getUserProfile()
  const {
    refreshText, disabledDeleteText, disabledEditText,
    editText, deleteText
  } = messages
  const { id: tenantId } = user.selectedTenant
  const { accountId } = user

  const isEditDisabled = (!(selectedRow?.type === null) ||
    user.userId === selectedRow?.id ||
    (tenantId !== accountId && selectedRow?.accountId !== accountId))

  const isDeleteDisabled = (user.userId === selectedRow?.id ||
      (tenantId !== accountId && selectedRow?.accountId !== accountId && !user.isSupport))

  const rowActionKey = [
    {
      label: $t({ defaultMessage: 'Refresh' }),
      tooltip: $t(refreshText, { br: <br/> }) as string,
      onClick: () => refreshUserDetails({ userId: selectedRow.id })
    },
    {
      label: $t(editText),
      tooltip: isEditDisabled ? $t(disabledEditText) : '',
      disabled: isEditDisabled,
      onClick: () => {
        setDrawerType('edit')
        setOpenDrawer(true)
      }
    },
    {
      label: $t(deleteText),
      tooltip: isDeleteDisabled ? $t(disabledDeleteText) : '',
      disabled: isDeleteDisabled,
      onClick: () => handleDeleteUser()
    }
  ]

  return rowActionKey
}

interface UsersTableProps {
  data?: DisplayUser[]
  setOpenDrawer: CallableFunction
  selectedRow: DisplayUser | null
  setSelectedRow: CallableFunction
  refreshUserDetails: CallableFunction
  handleDeleteUser: CallableFunction
  setDrawerType: CallableFunction
  openDrawer: boolean
  isUsersPageEnabled: boolean
  isEditMode: boolean
  setVisible: CallableFunction
  onDisplayRowChange?: (displayRows: DisplayUser[]) => void
}

export const UsersTable = ({
  data,
  setOpenDrawer,
  selectedRow,
  setSelectedRow,
  refreshUserDetails,
  handleDeleteUser,
  setDrawerType,
  openDrawer,
  isUsersPageEnabled,
  isEditMode,
  setVisible,
  onDisplayRowChange
}: UsersTableProps) => {
  useEffect(() => {
    if (openDrawer === false) {
      setSelectedRow(null)
    }
  }, [openDrawer, setSelectedRow])

  const { $t } = useIntl()
  const roles = useRoles()

  const actions = [
    {
      label: $t({ defaultMessage: 'Add Internal' }),
      onClick: () => {
        setDrawerType('addInternal')
        setOpenDrawer(!openDrawer)
      }
    },
    {
      label: $t({ defaultMessage: 'Add Third Party' }),
      onClick: () => {
        setDrawerType('invite3rdParty')
        setOpenDrawer(!openDrawer)
      }
    }
  ]

  if (isUsersPageEnabled) {
    actions.push({
      label: isEditMode
        ? $t({ defaultMessage: 'Configure SSO' })
        : $t({ defaultMessage: 'Setup SSO' }),
      onClick: () => setVisible(true)
    })
  }

  const columns: TableProps<DisplayUser>['columns'] = [
    {
      title: $t({ defaultMessage: 'Email' }),
      dataIndex: 'email',
      key: 'email',
      fixed: 'left',
      searchable: true,
      sorter: { compare: sortProp('email', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'First Name' }),
      dataIndex: 'firstName',
      key: 'firstName',
      searchable: true,
      sorter: { compare: sortProp('firstName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Last Name' }),
      dataIndex: 'lastName',
      key: 'lastName',
      searchable: true,
      sorter: { compare: sortProp('lastName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'displayType',
      key: 'displayType',
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      dataIndex: 'displayRole',
      key: 'displayRole',
      render: (_, { role }) => $t(roles[role]),
      sorter: { compare: sortProp('role', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Resource Group' }),
      dataIndex: 'resourceGroupName',
      key: 'resourceGroupName',
      sorter: { compare: sortProp('resourceGroupName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Account' }),
      dataIndex: 'accountName',
      key: 'accountName',
      filterable: true,
      sorter: { compare: sortProp('accountName', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Invited by' }),
      dataIndex: 'displayInvitor',
      key: 'displayInvitor',
      sorter: { compare: sortProp('displayInvitor', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Invitation Status' }),
      dataIndex: 'displayInvitationState',
      key: 'displayInvitationState',
      sorter: { compare: sortProp('displayInvitationState', defaultSort) }
    }
  ]

  return <Table<DisplayUser>
    rowKey={'id'}
    settingsId='users-table'
    columns={columns}
    dataSource={data}
    actions={actions}
    rowActions={getUserActions(
      selectedRow as DisplayUser,
      { refreshUserDetails, setOpenDrawer, handleDeleteUser, setDrawerType }
    )}
    searchableWidth={450}
    rowSelection={{
      type: 'radio',
      selectedRowKeys: selectedRow ? [ selectedRow.id ] : [],
      onChange: (
        _, selectedRows: DisplayUser[]
      ) => {
        setOpenDrawer(false)
        setSelectedRow(selectedRows[0])
      }
    }}
    onDisplayRowChange={onDisplayRowChange}
  />
}

