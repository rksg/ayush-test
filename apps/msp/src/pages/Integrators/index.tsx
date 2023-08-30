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
  ResendInviteModal,
  ManageAdminsDrawer
} from '@acx-ui/msp/components'
import {
  useDeleteMspEcMutation,
  useMspCustomerListQuery,
  useCheckDelegateAdmin,
  useGetMspLabelQuery
} from '@acx-ui/msp/services'
import {
  MspEc
} from '@acx-ui/msp/utils'
import { useTableQuery }                                                          from '@acx-ui/rc/utils'
import { Link, TenantLink, MspTenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                              from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess }             from '@acx-ui/user'
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
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const params = useParams()

  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerEcVisible, setDrawerEcVisible] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [tenantType, setTenantType] = useState('')
  const { data: userProfile } = useUserProfileContext()
  const { data: mspLabel } = useGetMspLabelQuery({ params })
  const { checkDelegateAdmin } = useCheckDelegateAdmin()
  const onBoard = mspLabel?.msp_label

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend' as SortOrder,
      onCell: (data) => {
        return {
          onClick: () => { checkDelegateAdmin(data.id, userProfile!.adminId) }
        }
      },
      render: function (_, { name }, __, highlightFn) {
        return (
          <Link to=''>{highlightFn(name)}</Link>
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Type' }),
      dataIndex: 'tenantType',
      key: 'tenantType',
      sorter: true,
      render: function (_, row) {
        return row.tenantType === AccountType.MSP_INTEGRATOR
          ? $t({ defaultMessage: 'Integrator' }) : $t({ defaultMessage: 'Installer' })
      }
    },
    {
      title: $t({ defaultMessage: 'MSP Admin Count' }),
      dataIndex: 'mspAdminCount',
      align: 'center',
      key: 'mspAdminCount',
      sorter: true,
      onCell: (data) => {
        return (isPrimeAdmin || isAdmin) ? {
          onClick: () => {
            setTenantId(data.id)
            setDrawerAdminVisible(true)
          }
        } : {}
      },
      render: function (_, { mspAdminCount }) {
        return (
          (isPrimeAdmin || isAdmin) ? <Link to=''>{mspAdminCount}</Link> : mspAdminCount
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Assigned Customers Count' }),
      dataIndex: 'assignedMspEcList',
      align: 'center',
      key: 'assignedMspEcList',
      sorter: true,
      onCell: (data) => {
        return (isPrimeAdmin || isAdmin) ? {
          onClick: () => {
            setTenantId(data.id)
            setTenantType(data.tenantType)
            if (!drawerEcVisible) setDrawerEcVisible(true)
          }
        } : {}
      },
      render: function (_, row) {
        return (isPrimeAdmin || isAdmin)
          ? <Link to=''>{transformAssignedCustomerCount(row)}</Link>
          : transformAssignedCustomerCount(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Account Admin Count' }),
      dataIndex: 'mspEcAdminCount',
      align: 'center',
      key: 'mspEcAdminCount',
      sorter: true,
      show: false
    },
    {
      title: $t({ defaultMessage: 'Tenant ID' }),
      dataIndex: 'id',
      key: 'id',
      sorter: true
    }
  ]

  const IntegratorssTable = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [selTenantId, setSelTenantId] = useState('')
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
          setSelTenantId(selectedRows[0].id)
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
              entityName: $t({ defaultMessage: 'Tech Partner' }),
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
          settingsId='msp-integrators-table'
          columns={columns}
          rowActions={filterByAccess(rowActions)}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
          rowSelection={hasAccess() && { type: 'radio' }}
        />
        {modalVisible && <ResendInviteModal
          visible={modalVisible}
          setVisible={setModalVisible}
          tenantId={selTenantId}
        />}
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'Tech Partners' })}
        extra={isAdmin ?
          [
            <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink>,
            <MspTenantLink to='/integrators/create'>
              <Button
                hidden={!onBoard}
                type='primary'>{$t({ defaultMessage: 'Add Tech Partner' })}</Button>
            </MspTenantLink>
          ]
          : [<TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
          ]}
      />
      <IntegratorssTable />
      {drawerAdminVisible && <ManageAdminsDrawer
        visible={drawerAdminVisible}
        setVisible={setDrawerAdminVisible}
        setSelected={() => {}}
        tenantId={tenantId}
      />}
      {drawerEcVisible && <AssignEcDrawer
        visible={drawerEcVisible}
        setVisible={setDrawerEcVisible}
        setSelected={() => {}}
        tenantId={tenantId}
        tenantType={tenantType}
      />}
    </>
  )
}
