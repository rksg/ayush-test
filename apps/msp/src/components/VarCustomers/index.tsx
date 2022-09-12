import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import { 
  useVarCustomerListQuery, 
  useInviteCustomerListQuery 
} from '@acx-ui/rc/services'
import { MspEc, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }           from '@acx-ui/react-router-dom'

function useInvitaionColumns () {
  const { $t } = useIntl()

  const columnsPendingInvitaion: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Account Name' }),
      dataIndex: 'tenantName',
      sorter: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Email' }),
      dataIndex: 'tenantEmail',
      sorter: true
    }
  ]
  return columnsPendingInvitaion
}

function useCustomerColumns () {
  const { $t } = useIntl()

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customer' }),
      dataIndex: 'tenantName',
      sorter: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Email' }),
      dataIndex: 'tenantEmail',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Active Alarms' }),
      dataIndex: 'alarmCount',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return (
          <TenantLink to={`/networks/${row.id}/network-details/overview`}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Active Incidents' }),
      dataIndex: 'activeIncindents',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicenses',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicenses',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Next License EXpiration' }),
      dataIndex: 'expirationDate',
      sorter: true
    }
  ]
  return columns
}

const invitationPayload = {
  searchString: '',
  fields: ['tenantName', 'tenantEmail'],
  filters: {
    status: ['DELEGATION_STATUS_INVITED'],
    delegationType: ['DELEGATION_TYPE_VAR'],
    isValid: [true]
  }
}

const varCustomerPayload = {
  searchString: '',
  fields: [
    'tenantName', 
    'tenantEmail', 
    'alarmCount', 
    'priorityIncidents', 
    'apEntitlement.quantity', 
    'apEntitlement', 
    'switchEntitlement', 
    'nextExpirationLicense', 
    'id'],
  searchTargetFields: ['tenantName', 'tenantEmail'],
  filters: {
    status: ['DELEGATION_STATUS_ACCEPTED'],
    delegationType: ['DELEGATION_TYPE_VAR'],
    isValid: [true]
  }
}

export function VarCustomers () {
  const { $t } = useIntl()

  const PendingInvitaion = () => {
    const tableQuery = useTableQuery({
      useQuery: useInviteCustomerListQuery,
      defaultPayload: invitationPayload
    })

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

  const VarCustomerTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useVarCustomerListQuery,
      defaultPayload: varCustomerPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={useCustomerColumns()}
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
      <PageHeader
        title={$t({ defaultMessage: 'VAR Customers' })}
        extra={[
          <TenantLink to='/dashboard' key='add'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>
        ]}
      />

      <PageHeader
        title={$t({ defaultMessage: 'Pending Invitations' })}
      />
      <PendingInvitaion />
      <PageHeader
        title=''
        extra={[
          <Button key='download' icon={<DownloadOutlined />} />
        ]}
      />
      <VarCustomerTable />
    </>
  )
}
