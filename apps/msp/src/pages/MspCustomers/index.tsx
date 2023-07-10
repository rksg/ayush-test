import { useState, useEffect } from 'react'

import moment      from 'moment-timezone'
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
import { DateFormatEnum, formatter }                from '@acx-ui/formatter'
import {
  ManageAdminsDrawer,
  ResendInviteModal,
  SelectIntegratorDrawer
} from '@acx-ui/msp/components'
import {
  useDeactivateMspEcMutation,
  useDeleteMspEcMutation,
  useReactivateMspEcMutation,
  useMspCustomerListQuery,
  useSupportMspCustomerListQuery,
  useGetMspLabelQuery,
  useIntegratorCustomerListQuery,
  useGetTenantDetailsQuery,
  useDelegateToMspEcPath,
  useCheckDelegateAdmin
} from '@acx-ui/rc/services'
import {
  DelegationEntitlementRecord,
  EntitlementNetworkDeviceType,
  MspEc,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, MspTenantLink, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                              from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess }             from '@acx-ui/user'
import { AccountType }                                                            from '@acx-ui/utils'

const getStatus = (row: MspEc) => {
  const isTrial = row.accountType === 'TRIAL'
  const value = row.status === 'Active' ? (isTrial ? 'Trial' : row.status) : 'Inactive'
  return value
}

const transformApEntitlement = (row: MspEc) => {
  return row.wifiLicenses ? row.wifiLicenses : 0
}

const transformApUtilization = (row: MspEc) => {
  const entitlement = row.entitlements.filter((en:DelegationEntitlementRecord) =>
    en.entitlementDeviceType === EntitlementNetworkDeviceType.WIFI)
  if (entitlement.length > 0) {
    const apEntitlement = entitlement[0]
    const quantity = parseInt(apEntitlement.quantity, 10)
    const consumed = parseInt(apEntitlement.consumed, 10)
    if (quantity > 0) {
      const value =
      (Math.round(((consumed / quantity) * 10000)) / 100) + '%'
      return value
    } else {
      return '0%'
    }
  }
  return '0%'
}

const transformSwitchEntitlement = (row: MspEc) => {
  return row.switchLicenses ? row.switchLicenses : 0
}

const transformCreationDate = (row: MspEc) => {
  const creationDate = row.creationDate
  if (!creationDate || isNaN(creationDate)) {
    return ''
  }
  const Epoch = creationDate - (creationDate % 1000)
  const activeDate = formatter(DateFormatEnum.DateFormat)(Epoch)
  return activeDate
}

const transformExpirationDate = (row: MspEc) => {
  let expirationDate = '--'
  const entitlements = row.entitlements
  let target: DelegationEntitlementRecord
  entitlements.forEach((entitlement:DelegationEntitlementRecord) => {
    target = entitlement
    const consumed = parseInt(entitlement.quantity, 10)
    const quantity = parseInt(entitlement.quantity, 10)
    if (consumed > 0 || quantity > 0) {
      if (!target || moment(entitlement.expirationDate).isBefore(target.expirationDate)) {
        target = entitlement
      }
    }
    expirationDate = formatter(DateFormatEnum.DateFormat)(target.expirationDate)
  })
  return expirationDate
}

export function MspCustomers () {
  const { $t } = useIntl()
  const edgeEnabled = useIsTierAllowed(Features.EDGES)
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const params = useParams()
  const isNavbarEnhanced = useIsSplitOn(Features.NAVBAR_ENHANCEMENT)

  const [modalVisible, setModalVisible] = useState(false)
  const [ecTenantId, setTenantId] = useState('')
  const [tenantType, setTenantType] = useState(AccountType.MSP_INTEGRATOR)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [techParnersData, setTechPartnerData] = useState([] as MspEc[])

  const { data: userProfile } = useUserProfileContext()
  const { data: mspLabel } = useGetMspLabelQuery({ params })
  const [deactivateMspEc] = useDeactivateMspEcMutation()
  const [reactivateMspEc] = useReactivateMspEcMutation()
  const [deleteMspEc, { isLoading: isDeleteEcUpdating }] = useDeleteMspEcMutation()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const { checkDelegateAdmin } = useCheckDelegateAdmin()

  const onBoard = mspLabel?.msp_label
  const ecFilters = isPrimeAdmin
    ? { tenantType: [AccountType.MSP_EC] }
    : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_EC] }

  const transformTechPartner = (id: string) => {
    const rec = techParnersData.find(e => e.id === id)
    return rec?.name ? rec.name : id
  }

  const transformAdminCount = (data: MspEc) => {
    if (data?.mspInstallerAdminCount)
      return data.mspInstallerAdminCount
    else if (data?.mspIntegratorAdminCount)
      return data.mspIntegratorAdminCount
    return data.mspAdminCount
  }

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const isIntegrator =
    (tenantDetailsData.data?.tenantType === AccountType.MSP_INSTALLER ||
     tenantDetailsData.data?.tenantType === AccountType.MSP_INTEGRATOR)
  const parentTenantid = tenantDetailsData.data?.mspEc?.parentMspId

  const { data: techPartners } = useTableQuery({
    useQuery: useMspCustomerListQuery,
    defaultPayload: {
      filters: { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] },
      fields: [
        'id',
        'name'
      ],
      pageSize: 10000,
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
      tenantType: [AccountType.MSP_INSTALLER, AccountType.MSP_INTEGRATOR]
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
      render: function (data, row, _, highlightFn) {
        return (
          (row.status === 'Active') ? <Link to=''>{highlightFn(data as string)}</Link> : data
        )
      }
    },
    {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      render: function (data, row) {
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
      title: $t({ defaultMessage: 'MSP Admin Count' }),
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
      render: function (data, row) {
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
      render: function (data: React.ReactNode, row: MspEc) {
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
      render: function (data: React.ReactNode, row: MspEc) {
        const val = row?.installer ? transformTechPartner(row.installer) : '--'
        return (
          (isPrimeAdmin || isAdmin) && !drawerIntegratorVisible
            ? <Link to=''>{val}</Link> : val
        )
      }
    }]),
    {
      title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
      dataIndex: 'wifiLicense',
      key: 'wifiLicense',
      align: 'center',
      sorter: true,
      render: function (data, row) {
        return transformApEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Wi-Fi License Utilization' }),
      dataIndex: 'wifiLicensesUtilization',
      align: 'center',
      key: 'wifiLicensesUtilization',
      sorter: true,
      render: function (data, row) {
        return transformApUtilization(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Switch Licenses' }),
      dataIndex: 'switchLicense',
      align: 'center',
      key: 'switchLicense',
      sorter: true,
      render: function (data, row) {
        return transformSwitchEntitlement(row)
      }
    },
    {
      title: $t({ defaultMessage: 'SmartEdge Licenses' }),
      dataIndex: 'edgeLicenses',
      align: 'center',
      key: 'edgeLicenses',
      sorter: true,
      show: edgeEnabled,
      render: function (data, row) {
        return row?.edgeLicenses ? row?.edgeLicenses : 0
      }
    },
    {
      title: $t({ defaultMessage: 'Active From' }),
      dataIndex: 'creationDate',
      key: 'creationDate',
      sorter: true,
      render: function (data, row) {
        return transformCreationDate(row)
      }
    },
    {
      title: $t({ defaultMessage: 'Service Expires On' }),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      sorter: true,
      render: function (data, row) {
        return transformExpirationDate(row)
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
    const navigate = useNavigate()
    const basePath = useTenantLink('/dashboard/mspcustomers/edit', 'v')
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
        onClick: (selectedRows) => {
          setTenantId(selectedRows[0].id)
          const status = selectedRows[0].accountType === 'TRIAL' ? 'Trial' : 'Paid'
          navigate({
            ...basePath,
            pathname: `${basePath.pathname}/${status}/${selectedRows[0].id}`
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
        label: $t({ defaultMessage: 'Deactivate' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].status === 'Active' && selectedRows[0].accountType !== 'TRIAL' )) {
            return true
          }
          return false
        },
        onClick: ([{ name, id }], clearSelection) => {
          const title = $t(
            { defaultMessage: 'Deactivate Customer "{formattedName}"?' },
            { formattedName: name }
          )

          showActionModal({
            type: 'confirm',
            title: title,
            content: $t({
              defaultMessage: `
                Deactivate "{formattedName}" will suspend all its services,
                are you sure you want to proceed?
              `
            }, { formattedName: name }),
            okText: $t({ defaultMessage: 'Deactivate' }),
            onOk: () => deactivateMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Reactivate' }),
        visible: (selectedRows) => {
          if(selectedRows[0] &&
            (selectedRows[0].status === 'Active' || selectedRows[0].accountType === 'TRIAL')) {
            return false
          }
          return true
        },
        onClick: ([{ name, id }], clearSelection) => {
          const title = $t(
            { defaultMessage: 'Reactivate Customer "{formattedName}"?' },
            { formattedName: name }
          )

          showActionModal({
            type: 'confirm',
            title: title,
            content: $t(
              { defaultMessage: 'Reactivate this customer "{formattedName}"?' },
              { formattedName: name }
            ),
            okText: $t({ defaultMessage: 'Reactivate' }),
            onOk: () => reactivateMspEc({ params: { mspEcTenantId: id } })
              .then(clearSelection)
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
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
          rowSelection={hasAccess() && { type: 'radio' }}
        />
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
        title={$t({ defaultMessage: 'MSP Customers' })}
        breadcrumb={isNavbarEnhanced
          ? [{ text: $t({ defaultMessage: 'My Customers' }) }]
          : undefined}
        extra={isAdmin ?
          [<TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>,
          <MspTenantLink to='/dashboard/mspcustomers/create'>
            <Button
              hidden={userProfile?.support || !onBoard}
              type='primary'>{$t({ defaultMessage: 'Add Customer' })}</Button>
          </MspTenantLink>
          ]
          : [<TenantLink to='/dashboard'>
            <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
          </TenantLink>
          ]}
      />
      {userProfile?.support && <SupportEcTable />}
      {!userProfile?.support && !isIntegrator && <MspEcTable />}
      {!userProfile?.support && isIntegrator && <IntegratorTable />}
      {modalVisible && <ResendInviteModal
        visible={modalVisible}
        setVisible={setModalVisible}
        tenantId={ecTenantId}
      />}
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
