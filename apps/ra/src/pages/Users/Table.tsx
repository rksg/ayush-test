import { IntlShape, useIntl } from 'react-intl'

import { defaultSort, getUserProfile, ManagedUser, sortProp } from '@acx-ui/analytics/utils'
import { Table, TableProps }                                  from '@acx-ui/components'
import { noDataDisplay }                                      from '@acx-ui/utils'

type DisplayUser = Omit<ManagedUser, 'role'> & {
  invitationState: string,
  invitor: string,
  role: string
}

const getDisplayRole = (role: ManagedUser['role'], $t: IntlShape['$t']) => {
  switch (role) {
    case 'admin': return $t({ defaultMessage: 'Admin' })
    case 'report-only': return $t({ defaultMessage: 'Report Only' })
    case 'network-admin': return $t({ defaultMessage: 'Network Admin' })
  }
}

const getDisplayType = (type: ManagedUser['type'], $t: IntlShape['$t'], franchisor: string) => {
  switch (type) {
    case 'tenant': return $t({ defaultMessage: '3rd Party' })
    case 'super-tenant': return franchisor
    default: return $t({ defaultMessage: 'Internal' })
  }
}

const getDisplayState = (
  state: NonNullable<ManagedUser['invitation']>['state'] | undefined,
  $t: IntlShape['$t']
) => {
  switch (state) {
    case 'accepted': return $t({ defaultMessage: 'Accepted' })
    case 'rejected': return $t({ defaultMessage: 'Rejected' })
    case 'pending': return $t({ defaultMessage: 'Pending' })
    default: return noDataDisplay
  }
}

const transformUsers = (
  users: ManagedUser[] | undefined,
  $t: IntlShape['$t'],
  franchisor: string
): DisplayUser[] => {
  if (!users) return []
  return users.map(user => ({
    ...user,
    role: getDisplayRole(user.role, $t),
    type: getDisplayType(user.type, $t, franchisor),
    invitationState: getDisplayState(user.invitation?.state, $t),
    invitor: user.invitation
      ? [user.invitation.inviterUser.firstName, ' ', user.invitation.inviterUser.lastName].join(' ')
      : noDataDisplay
  }))
}

export const UsersTable = ({ data }: { data?: ManagedUser[] }) => {
  const { $t } = useIntl()
  const user = getUserProfile()
  const { franchisor } = user.selectedTenant.settings
  const users = transformUsers(data, $t, franchisor)
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
      dataIndex: 'type',
      key: 'type',
      filterable: true,
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      dataIndex: 'role',
      key: 'role',
      filterable: true,
      sorter: { compare: sortProp('role', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Resource Group' }),
      dataIndex: 'resourceGroupName',
      key: 'resourceGroupName',
      filterable: true,
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
      dataIndex: 'invitor',
      key: 'invitor',
      filterable: true,
      sorter: { compare: sortProp('invitor', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Invitation Status' }),
      dataIndex: 'invitationState',
      key: 'invitationState',
      filterable: true,
      sorter: { compare: sortProp('invitationState', defaultSort) }
    }
  ]
  return <Table<DisplayUser>
    rowKey={'id'}
    columns={columns}
    dataSource={users}
  />
}
