import { useIntl } from 'react-intl'

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
    displayRole: $t(messages[user.role as keyof typeof messages]),
    displayType: getDisplayType(user.type, franchisor),
    displayInvitationState: getDisplayState(user.invitation?.state),
    displayInvitor: user.invitation
      ? [user.invitation.inviterUser.firstName, '', user.invitation.inviterUser.lastName].join(' ')
      : noDataDisplay
  }))
}
const getUserActions = (
  selectedRow: ManagedUser,
  { setSelectedRow, getLatestUserDetails, toggleDrawer, handleDeleteUser }: {
    setSelectedRow: CallableFunction,
    getLatestUserDetails: CallableFunction,
    toggleDrawer: CallableFunction,
    handleDeleteUser: CallableFunction
  }) => {
  const { $t } = getIntl()
  const user = getUserProfile()
  const { refreshText, disabledDeleteText, disabledEditText, editText,deleteText } = messages
  const { id: tenantId } = user.selectedTenant
  const { accountId } = user

  const isEditDisabled = (!(selectedRow.type === null) ||
    user.userId === selectedRow.id ||
    (tenantId !== accountId && selectedRow.accountId !== accountId))

  const isDeleteDisbaled = (user.userId === selectedRow.id ||
      (tenantId !== accountId && selectedRow.accountId !== accountId))
  const actionButtons = [
    {
      type: 'refresh',
      icon: (
        <Tooltip
          placement='top'
          arrowPointAtCenter
          title={$t(refreshText, { br: <br/> })}>
          <UI.IconWrapper $disabled={false}>
            <Reload
              onClick={() => {
                setSelectedRow(selectedRow)
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
            isEditDisabled
              ? disabledEditText
              : editText
          )}>
          <UI.IconWrapper $disabled={isEditDisabled}>
            { isEditDisabled
              ? <EditOutlinedDisabledIcon />
              : <EditOutlined
                onClick={() => {
                  setSelectedRow(selectedRow)
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
            isDeleteDisbaled
              ? disabledDeleteText
              : deleteText
          )}>
          <UI.IconWrapper $disabled={isDeleteDisbaled}>
            {isDeleteDisbaled
              ? <DeleteOutlinedDisabledIcon/>
              : <DeleteOutlined
                onClick={() => {
                  setSelectedRow(selectedRow)
                  handleDeleteUser()
                }}
                style={{ height: '24px', width: '24px' }} />
            }
          </UI.IconWrapper>
        </Tooltip>
      )
    }
  ]

  return (
    <UI.Actions>
      {actionButtons.map((config, i) => <span key={i}>{config.icon}</span>)}
    </UI.Actions>
  )
}

interface UsersTableProps {
  data?: ManagedUser[]
  toggleDrawer: CallableFunction
  setSelectedRow: CallableFunction
  getLatestUserDetails: CallableFunction
  handleDeleteUser: CallableFunction
  setUsersCount: CallableFunction
}

export const UsersTable = ({
  data,
  toggleDrawer,
  setSelectedRow,
  getLatestUserDetails,
  handleDeleteUser,
  setUsersCount
}: UsersTableProps) => {
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
    },
    {
      title: $t({ defaultMessage: 'Actions' }),
      key: 'id',
      dataIndex: 'id',
      width: 100,
      fixed: 'right',
      className: 'actions-column',
      render: (_, row) => getUserActions(
        row as ManagedUser,
        { setSelectedRow, getLatestUserDetails, toggleDrawer, handleDeleteUser }
      )
    }
  ]
  return <Table<DisplayUser>
    rowKey='id'
    settingsId='users-table'
    columns={columns}
    dataSource={users}
    onDisplayRowChange={data => setUsersCount(data.length)}
  />
}
