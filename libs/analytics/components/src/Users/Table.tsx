import { useContext, useEffect } from 'react'

import { useIntl } from 'react-intl'

import { useBrand360Config } from '@acx-ui/analytics/services'
import {
  defaultSort,
  getUserProfile,
  ManagedUser,
  sortProp,
  roleStringMap
} from '@acx-ui/analytics/utils'
import { Table, TableProps, showToast } from '@acx-ui/components'
import { noDataDisplay, getIntl }       from '@acx-ui/utils'

import { CountContext } from '../AccountManagement'

import { messages } from './'

type DisplayUser = ManagedUser & {
  displayInvitationState: string
  displayInvitor: string
  displayRole: string
  displayType: string
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
  { setSelectedRow, refreshUserDetails, setOpenDrawer, handleDeleteUser, setDrawerType }: {
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
    editText, deleteText, refreshSuccessful, refreshFailure
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
      onClick: () => {
        if (refreshUserDetails({ userId: selectedRow.id })) {
          showToast({
            type: 'success',
            content: $t(refreshSuccessful)
          })
        } else {
          showToast({
            type: 'error',
            content: $t(refreshFailure)
          })
        }
        setSelectedRow(null)
      }
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
      onClick: () => {
        handleDeleteUser()
      }
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
  deleteUser: {
    deleteUser: boolean
    showModal: boolean
  }
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
  deleteUser
}: UsersTableProps) => {
  useEffect(() => {
    if (deleteUser.showModal === false ) {
      setSelectedRow(null)
    }
  }, [deleteUser.showModal, setSelectedRow])
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
        deleteUser.showModal = false
        setSelectedRow(selectedRows[0])
      }
    }}
    onDisplayRowChange={(dataSource) => setUsersCount?.(dataSource.length)}
  />
}

