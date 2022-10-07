import { useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import {
  Button,
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import {
  useInviteCustomerListQuery
} from '@acx-ui/rc/services'
import {
  VarCustomer,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

function useInvitaionColumns () {
  const { $t } = useIntl()

  function onAcceptInvite (row: VarCustomer) {
    return <>
      <Button onClick={() => handleReject(row)}>{$t({ defaultMessage: 'Reject' })}</Button>
      <Button onClick={() => handleAccept(row)}
        type='secondary'
        style={{ marginLeft: 10 }}>{$t({ defaultMessage: 'Accept' })}</Button>
    </>
  }

  const handleReject = (row: VarCustomer) => {
    const name = row.tenantName
    alert('tenant ' + name + 'rejected')
  }

  const handleAccept = (row: VarCustomer) => {
    const name = row.tenantName
    alert('tenant ' + name + 'accepted')
  }

  const columnsPendingInvitaion: TableProps<VarCustomer>['columns'] = [
    {
      title: $t({ defaultMessage: 'Account Name' }),
      dataIndex: 'tenantName',
      key: 'tenantName',
      sorter: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data) {
        return (
          <TenantLink to={''}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Email' }),
      dataIndex: 'tenantEmail',
      key: 'tenantEmail',
      sorter: true
    },
    {
      dataIndex: 'acceptInvite',
      key: 'acceptInvite',
      width: 220,
      render: function (data, row) {
        return onAcceptInvite(row)
      }
    }
  ]

  return columnsPendingInvitaion
}

export function InvitationList () {
  const { $t } = useIntl()
  const [inviteCount, setInviteCount] = useState(0)

  const invitationPayload = {
    searchString: '',
    fields: ['tenantName', 'tenantEmail'],
    filters: {
      status: ['DELEGATION_STATUS_INVITED'],
      delegationType: ['DELEGATION_TYPE_VAR'],
      isValid: [true]
    }
  }

  const PendingInvitaion = () => {
    const tableQuery = useTableQuery({
      useQuery: useInviteCustomerListQuery,
      defaultPayload: invitationPayload
    })
    setInviteCount(tableQuery.data?.totalCount as number)
    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={useInvitaionColumns()}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <h3>{$t({ defaultMessage: 'Pending Invitations' })} ({inviteCount})</h3>
      <PendingInvitaion />
    </>
  )
}
