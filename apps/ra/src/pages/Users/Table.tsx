import { IntlShape, useIntl } from 'react-intl'

import { defaultSort, getUserProfile, ManagedUser, sortProp } from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip }                         from '@acx-ui/components'
import {
  EditOutlined,
  DeleteOutlined,
  Reload
} from '@acx-ui/icons'
import { noDataDisplay } from '@acx-ui/utils'

import * as UI from './styledComponents'
export type DisplayUser = Omit<ManagedUser, 'role'> & {
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
    role: user.role,
    type: getDisplayType(user.type, $t, franchisor),
    invitationState: getDisplayState(user.invitation?.state, $t),
    invitor: user.invitation
      ? [user.invitation.inviterUser.firstName, ' ', user.invitation.inviterUser.lastName].join(' ')
      : noDataDisplay
  }))
}

export const UsersTable = (
  { data, toggleDrawer, setSelectedRow }:
  { data?: ManagedUser[], toggleDrawer: CallableFunction, setSelectedRow: CallableFunction }) => {
  const { $t } = useIntl()
  const user = getUserProfile()
  const { franchisor } = user.selectedTenant.settings
  const users = transformUsers(data, $t, franchisor)
  const UserActions = (props: { selectedRow: ManagedUser }) => {
    const actionButtons = [
      {
        type: 'refresh',
        action: () => {},
        icon: (
          <Tooltip
            placement='top'
            arrowPointAtCenter
            title={$t({ defaultMessage: 'Refresh' })}>
            <UI.IconWrapper $disabled={false}>
              <Reload style={{ height: '24px', width: '24px' }} />
            </UI.IconWrapper>
          </Tooltip>
        )
      },
      {
        type: 'edit',
        action: () => {},
        icon: (
          <Tooltip
            placement='top'
            arrowPointAtCenter
            title={$t({ defaultMessage: 'Edit' })}>
            <UI.IconWrapper $disabled={false}>
              <EditOutlined
                onClick={() => {
                  setSelectedRow(props.selectedRow)
                  toggleDrawer(true)
                }}
                style={{ height: '24px', width: '24px' }}
              />
            </UI.IconWrapper>
          </Tooltip>
        )
      },
      {
        type: 'delete',
        action: () => {},
        icon: (
          <Tooltip
            placement='top'
            arrowPointAtCenter
            title={$t({ defaultMessage: 'Delete' })}>
            <UI.IconWrapper $disabled={false}>
              <DeleteOutlined style={{ height: '24px', width: '24px' }} />
            </UI.IconWrapper>
          </Tooltip>
        )
      }
    ]
    return <UI.Actions>
      {actionButtons.map((config, i) => <span key={i}>{config.icon}</span>)}
    </UI.Actions>
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
      dataIndex: 'type',
      key: 'type',
      sorter: { compare: sortProp('type', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Role' }),
      dataIndex: 'role',
      key: 'role',
      sorter: { compare: sortProp('role', defaultSort) },
      render: (_, row) => getDisplayRole((row as ManagedUser).role, $t)
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
      dataIndex: 'invitor',
      key: 'invitor',
      sorter: { compare: sortProp('invitor', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Invitation Status' }),
      dataIndex: 'invitationState',
      key: 'invitationState',
      sorter: { compare: sortProp('invitationState', defaultSort) }
    },
    {
      title: $t({ defaultMessage: 'Actions' }),
      key: 'id',
      dataIndex: 'id',
      width: 100,
      fixed: 'right',
      className: 'actions-column',
      render: (_, row) => <UserActions selectedRow={row as ManagedUser} />
    }
  ]
  return <Table<DisplayUser>
    rowKey={'id'}
    columns={columns}
    dataSource={users}
  />
}
