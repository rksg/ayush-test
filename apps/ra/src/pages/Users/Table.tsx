import { useIntl } from 'react-intl'

import { defaultSort, getUserProfile, ManagedUser, sortProp } from '@acx-ui/analytics/utils'
import { Table, TableProps }                                  from '@acx-ui/components'
import { getIntl, noDataDisplay }                             from '@acx-ui/utils'

type DisplayUser = ManagedUser & {
  displayInvitationState: string
  displayInvitor: string
  displayRole: string
  displayType: string
}

const getDisplayRole = (role: ManagedUser['role']) => {
  const { $t } = getIntl()
  switch (role) {
    case 'admin': return $t({ defaultMessage: 'Admin' })
    case 'report-only': return $t({ defaultMessage: 'Report Only' })
    case 'network-admin': return $t({ defaultMessage: 'Network Admin' })
  }
}

const getDisplayType = (type: ManagedUser['type'], franchisor: string) => {
  const { $t } = getIntl()
  switch (type) {
    case 'tenant': return $t({ defaultMessage: '3rd Party' })
    case 'super-tenant': return franchisor
    default: return $t({ defaultMessage: 'Internal' })
  }
}

const getDisplayState = (
  state: NonNullable<ManagedUser['invitation']>['state'] | undefined
) => {
  const { $t } = getIntl()
  switch (state) {
    case 'accepted': return $t({ defaultMessage: 'Accepted' })
    case 'rejected': return $t({ defaultMessage: 'Rejected' })
    case 'pending': return $t({ defaultMessage: 'Pending' })
    default: return noDataDisplay
  }
}

const transformUsers = (
  users: ManagedUser[] | undefined,
  franchisor: string
): DisplayUser[] => {
  if (!users) return []
  return users.map(user => ({
    ...user,
    displayRole: getDisplayRole(user.role),
    displayType: getDisplayType(user.type, franchisor),
    displayInvitationState: getDisplayState(user.invitation?.state),
    displayInvitor: user.invitation
      ? [user.invitation.inviterUser.firstName, '', user.invitation.inviterUser.lastName].join(' ')
      : noDataDisplay
  }))
}

export const UsersTable = (
  { data, toggleDrawer, setSelectedRow, setDrawerType }:
  {
    data?: ManagedUser[], toggleDrawer: CallableFunction,
    setSelectedRow: CallableFunction, setDrawerType: CallableFunction
  }) => {
  const { $t } = useIntl()
  const user = getUserProfile()
  const { franchisor } = user.selectedTenant.settings
  const users = transformUsers(data, franchisor)
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
  />
}
