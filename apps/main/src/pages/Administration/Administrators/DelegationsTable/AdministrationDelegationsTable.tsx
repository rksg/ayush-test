import { useState } from 'react'

import { Empty }     from 'antd'
import { useIntl }   from 'react-intl'
import { useParams } from 'react-router-dom'

import {
  Button,
  showActionModal,
  Table,
  TableProps,
  Subtitle,
  Loader
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useGetDelegationsQuery,
  useRevokeInvitationMutation
} from '@acx-ui/rc/services'
import {
  AdministrationDelegationStatus,
  defaultSort,
  Delegation,
  getDelegetionStatusIntlString,
  sortProp,
  SortResult
} from '@acx-ui/rc/utils'
import { RolesEnum }                from '@acx-ui/types'
import { filterByAccess, hasRoles } from '@acx-ui/user'

import * as UI from '../styledComponents'

import DelegationInviteDialog from './DelegationInviteDialog'


export interface AdministrationDelegationsTableProps {
  isSupport: boolean;
}

export const AdministrationDelegationsTable = (props: AdministrationDelegationsTableProps) => {
  const { isSupport } = props
  const { $t } = useIntl()
  const params = useParams()
  const [showDialog, setShowDialog] = useState(false)
  const [isTenantLocked, setIsTenantLocked] = useState(false)
  const [revokeInvitation] = useRevokeInvitationMutation()
  const hasRevokeInvitationPermmision = hasRoles([RolesEnum.PRIME_ADMIN])
  const hasInvite3rdPartyPermmision = hasRoles([RolesEnum.PRIME_ADMIN])
  const isMultipleVarEnabled = useIsSplitOn(Features.MULTIPLE_VAR_INVITATION_TOGGLE)
  const MAX_VAR_INVITATIONS = 5

  const { data, isLoading, isFetching }= useGetDelegationsQuery({ params })

  const shouldInvite3rdPartyEnabled =
  (isMultipleVarEnabled && data?.length && data.length < MAX_VAR_INVITATIONS ) || false

  const hasDelegations = Boolean(data?.length) && !shouldInvite3rdPartyEnabled

  const handleClickInviteDelegation = () => {
    setShowDialog(true)
  }

  const delegationRevokeInvitation= (rowData: Delegation) => {
    setIsTenantLocked(true)

    const paramValues = {
      tenantId: params.tenantId,
      delegationId: rowData.id
    }

    try {
      revokeInvitation({ params: paramValues, callback: () => {
        setIsTenantLocked(false)
      } }).unwrap()
    } catch {
      setIsTenantLocked(false)
    }
  }

  const handleClickRevokeInvitation = (rowData: Delegation) => () => {
    const isCancel = (rowData.status === AdministrationDelegationStatus.INVITED
        || rowData.status === AdministrationDelegationStatus.REJECTED)

    showActionModal({
      type: 'confirm',
      // eslint-disable-next-line max-len
      title: isCancel ? $t({ defaultMessage: 'Cancel invitation?' }) : $t({ defaultMessage: 'Revoke Access' }),
      content: isCancel
      // eslint-disable-next-line max-len
        ? $t({ defaultMessage: 'Are you sure you want to cancel the invitation of 3rd party administrator {name}?' }, { name: rowData.delegatedToName })
      // eslint-disable-next-line max-len
        : $t({ defaultMessage: 'Are you sure you want to revoke access of partner {name}?' }, { name: rowData.delegatedToName }),
      okText: isCancel
        ? $t({ defaultMessage: 'Cancel Invitation' })
        : $t({ defaultMessage: 'Yes, revoke access' }),
      cancelText: isCancel
        ? $t({ defaultMessage: 'Keep invitation' })
        : $t({ defaultMessage: 'No, keep access grant' }),
      onOk: () => {
        delegationRevokeInvitation(rowData)
      }
    })
  }

  const columns: TableProps<Delegation>['columns'] = [
    {
      title: $t({ defaultMessage: 'Partner Name' }),
      key: 'delegatedToName',
      dataIndex: 'delegatedToName',
      sorter: { compare: sortProp('delegatedToName', defaultSort) },
      render: (_, row) => {
        return row.delegatedToName
      }
    },
    ...(isMultipleVarEnabled ? [{
      title: $t({ defaultMessage: 'Email' }),
      key: 'delegatedToAdmin',
      dataIndex: 'delegatedToAdmin',
      sorter: { compare: sortProp('delegatedToAdmin', defaultSort) },
      render: (_: React.ReactNode, row: Delegation) => {
        return row.delegatedToAdmin
      }
    }] : []),
    {
      title: $t({ defaultMessage: 'Status' }),
      key: 'status',
      dataIndex: 'status',
      defaultSortOrder: 'ascend',
      sorter: { compare: sortProp('status', defaultSort) },
      render: (_, row) => {
        return $t(getDelegetionStatusIntlString(row.status))
      }
    }
  ]
  if (!isSupport && hasRevokeInvitationPermmision) {
    columns.push({
      title: $t({ defaultMessage: 'Action' }),
      key: 'action',
      dataIndex: 'action',
      sorter: { compare: sortProp('status',
        (a: AdministrationDelegationStatus, b: AdministrationDelegationStatus): SortResult => {
          const _a = a !== AdministrationDelegationStatus.ACCEPTED ? 0 : 1
          const _b = b !== AdministrationDelegationStatus.ACCEPTED ? 0 : 1
          // accepted sorted first in ascending
          return (_b - _a) as SortResult
        }) },
      render: (_, row) => {
        return <Button
          onClick={handleClickRevokeInvitation(row)}
          disabled={isTenantLocked}
        >
          {
            row.status === AdministrationDelegationStatus.ACCEPTED
              ? $t({ defaultMessage: 'Revoke access' })
              : $t({ defaultMessage: 'Cancel invitation' })
          }
        </Button>
      }
    })
  }


  const tableActions = []
  if (!isSupport && hasInvite3rdPartyPermmision) {
    tableActions.push({
      label: $t({ defaultMessage: 'Invite 3rd Party Administrator' }),
      disabled: hasDelegations,
      onClick: handleClickInviteDelegation
    })
  }

  return (
    <Loader states={[
      { isLoading: isLoading,
        isFetching: isFetching
      }
    ]}>
      <UI.TableTitleWrapper direction='vertical'>
        <Subtitle level={4}>
          {$t({ defaultMessage: '3rd Party Administrator' })}
        </Subtitle>
        <Subtitle level={5}>
          {$t({ defaultMessage: 'You can delegate access rights to a 3rd party administrator.' }) }
        </Subtitle>
      </UI.TableTitleWrapper>

      <Table
        columns={columns}
        dataSource={data}
        rowKey='id'
        locale={{
          // eslint-disable-next-line max-len
          emptyText: <Empty description={$t({ defaultMessage: 'No 3rd Party Administrator Invited' })} />
        }}
        actions={filterByAccess(tableActions)}
      />

      <DelegationInviteDialog
        visible={showDialog}
        setVisible={setShowDialog}
      />
    </Loader>
  )
}
