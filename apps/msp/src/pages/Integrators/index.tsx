import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import { Button, PageHeader, showActionModal, showToast, Table, TableProps, Loader } from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import { useDeleteMspEcMutation, useMspCustomerListQuery } from '@acx-ui/rc/services'
import {
  useTableQuery,
  MspEc
} from '@acx-ui/rc/utils'
import { TenantLink } from '@acx-ui/react-router-dom'

function useColumns () {
  const { $t } = useIntl()
  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data) {
        return (
          <TenantLink to={''}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Type' }),
      dataIndex: 'tenantType',
      key: 'tenantType',
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Customers Assigned' }),
      dataIndex: 'assignedMspEcList',
      key: 'assignedMspEcList',
      sorter: true,
      align: 'center',
      render: function (data, row) {
        return transformAssignedCustomerCount(row)
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admins' }),
      dataIndex: 'mspAdminCount',
      key: 'mspAdminCount',
      sorter: true,
      align: 'center',
      render: function (data) {
        return (
          <TenantLink to={''}>{data}</TenantLink>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Account Admins' }),
      dataIndex: 'mspEcAdminCount',
      key: 'mspEcAdminCount',
      sorter: true,
      align: 'center'
    },
    {
      title: $t({ defaultMessage: 'Active Incidents' }),
      dataIndex: 'activeIncidents',
      key: 'activeIncidents',
      sorter: true,
      align: 'center',
      render: function () {
        return '0'
      }
    },
    {
      title: $t({ defaultMessage: 'Tenant Id' }),
      dataIndex: 'id',
      key: 'id',
      sorter: true
    }
  ]
  return columns
}

const transformAssignedCustomerCount = (row: MspEc) => {
  return row.assignedMspEcList.length
}

const defaultPayload = {
  searchString: '',
  filters: { tenantType: ['MSP_INTEGRATOR', 'MSP_INSTALLER'] },
  fields: [
    'check-all',
    'id',
    'name',
    'tenantType',
    'mspAdminCount',
    'mspEcAdminCount',
    'wifiLicense',
    'switchLicens'
  ]
}

export function Integrators () {
  const { $t } = useIntl()

  const IntegratorssTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload
    })
    const [
      deleteMspEc,
      { isLoading: isDeleteEcUpdating }
    ] = useDeleteMspEcMutation()

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Manage' }),
        onClick: (selectedRows) =>
          showToast({
            type: 'info',
            content: `Manage ${selectedRows[0].name}`
          })
      },
      {
        label: $t({ defaultMessage: 'Resend Invitation Email' }),
        onClick: () => alert()
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        onClick: ([{ name, id }], clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Integrator' }),
              entityValue: name,
              confirmationText: $t({ defaultMessage: 'Delete' })
            },
            onOk: () => deleteMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      }
    ]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteEcUpdating }]}>
        <Table
          columns={useColumns()}
          rowActions={rowActions}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          rowKey='id'
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Integrators' })}
        extra={[
          <TenantLink to='/dashboard' key='ownAccount'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>,
          <TenantLink to='/integrators/create' tenantType='v' key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Integrator' })}</Button>
          </TenantLink>,
          <Button key='download' icon={<DownloadOutlined />} />
        ]}
      />
      <IntegratorssTable />
    </>
  )
}
