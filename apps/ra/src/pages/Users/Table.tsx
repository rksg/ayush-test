import { defineMessage, useIntl } from 'react-intl'

import { defaultSort, getUserProfile, ManagedUser, sortProp } from '@acx-ui/analytics/utils'
import { Table, TableProps, Tooltip }                         from '@acx-ui/components'
import {
  EditOutlined,
  DeleteOutlined,
  Reload,
  EditOutlinedDisabledIcon,
  DeleteOutlinedDisabledIcon
} from '@acx-ui/icons'
import { noDataDisplay, getIntl } from '@acx-ui/utils'

import * as UI from './styledComponents'

export type DisplayUser = ManagedUser & {
  displayInvitationState: string
  displayInvitor: string
  displayRole: string
  displayType: string
}

export const disabledDeleteText = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'You are not allowed to delete yourself.Or, if you are an invited 3rd party user, you are not allowed to delete users in the host account.'
})
export const disabledEditText = defineMessage({
  // eslint-disable-next-line max-len
  defaultMessage: 'You are not allowed to edit yourself or invited users. If you are an invited 3rd party user, you are not allowed to edit users in the host account.'
})
export const refreshText = defineMessage({
  defaultMessage:
    'Retrieve latest email, first name, last name from Ruckus Support Portal.'
})

export const editText = defineMessage({
  defaultMessage: 'Edit'
})
export const deleteText = defineMessage({
  defaultMessage: 'Delete'
})
const getDisplayRole = (role: ManagedUser['role']) => {
  const { $t } = getIntl()
  switch (role) {
    case 'admin':
      return $t({ defaultMessage: 'Admin' })
    case 'report-only':
      return $t({ defaultMessage: 'Report Only' })
    case 'network-admin':
      return $t({ defaultMessage: 'Network Admin' })
  }
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
  { data, toggleDrawer, setSelectedRow, getLatestUserDetails, handleDeleteUser }:
  { data?: ManagedUser[],
    toggleDrawer: CallableFunction,
    setSelectedRow: CallableFunction,
    getLatestUserDetails: CallableFunction,
    handleDeleteUser: CallableFunction }) => {
  const { $t } = useIntl()
  const user = getUserProfile()
  const { franchisor } = user.selectedTenant.settings
  const users = transformUsers(data, franchisor)
  const UserActions = (props: { selectedRow: ManagedUser }) => {
    const actionButtons = [
      {
        type: 'refresh',
        icon: (
          <Tooltip
            placement='top'
            arrowPointAtCenter
            title={$t(refreshText)}>
            <UI.IconWrapper $disabled={false}>
              <Reload
                onClick={() => {
                  setSelectedRow(props.selectedRow)
                  getLatestUserDetails()
                }}
                style={{ height: '24px', width: '24px' }}
              />
            </UI.IconWrapper>
          </Tooltip>
        )
      },
      {
        type: 'edit',
        icon: (
          <Tooltip
            placement='top'
            arrowPointAtCenter
            title={$t(
              (!(props.selectedRow.type === null) ||
              user.userId === props.selectedRow.id)
                ? disabledEditText
                : editText
            )}>
            <UI.IconWrapper $disabled={
              !(props.selectedRow.type === null) ||
              (user.userId === props.selectedRow.id)
            }>
              { !(props.selectedRow.type === null) ||
              (user.userId === props.selectedRow.id)
                ? <EditOutlinedDisabledIcon />
                : <EditOutlined
                  onClick={() => {
                    setSelectedRow(props.selectedRow)
                    toggleDrawer(true)
                  }}
                  style={{ height: '24px', width: '24px' }}
                />
              }
            </UI.IconWrapper>
          </Tooltip>
        )
      },
      {
        type: 'delete',
        icon: (
          <Tooltip
            placement='top'
            arrowPointAtCenter
            title={$t(
              (user.userId === props.selectedRow.id)
                ? disabledDeleteText
                : deleteText
            )}>
            <UI.IconWrapper $disabled={
              (user.userId === props.selectedRow.id)
            }>{user.userId === props.selectedRow.id
                ? <DeleteOutlinedDisabledIcon/>
                : <DeleteOutlined
                  onClick={() => {
                    setSelectedRow(props.selectedRow)
                    handleDeleteUser()
                  }}
                  style={{ height: '24px', width: '24px' }} />
              }
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
