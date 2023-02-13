import { useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import {
  Button,
  DisabledButton,
  PageHeader,
  showActionModal,
  showToast,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import {
  ResendInviteModal
} from '@acx-ui/msp/components'
import {
  useDeleteMspEcMutation,
  useMspCustomerListQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery,
  MspEc
} from '@acx-ui/rc/utils'
import { getBasePath, Link, TenantLink, MspTenantLink } from '@acx-ui/react-router-dom'
import {
  AccountType
} from '@acx-ui/utils'

const transformAssignedCustomerCount = (row: MspEc) => {
  return row.assignedMspEcList.length
}

const defaultPayload = {
  searchString: '',
  filters: { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] },
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

  const [modalVisible, setModalVisible] = useState(false)
  const [tenantId, setTenantId] = useState('')

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend' as SortOrder,
      render: function (data, row, _, highlightFn) {
        const to = `${getBasePath()}/t/${row.id}`
        return (
          <Link to={to}>{highlightFn(data as string)}</Link>
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
      render: function (data, row) {
        return transformAssignedCustomerCount(row)
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admins' }),
      dataIndex: 'mspAdminCount',
      key: 'mspAdminCount',
      sorter: true,
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
      sorter: true
    },
    {
      title: $t({ defaultMessage: 'Active Incidents' }),
      dataIndex: 'activeIncidents',
      key: 'activeIncidents',
      sorter: true,
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
        onClick: (selectedRows) => {
          setTenantId(selectedRows[0].id)
          setModalVisible(true)
        }
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
          columns={columns}
          rowActions={rowActions}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
          rowSelection={{ type: 'radio' }}
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: '3rd Party' })}
        extra={[
          <TenantLink to='/dashboard' key='ownAccount'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>,
          <MspTenantLink to='/integrators/create' key='add'>
            <Button type='primary'>{$t({ defaultMessage: 'Add Integrator' })}</Button>
          </MspTenantLink>,
          <DisabledButton key='download' icon={<DownloadOutlined />} />
        ]}
      />
      <IntegratorssTable />
      <ResendInviteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        tenantId={tenantId}
      />
    </>
  )
}
