import { useContext, useEffect } from 'react'

import { defineMessage, useIntl } from 'react-intl'

import { useBrand360Config } from '@acx-ui/analytics/services'
import {
  defaultSort,
  getUserProfile,
  ManagedUser,
  sortProp,
  roleStringMap
} from '@acx-ui/analytics/utils'
import { Table, TableProps }      from '@acx-ui/components'
import { noDataDisplay, getIntl } from '@acx-ui/utils'

import { CountContext } from '../AccountManagement'

type DisplayUser = ManagedUser & {
  displayInvitationState: string
  displayInvitor: string
  displayRole: string
  displayType: string
}

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

const getDisplayType = (type: ManagedUser['type'], franchisor: string) => {
  const { $t } = getIntl()
  switch (type) {
    case 'tenant':
      return $t({ defaultMessage: '3rd Party' })
    case 'super-tenant':
      return franchisor
    default:
      return $t({ defaultMessage: 'Internal' })
  }
}

const getDisplayState = (
  state: NonNullable<ManagedUser['invitation']>['state'] | undefined
) => {
  const { $t } = getIntl()
  switch (state) {
    case 'accepted':
      return $t({ defaultMessage: 'Accepted' })
    case 'rejected':
      return $t({ defaultMessage: 'Rejected' })
    case 'pending':
      return $t({ defaultMessage: 'Pending' })
    default:
      return noDataDisplay
  }
}

const transformUsers = (
  users: ManagedUser[] | undefined,
  franchisor: string
): DisplayUser[] => {
  const { $t } = getIntl()
  if (!users) return []
  return users.map(user => ({
    ...user,
    displayRole: $t(roleStringMap[user.role]),
    displayType: getDisplayType(user.type, franchisor),
    displayInvitationState: getDisplayState(user.invitation?.state),
    displayInvitor: user.invitation
      ? [user.invitation.inviterUser.firstName, '', user.invitation.inviterUser.lastName].join(' ')
      : noDataDisplay
  }))
}
const getUserActions = (
  selectedRow: ManagedUser,
  { refreshUserDetails, setOpenDrawer, handleDeleteUser, setDrawerType }: {
    setSelectedRow: CallableFunction,
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

  const isDeleteDisbaled = (user.userId === selectedRow?.id ||
      (tenantId !== accountId && selectedRow?.accountId !== accountId))

  const rowActionKey = [
    {
      label: $t({ defaultMessage: 'Refresh' }),
      tooltip: $t(refreshText, { br: <br/> }) as string,
      onClick: () => refreshUserDetails({ userId: selectedRow.id })
    },
    {
      label: $t(editText),
      tooltip: isEditDisabled ? $t(disabledEditText) : $t(editText),
      disabled: isEditDisabled,
      onClick: () => {
        setDrawerType('edit')
        setOpenDrawer(true)
      }
    },
    {
      label: $t(deleteText),
      tooltip: isDeleteDisbaled ? $t(disabledDeleteText) : $t(deleteText),
      disabled: isDeleteDisbaled,
      onClick: () => handleDeleteUser()
    }
  ]

  return rowActionKey
}

interface UsersTableProps {
  data?: ManagedUser[]
  setOpenDrawer: CallableFunction
  selectedRow: ManagedUser | null
  setSelectedRow: CallableFunction
  refreshUserDetails: CallableFunction
  handleDeleteUser: CallableFunction
  setDrawerType: CallableFunction
  openDrawer: boolean
  isUsersPageEnabled: boolean
  isEditMode: boolean
  setVisible: CallableFunction
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
  setVisible
}: UsersTableProps) => {
  useEffect(() => {
    if (openDrawer === false) {
      setSelectedRow(null)
    }
  }, [openDrawer, setSelectedRow])

  const { $t } = useIntl()
  const { names: { brand } } = useBrand360Config()
  const users = transformUsers(data, brand)
  const { setUsersCount } = useContext(CountContext)
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

  if(isUsersPageEnabled) {
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
    dataSource={users}
    actions={actions}
    rowActions={getUserActions(
      selectedRow as ManagedUser,
      { setSelectedRow, refreshUserDetails, setOpenDrawer, handleDeleteUser, setDrawerType }
    )}
    rowSelection={{
      type: 'radio',
      selectedRowKeys: selectedRow ? [ selectedRow.id ] : [],
      onChange: (
        _, selectedRows: ManagedUser[]
      ) => {
        setOpenDrawer(false)
        setSelectedRow(selectedRows[0])
      }
    }}
    onDisplayRowChange={(dataSource) => setUsersCount?.(dataSource.length)}
  />
}

