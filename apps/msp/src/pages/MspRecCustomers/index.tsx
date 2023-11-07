import { useState, useEffect } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import {
  ManageAdminsDrawer,
  SelectIntegratorDrawer
} from '@acx-ui/msp/components'
import {
  useDeleteMspEcMutation,
  useMspCustomerListQuery,
  useSupportMspCustomerListQuery,
  useGetMspLabelQuery,
  useIntegratorCustomerListQuery,
  useDelegateToMspEcPath,
  useCheckDelegateAdmin
} from '@acx-ui/msp/services'
import {
  MspEc,
  MSPUtils
} from '@acx-ui/msp/utils'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  EntitlementNetworkDeviceType,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, MspTenantLink, useNavigate, useTenantLink, useParams, TenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                              from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess }             from '@acx-ui/user'
import { AccountType }                                                            from '@acx-ui/utils'

import { AssignEcMspAdminsDrawer } from '../MspCustomers/AssignEcMspAdminsDrawer'

const getStatus = (row: MspEc) => {
  const isTrial = row.accountType === 'TRIAL'
  const value = row.status === 'Active' ? (isTrial ? 'Trial' : row.status) : 'Inactive'
  return value
}

export function MspRecCustomers () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const edgeEnabled = useIsTierAllowed(Features.EDGES)
  const isAssignMultipleEcEnabled = useIsSplitOn(Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS)
     && isPrimeAdmin
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT)
  const MAX_ALLOWED_SELECTED_EC = 200

  const [ecTenantId, setTenantId] = useState('')
  const [tenantType, setTenantType] = useState(AccountType.MSP_INTEGRATOR)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [techParnersData, setTechPartnerData] = useState([] as MspEc[])

  const { data: userProfile } = useUserProfileContext()
  const { data: mspLabel } = useGetMspLabelQuery({ params })
  const [deleteMspEc, { isLoading: isDeleteEcUpdating }] = useDeleteMspEcMutation()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const { checkDelegateAdmin } = useCheckDelegateAdmin()
  const linkVarPath = useTenantLink('/dashboard/varCustomers/', 'v')
  const mspUtils = MSPUtils()

  const onBoard = mspLabel?.msp_label
  const ecFilters = isPrimeAdmin
    ? { tenantType: [AccountType.MSP_REC] }
    : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_REC] }

  const transformTechPartner = (id: string) => {
    const rec = techParnersData.find(e => e.id === id)
    return rec?.name ? rec.name : id
  }

  const transformAdminCount = (data: MspEc) => {
    const type = tenantDetailsData.data?.tenantType
    return type === AccountType.MSP_INSTALLER
      ? data.mspInstallerAdminCount || 0 : (type === AccountType.MSP_INTEGRATOR
        ? data.mspIntegratorAdminCount || 0 : data.mspAdminCount || 0)
  }

  const transformAdminCountHeader = () => {
    const type = tenantDetailsData.data?.tenantType
    return type === AccountType.MSP_INSTALLER
      ? $t({ defaultMessage: 'Installer Admin Count' })
      : (type === AccountType.MSP_INTEGRATOR
        ? $t({ defaultMessage: 'Integrator Admin Count' })
        : $t({ defaultMessage: 'MSP Admin Count' }))
  }

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const isIntegrator =
    (tenantDetailsData.data?.tenantType === AccountType.MSP_INSTALLER ||
     tenantDetailsData.data?.tenantType === AccountType.MSP_INTEGRATOR)
  const parentTenantid = tenantDetailsData.data?.mspEc?.parentMspId
  if (tenantDetailsData.data?.tenantType === AccountType.VAR &&
      userProfile?.support === false) {
    navigate(linkVarPath, { replace: true })
  }

  const { data: techPartners } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    pagination: {
      pageSize: 10000
    },
    defaultPayload: {
      filters: { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] },
      fields: [
        'id',
        'name'
      ],
      sortField: 'name',
      sortOrder: 'ASC'
    }
  })

  useEffect(() => {
    if (techPartners?.data) {
      setTechPartnerData(techPartners?.data)
    }
  }, [techPartners?.data])

  const mspPayload = {
    searchString: '',
    filters: ecFilters,
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicense',
      'streetAddress'
    ],
    searchTargetFields: ['name']
  }

  const integratorPayload = {
    searchString: '',
    filters: {
      mspTenantId: [parentTenantid],
      tenantType: [AccountType.MSP_REC]
    },
    fields: [
      'check-all',
      'id',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'mspInstallerAdminCount',
      'mspIntegratorAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicense',
      'streetAddress'
    ],
    searchTargetFields: ['name']
  }

  const supportPayload = {
    searchString: '',
    fields: [
      'check-all',
      'id',
      'mspName',
      'name',
      'tenantType',
      'status',
      'alarmCount',
      'mspAdminCount',
      'mspEcAdminCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicense',
      'streetAddress'
    ],
    searchTargetFields: ['name'],
    filters: {
      includeExpired: [false]
    }
  }

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Customers' }),
      dataIndex: 'name',
      key: 'name',
      searchable: true,
      sorter: true,
      defaultSortOrder: 'ascend',
      onCell: (data) => {
        return (data.status === 'Active') ? {
          onClick: () => {
            userProfile?.support
              ? delegateToMspEcPath(data.id)
              : checkDelegateAdmin(data.id, userProfile!.adminId)
          }
        } : {}
      },
      render: function (_, row, __, highlightFn) {
        return (
          (row.status === 'Active') ? <Link to=''>{highlightFn(row.name)}</Link> : row.name
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: function (_, row) {
        return getStatus(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Address' }),
      dataIndex: 'streetAddress',
      key: 'streetAddress',
      sorter: true
    },
    {
      title: transformAdminCountHeader(),
      dataIndex: 'mspAdminCount',
      align: 'center',
      key: 'mspAdminCount',
      sorter: true,
      onCell: (data) => {
        return (isPrimeAdmin || isAdmin) && !userProfile?.support ? {
          onClick: () => {
            setTenantId(data.id)
            setDrawerAdminVisible(true)
          }
        } : {}
      },
      render: function (_, row) {
        return (
          (isPrimeAdmin || isAdmin) && !userProfile?.support
            ? <Link to=''>{transformAdminCount(row)}</Link> : transformAdminCount(row)
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Customer Admin Count' }),
      dataIndex: 'mspEcAdminCount',
      align: 'center',
      key: 'mspEcAdminCount',
      sorter: true,
      show: false
    },
    ...(isIntegrator || userProfile?.support ? [] : [{
      title: $t({ defaultMessage: 'Integrator' }),
      dataIndex: 'integrator',
      key: 'integrator',
      onCell: (data: MspEc) => {
        return (isPrimeAdmin || isAdmin) && !drawerIntegratorVisible ? {
          onClick: () => {
            setTenantId(data.id)
            setTenantType(AccountType.MSP_INTEGRATOR)
            setDrawerIntegratorVisible(true)
          }
        } : {}
      },
      render: function (_: React.ReactNode, row: MspEc) {
        const val = row?.integrator ? transformTechPartner(row.integrator) : '--'
        return (
          (isPrimeAdmin || isAdmin) && !drawerIntegratorVisible
            ? <Link to=''>{val}</Link> : val
        )
      }
    }]),
    ...(isIntegrator || userProfile?.support ? [] : [{
      title: $t({ defaultMessage: 'Installer' }),
      dataIndex: 'installer',
      key: 'installer',
      onCell: (data: MspEc) => {
        return (isPrimeAdmin || isAdmin) && !drawerIntegratorVisible ? {
          onClick: () => {
            setDrawerIntegratorVisible(false)
            setTenantId(data.id)
            setTenantType(AccountType.MSP_INSTALLER)
            setDrawerIntegratorVisible(true)
          }
        } : {}
      },
      render: function (_: React.ReactNode, row: MspEc) {
        const val = row?.installer ? transformTechPartner(row.installer) : '--'
        return (
          (isPrimeAdmin || isAdmin) && !drawerIntegratorVisible
            ? <Link to=''>{val}</Link> : val
        )
      }
    }]),
    ...(isDeviceAgnosticEnabled ? [
      {
        title: $t({ defaultMessage: 'Installed Devices' }),
        dataIndex: 'apswLicenseInstalled',
        key: 'apswLicenseInstalled',
        sorter: true,
        render: function (_: React.ReactNode, row: MspEc) {
          return mspUtils.transformInstalledDevice(row.entitlements)
        }
      },
      {
        title: $t({ defaultMessage: 'Assigned Device Subscriptions' }),
        dataIndex: 'apswLicense',
        key: 'apswLicense',
        sorter: true,
        render: function (data: React.ReactNode, row: MspEc) {
          return mspUtils.transformDeviceEntitlement(row.entitlements)
        }
      },
      {
        title: $t({ defaultMessage: 'Device Subscriptions Utilization' }),
        dataIndex: 'apswLicensesUtilization',
        key: 'apswLicensesUtilization',
        sorter: true,
        render: function (data: React.ReactNode, row: MspEc) {
          return mspUtils.transformDeviceUtilization(row.entitlements)
        }
      }
    ] : [
      {
        title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
        dataIndex: 'wifiLicense',
        key: 'wifiLicense',
        sorter: true,
        render: function (data: React.ReactNode, row: MspEc) {
          return mspUtils.transformApEntitlement(row)
        }
      },
      {
        title: $t({ defaultMessage: 'Wi-Fi License Utilization' }),
        dataIndex: 'wifiLicensesUtilization',
        key: 'wifiLicensesUtilization',
        sorter: true,
        render: function (data: React.ReactNode, row: MspEc) {
          return mspUtils.transformUtilization(row, EntitlementNetworkDeviceType.WIFI)
        }
      },
      {
        title: $t({ defaultMessage: 'Switch Licenses' }),
        dataIndex: 'switchLicense',
        key: 'switchLicense',
        sorter: true,
        render: function (data: React.ReactNode, row: MspEc) {
          return mspUtils.transformSwitchEntitlement(row)
        }
      },
      {
        title: $t({ defaultMessage: 'SmartEdge Licenses' }),
        dataIndex: 'edgeLicenses',
        key: 'edgeLicenses',
        sorter: true,
        show: edgeEnabled,
        render: function (data: React.ReactNode, row: MspEc) {
          return row?.edgeLicenses ? row?.edgeLicenses : 0
        }
      }]),
    {
      title: $t({ defaultMessage: 'Active From' }),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: function (_, row) {
        return mspUtils.transformCreationDate(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Service Expires On' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (_, row) {
        return mspUtils.transformExpirationDate(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Tenant ID' }),
      dataIndex: 'id',
      key: 'id',
      show: false,
      sorter: true
    }
  ]

  const MspEcTable = () => {
    const [drawerAssignEcMspAdminsVisible, setDrawerAssignEcMspAdminsVisible] = useState(false)
    const [selEcTenantIds, setSelEcTenantIds] = useState([] as string[])
    const basePath = useTenantLink('/dashboard/mspRecCustomers/edit', 'v')
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload: mspPayload,
      search: {
        searchTargetFields: mspPayload.searchTargetFields as string[]
      }
    })
    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        visible: (selectedRows) => {
          return (selectedRows.length === 1)
        },
        onClick: (selectedRows) => {
          const status = selectedRows[0].accountType === 'TRIAL' ? 'Trial' : 'Paid'
          navigate({
            ...basePath,
            pathname: `${basePath.pathname}/${status}/${selectedRows[0].id}`
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Assign MSP Administrators' }),
        visible: (selectedRows) => {
          const len = selectedRows.length
          return (isAssignMultipleEcEnabled && len >= 1 && len <= MAX_ALLOWED_SELECTED_EC)
        },
        onClick: (selectedRows) => {
          const selectedEcIds = selectedRows.map(item => item.id)
          setSelEcTenantIds(selectedEcIds)
          setDrawerAssignEcMspAdminsVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        visible: (selectedRows) => {
          return (selectedRows.length === 1)
        },
        onClick: ([{ name, id }], clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'EC' }),
              entityValue: name,
              confirmationText: $t({ defaultMessage: 'Delete' })
            },
            onOk: () => deleteMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteEcUpdating }]}>
        <Table
          settingsId='msp-customers-table'
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: isAssignMultipleEcEnabled ? 'checkbox' : 'radio' }}
        />
        {drawerAssignEcMspAdminsVisible && <AssignEcMspAdminsDrawer
          visible={drawerAssignEcMspAdminsVisible}
          tenantIds={selEcTenantIds}
          setVisible={setDrawerAssignEcMspAdminsVisible}
          setSelected={() => {}}
        />}
      </Loader>
    )
  }

  const IntegratorTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useIntegratorCustomerListQuery,
      defaultPayload: integratorPayload,
      search: {
        searchTargetFields: integratorPayload.searchTargetFields as string[]
      }
    })

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }]}>
        <Table
          settingsId='integrator-customers-table'
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  const SupportEcTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useSupportMspCustomerListQuery,
      defaultPayload: supportPayload,
      search: {
        searchTargetFields: supportPayload.searchTargetFields as string[]
      }
    })

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }]}>
        <Table
          settingsId='support-ec-table'
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
        />
      </Loader>
    )
  }

  return (
    <>
      <PageHeader
        title={$t({ defaultMessage: 'RUCKUS End Customers' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'My Customers' }) }]}
        extra={isAdmin ?
          [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null,
            <MspTenantLink to='/dashboard/mspreccustomers/create'>
              <Button
                hidden={userProfile?.support || !onBoard}
                type='primary'>{$t({ defaultMessage: 'Add Customer' })}</Button>
            </MspTenantLink>
          ]
          : [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null
          ]}
      />
      {userProfile?.support && <SupportEcTable />}
      {!userProfile?.support && !isIntegrator && <MspEcTable />}
      {!userProfile?.support && isIntegrator && <IntegratorTable />}
      {drawerAdminVisible && <ManageAdminsDrawer
        visible={drawerAdminVisible}
        setVisible={setDrawerAdminVisible}
        setSelected={() => {}}
        tenantId={ecTenantId}
      />}
      {drawerIntegratorVisible && <SelectIntegratorDrawer
        visible={drawerIntegratorVisible}
        tenantId={ecTenantId}
        tenantType={tenantType}
        setVisible={setDrawerIntegratorVisible}
        setSelected={() => {}}
      />}
    </>
  )
}
