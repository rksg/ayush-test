import { useState, useEffect, useContext } from 'react'

import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import {
  ManageAdminsDrawer,
  ManageDelegateAdminDrawer,
  SelectIntegratorDrawer,
  ManageMspDelegationDrawer
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
  MspRbacUrlsInfo,
  MSPUtils
} from '@acx-ui/msp/utils'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, MspTenantLink, useNavigate, useTenantLink, useParams, TenantLink }                           from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                                        from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess, getUserProfile, hasAllowedOperations } from '@acx-ui/user'
import { AccountType, getOpsApi, noDataDisplay }                                                            from '@acx-ui/utils'

import HspContext                  from '../../HspContext'
import { AssignEcMspAdminsDrawer } from '../MspCustomers/AssignEcMspAdminsDrawer'

export function MspRecCustomers () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const MAX_ALLOWED_SELECTED_EC = 200

  const [ecTenantId, setTenantId] = useState('')
  const [selectedTenantType, setTenantType] = useState(AccountType.MSP_INTEGRATOR)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [techParnersData, setTechPartnerData] = useState([] as MspEc[])
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isvViewModelTpLoginEnabled = useIsSplitOn(Features.VIEWMODEL_TP_LOGIN_ADMIN_COUNT)
  const isMspSortOnTpEnabled = useIsSplitOn(Features.MSP_SORT_ON_TP_COUNT_TOGGLE)
  const isRbacPhase2Enabled = useIsSplitOn(Features.RBAC_PHASE2_TOGGLE)

  const { data: userProfile } = useUserProfileContext()
  const { data: mspLabel } = useGetMspLabelQuery({ params, enableRbac: isRbacEnabled })
  const [deleteMspEc, { isLoading: isDeleteEcUpdating }] = useDeleteMspEcMutation()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const { checkDelegateAdmin } = useCheckDelegateAdmin(isRbacEnabled)
  const linkVarPath = useTenantLink('/dashboard/varCustomers/', 'v')
  const mspUtils = MSPUtils()
  const { rbacOpsApiEnabled } = getUserProfile()
  const isAssignMultipleEcEnabled = useIsSplitOn(Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS) &&
    (rbacOpsApiEnabled ? true : isPrimeAdmin)
  const hasAddPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.addBrandCustomers)]) : isAdmin
  const hasAssignAdminPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.updateMspEcDelegations)]) : isAdmin
  const hasAssignTechPartnerPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.assignMspEcToMultiIntegrators)]) : isAdmin

  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state

  const onBoard = mspLabel?.msp_label
  const ecFilters = isPrimeAdmin
    ? { tenantType: [AccountType.MSP_REC] }
    : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_REC] }

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const tenantType = tenantDetailsData.data?.tenantType
  const isIntegrator =
    (tenantType === AccountType.MSP_INSTALLER ||
     tenantType === AccountType.MSP_INTEGRATOR)
  const parentTenantid = tenantDetailsData.data?.mspEc?.parentMspId
  if (tenantType === AccountType.VAR &&
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

  const techPartnerAssignEcsEanbled = useIsSplitOn(Features.TECH_PARTNER_ASSIGN_ECS)

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
      'integratorCount',
      'installerCount',
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

  const mspAdminCountIndex = isvViewModelTpLoginEnabled ?
    (tenantType === AccountType.MSP_INTEGRATOR ? 'mspIntegratorAdminCount'
      : (tenantType === AccountType.MSP_INSTALLER ? 'mspInstallerAdminCount'
        : 'mspAdminCount' )) : 'mspAdminCount'

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
      width: 80,
      render: function (_, row) {
        return $t(mspUtils.getStatus(row))
      }
    },
    {
      title: $t({ defaultMessage: '{adminCountHeader}' }, { adminCountHeader:
        mspUtils.transformAdminCountHeader(tenantType) }),
      dataIndex: mspAdminCountIndex,
      align: 'center',
      key: mspAdminCountIndex,
      sorter: true,
      width: 140,
      onCell: (data) => {
        return (hasAssignAdminPermission && !userProfile?.support) ? {
          onClick: () => {
            setTenantId(data.id)
            setDrawerAdminVisible(true)
          }
        } : {}
      },
      render: function (_, row) {
        return (
          (hasAssignAdminPermission && !userProfile?.support)
            ? <Link to=''>{mspUtils.transformAdminCount(row, tenantType)}</Link>
            : mspUtils.transformAdminCount(row, tenantType)
        )
      }
    },
    ...(isIntegrator || userProfile?.support ? [] : [{
      title: techPartnerAssignEcsEanbled
        ? $t({ defaultMessage: 'Integrator Count' })
        : $t({ defaultMessage: 'Integrator' }),
      dataIndex: isMspSortOnTpEnabled ? 'integratorCount' : 'integrator',
      key: isMspSortOnTpEnabled ? 'integratorCount' : 'integrator',
      sorter: isMspSortOnTpEnabled,
      width: 130,
      onCell: (data: MspEc) => {
        return (hasAssignTechPartnerPermission && !drawerIntegratorVisible) ? {
          onClick: () => {
            setTenantId(data.id)
            setTenantType(AccountType.MSP_INTEGRATOR)
            setDrawerIntegratorVisible(true)
          }
        } : {}
      },
      render: function (_: React.ReactNode, row: MspEc) {
        const val = techPartnerAssignEcsEanbled
          ? mspUtils.transformTechPartnerCount(row.integratorCount)
          : row?.integrator ? mspUtils.transformTechPartner(row.integrator, techParnersData)
            : noDataDisplay
        return (
          (hasAssignTechPartnerPermission && !drawerIntegratorVisible)
            ? <Link to=''><div style={{ textAlign: 'center' }}>{val}</div></Link> : val
        )
      }
    }]),
    ...(isIntegrator || userProfile?.support ? [] : [{
      title: techPartnerAssignEcsEanbled
        ? $t({ defaultMessage: 'Installer Count' })
        : $t({ defaultMessage: 'Installer' }),
      dataIndex: isMspSortOnTpEnabled ? 'installerCount' : 'installer',
      key: isMspSortOnTpEnabled ? 'installerCount' : 'installer',
      sorter: isMspSortOnTpEnabled,
      width: 120,
      onCell: (data: MspEc) => {
        return (hasAssignTechPartnerPermission && !drawerIntegratorVisible) ? {
          onClick: () => {
            setDrawerIntegratorVisible(false)
            setTenantId(data.id)
            setTenantType(AccountType.MSP_INSTALLER)
            setDrawerIntegratorVisible(true)
          }
        } : {}
      },
      render: function (_: React.ReactNode, row: MspEc) {
        const val = techPartnerAssignEcsEanbled
          ? mspUtils.transformTechPartnerCount(row.installerCount)
          : row?.installer ? mspUtils.transformTechPartner(row.installer, techParnersData)
            : noDataDisplay
        return (
          (hasAssignTechPartnerPermission && !drawerIntegratorVisible)
            ? <Link to=''><div style={{ textAlign: 'center' }}>{val}</div></Link> : val
        )
      }
    }]),
    {
      title: $t({ defaultMessage: 'Installed Devices' }),
      dataIndex: 'apswLicenseInstalled',
      key: 'apswLicenseInstalled',
      align: 'center',
      sorter: true,
      width: 140,
      render: function (_: React.ReactNode, row: MspEc) {
        return mspUtils.transformInstalledDevice(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Assigned Device Subscriptions' }),
      dataIndex: 'apswLicense',
      key: 'apswLicense',
      align: 'center',
      sorter: true,
      width: 230,
      render: function (data: React.ReactNode, row: MspEc) {
        return mspUtils.transformDeviceEntitlement(row.entitlements)
      }
    },
    {
      title: $t({ defaultMessage: 'Device Subscriptions Utilization' }),
      dataIndex: 'apswLicensesUtilization',
      key: 'apswLicensesUtilization',
      align: 'center',
      sorter: true,
      width: 230,
      render: function (data: React.ReactNode, row: MspEc) {
        return mspUtils.transformDeviceUtilization(row.entitlements)

      }
    },
    {
      title: $t({ defaultMessage: 'No-License Devices' }),
      dataIndex: 'creationDate',
      key: 'creationDate',
      align: 'center',
      sorter: true,
      width: 150,
      render: function (_, row) {
        return mspUtils.transformOutOfComplianceDevices(row.entitlements)
      }
    },
    {
      title: () => (
        <>
          { $t({ defaultMessage: 'License Expiration' }) }
          <Table.SubTitle children={$t({ defaultMessage: 'Devices / Days' })} />
        </>
      ),
      dataIndex: 'expirationDate',
      key: 'expirationDate',
      align: 'center',
      sorter: true,
      width: 150,
      render: function (_, row) {
        return <div style={{ textAlign: 'center' }}>
          {mspUtils.transformFutureOutOfComplianceDevices(row.entitlements)}</div>
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
    const settingsId = 'msp-customers-table'
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload: mspPayload,
      search: {
        searchTargetFields: mspPayload.searchTargetFields as string[]
      },
      pagination: { settingsId }
    })
    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        rbacOpsIds: [[getOpsApi(MspRbacUrlsInfo.enableMspEcSupport),
          getOpsApi(MspRbacUrlsInfo.disableMspEcSupport)]],
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
        rbacOpsIds: [[getOpsApi(MspRbacUrlsInfo.updateMspEcDelegations),
          getOpsApi(MspRbacUrlsInfo.updateMspMultipleEcDelegations)]],
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
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.deleteMspEcAccount)],
        visible: (selectedRows) => {
          return (selectedRows.length === 1)
        },
        onClick: ([{ name, id }], clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Property' }),
              entityValue: name,
              confirmationText: $t({ defaultMessage: 'Delete' })
            },
            onOk: () => deleteMspEc({ params: { mspEcTenantId: id }, enableRbac: isRbacEnabled })
              .then(clearSelection)
          })
        }
      }]

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false, isFetching: isDeleteEcUpdating }]}>
        <Table
          settingsId={settingsId}
          columns={columns}
          dataSource={tableQuery.data?.data}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange}
          onFilterChange={tableQuery.handleFilterChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: isAssignMultipleEcEnabled ? 'checkbox' : 'radio' }}
        />
        {drawerAssignEcMspAdminsVisible && (isAbacToggleEnabled && isRbacPhase2Enabled
          ? <ManageMspDelegationDrawer
            visible={drawerAssignEcMspAdminsVisible}
            tenantIds={selEcTenantIds}
            setVisible={setDrawerAssignEcMspAdminsVisible}
            setSelectedUsers={() => {}}
            setSelectedPrivilegeGroups={() => {}}/>
          :
          <AssignEcMspAdminsDrawer
            visible={drawerAssignEcMspAdminsVisible}
            tenantIds={selEcTenantIds}
            setVisible={setDrawerAssignEcMspAdminsVisible}
            setSelected={() => {}}
          />)}
      </Loader>
    )
  }

  const IntegratorTable = () => {
    const settingsId = 'integrator-customers-table'
    const tableQuery = useTableQuery({
      useQuery: useIntegratorCustomerListQuery,
      defaultPayload: integratorPayload,
      search: {
        searchTargetFields: integratorPayload.searchTargetFields as string[]
      },
      pagination: {
        settingsId: 'integrator-customers-table'
      }
    })

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }]}>
        <Table
          settingsId={settingsId}
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
    const settingsId = 'support-ec-table'
    const tableQuery = useTableQuery({
      useQuery: useSupportMspCustomerListQuery,
      defaultPayload: supportPayload,
      search: {
        searchTargetFields: supportPayload.searchTargetFields as string[]
      },
      pagination: { settingsId }
    })

    return (
      <Loader states={[
        tableQuery,
        { isLoading: false }]}>
        <Table
          settingsId={settingsId}
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
        title={$t({ defaultMessage: 'Brand Properties' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'My Customers' }) }]}
        extra={hasAddPermission ?
          [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null,
            <MspTenantLink to='/dashboard/mspreccustomers/create'>
              <Button
                hidden={userProfile?.support || !onBoard}
                type='primary'>{$t({ defaultMessage: 'Add Property' })}</Button>
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
      {drawerAdminVisible && (isAbacToggleEnabled
        ? (isRbacPhase2Enabled
          ? <ManageMspDelegationDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelectedUsers={() => {}}
            setSelectedPrivilegeGroups={() => {}}
            tenantIds={[ecTenantId]}
            tenantType={tenantType}/>
          : <ManageDelegateAdminDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelected={() => {}}
            tenantId={ecTenantId}
            tenantType={tenantType}/>)
        : <ManageAdminsDrawer
          visible={drawerAdminVisible}
          setVisible={setDrawerAdminVisible}
          setSelected={() => {}}
          tenantId={ecTenantId}
          tenantType={tenantType}/>
        // ? <ManageDelegateAdminDrawer
        //   visible={drawerAdminVisible}
        //   setVisible={setDrawerAdminVisible}
        //   setSelected={() => {}}
        //   tenantId={ecTenantId}
        //   tenantType={tenantType}/>
        // : <ManageAdminsDrawer
        //   visible={drawerAdminVisible}
        //   setVisible={setDrawerAdminVisible}
        //   setSelected={() => {}}
        //   tenantId={ecTenantId}
        //   tenantType={tenantType}/>
      )}
      {drawerIntegratorVisible && <SelectIntegratorDrawer
        visible={drawerIntegratorVisible}
        tenantId={ecTenantId}
        tenantType={selectedTenantType}
        setVisible={setDrawerIntegratorVisible}
        setSelected={() => {}}
      />}
    </>
  )
}
