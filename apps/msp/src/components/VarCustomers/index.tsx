import { SortOrder } from 'antd/lib/table/interface'

import { Button, PageHeader, Table, TableProps, Loader } from '@acx-ui/components'
import { 
  useVarCustomerListQuery, 
  useInviteCustomerListQuery 
} from '@acx-ui/rc/services'
import { MspEc, useTableQuery } from '@acx-ui/rc/utils'
import { TenantLink }           from '@acx-ui/react-router-dom'

const columnsPendingInvitaion: TableProps<MspEc>['columns'] = [
  {
    title: 'Account Name',
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
    title: 'Account Email',
    dataIndex: 'tenantEmail',
    sorter: true
  }
]

const columns: TableProps<MspEc>['columns'] = [
  {
    title: 'Customer',
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
    title: 'Account Email',
    dataIndex: 'tenantEmail',
    sorter: true
  },
  {
    title: 'Active Alarms',
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
    title: 'Active Incidents',
    dataIndex: 'venues',
    sorter: true,
    align: 'center',
    render: function (count, row) {
      return (
        <TenantLink
          to={`/networks/${row.id}/network-details/venues`}
          // children={count ? count : 0}
        />
      )
    }
  },
  {
    title: 'Wi-Fi Licenses',
    dataIndex: 'aps',
    sorter: true,
    align: 'center',
    render: function (data, row) {
      return (
        <TenantLink to={`/networks/${row.id}/network-details/aps`}>{data}</TenantLink>
      )
    }
  },
  {
    title: 'Wi-Fi Licenses Utilization',
    dataIndex: 'clients',
    sorter: true,
    align: 'center'
  },
  {
    title: 'Switch Licenses',
    dataIndex: 'switchLicenses',
    sorter: true,
    align: 'center'
  },
  {
    title: 'Next License EXpiration',
    dataIndex: 'tags',
    sorter: true
  }
]

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

  const PendingInvitaion = () => {
    const tableQuery = useTableQuery({
      useQuery: useInviteCustomerListQuery,
      defaultPayload: invitationPayload
    })

    return (
      <Loader states={[tableQuery]}>
        <Table
          columns={columnsPendingInvitaion}
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
          columns={columns}
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
        title='VAR Customers'
        extra={[
          <TenantLink to='/networks/create' key='add'>
            <Button>Manage own account</Button>
          </TenantLink>
        ]}
      />

      <PageHeader
        title='Pending Invitations'
        extra={[
          <TenantLink to='/networks/create' key='add'>
            {/* <Button>Refresh All</Button> */}
          </TenantLink>
        ]}
      />
      <PendingInvitaion />
      <PageHeader
        title=''
      />
      <VarCustomerTable />
    </>
  )
}
