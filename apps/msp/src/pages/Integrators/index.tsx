import { useState } from 'react'

import { SortOrder } from 'antd/lib/table/interface'
import { useIntl }   from 'react-intl'

import {
  Button,
  PageHeader,
  showActionModal,
  Table,
  TableProps,
  Loader
} from '@acx-ui/components'
import {
  AssignEcDrawer,
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
import { getBasePath, Link, TenantLink, MspTenantLink, useNavigate, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                from '@acx-ui/types'
import { filterByAccess }                                                           from '@acx-ui/user'
import { hasRoles }                                                                 from '@acx-ui/user'
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
  ],
  searchTargetFields: ['name']
}

export function Integrators () {
  const { $t } = useIntl()
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const [drawerEcVisible, setDrawerEcVisible] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [tenantType, setTenantType] = useState('')

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
      sorter: true,
      render: function (data, row) {
        return row.tenantType === AccountType.MSP_INTEGRATOR
          ? $t({ defaultMessage: 'Integrator' }) : $t({ defaultMessage: 'Installer' })
      }
    },
    {
      title: $t({ defaultMessage: 'Customers Assigned' }),
      dataIndex: 'assignedMspEcList',
      key: 'assignedMspEcList',
      sorter: true,
      onCell: (data) => {
        return {
          onClick: () => {
            setTenantId(data.id)
            setTenantType(data.tenantType)
            if (!drawerEcVisible) setDrawerEcVisible(true)
          }
        }
      },
      render: function (data, row) {
        return <Link to=''>{transformAssignedCustomerCount(row)}</Link>
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admins' }),
      dataIndex: 'mspAdminCount',
      key: 'mspAdminCount',
      sorter: true
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
    const navigate = useNavigate()
    const basePath = useTenantLink('/integrators/edit', 'v')
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload,
      search: {
        searchTargetFields: defaultPayload.searchTargetFields as string[]
      }
    })
    const [
      deleteMspEc,
      { isLoading: isDeleteEcUpdating }
    ] = useDeleteMspEcMutation()

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        onClick: (selectedRows) => {
          setTenantId(selectedRows[0].id)
          const type = selectedRows[0].tenantType
          navigate({
            ...basePath,
            pathname: `${basePath.pathname}/${type}/${selectedRows[0].id}`
          })
        }
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
          rowActions={filterByAccess(rowActions)}
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
        extra={isAdmin ?
          [
            <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
            </TenantLink>,
            <MspTenantLink to='/integrators/create'>
              <Button type='primary'>{$t({ defaultMessage: 'Add Integrator' })}</Button>
            </MspTenantLink>
          ]
          : [<TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage own account' })}</Button>
          </TenantLink>
          ]}
      />
      <IntegratorssTable />
      {setDrawerEcVisible && <AssignEcDrawer
        visible={drawerEcVisible}
        setVisible={setDrawerEcVisible}
        tenantId={tenantId}
        tenantType={tenantType}
      />}
      <ResendInviteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        tenantId={tenantId}
      />
    </>
  )
}
