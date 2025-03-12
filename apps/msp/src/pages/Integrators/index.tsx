import { useContext, useState } from 'react'

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
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import {
  AssignEcDrawer,
  ResendInviteModal,
  ManageAdminsDrawer,
  ManageDelegateAdminDrawer,
  ManageMspDelegationDrawer
} from '@acx-ui/msp/components'
import {
  useDeleteMspEcMutation,
  useMspCustomerListQuery,
  useCheckDelegateAdmin,
  useGetMspLabelQuery
} from '@acx-ui/msp/services'
import {
  MspEc,
  MspRbacUrlsInfo
} from '@acx-ui/msp/utils'
import { useTableQuery }                                                                                    from '@acx-ui/rc/utils'
import { Link, MspTenantLink, TenantLink, useNavigate, useTenantLink, useParams }                           from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                                        from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess, getUserProfile, hasAllowedOperations } from '@acx-ui/user'
import {
  AccountType, getOpsApi, isDelegationMode
} from '@acx-ui/utils'

import HspContext from '../../HspContext'

const transformAssignedCustomerCount = (row: MspEc) => {
  return row.assignedMspEcList.length
}

export function Integrators () {
  const { $t } = useIntl()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const params = useParams()
  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state

  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const isRbacPhase2Enabled = useIsSplitOn(Features.RBAC_PHASE2_TOGGLE)

  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerEcVisible, setDrawerEcVisible] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [tenantType, setTenantType] = useState('')
  const { data: userProfile } = useUserProfileContext()
  const { data: mspLabel } = useGetMspLabelQuery({ params, enableRbac: isRbacEnabled })
  const { checkDelegateAdmin } = useCheckDelegateAdmin(isRbacEnabled)
  const onBoard = mspLabel?.msp_label
  const ecFilters = isPrimeAdmin || isSupportToMspDashboardAllowed
    ? { tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] }
    : { mspAdmins: [userProfile?.adminId],
      tenantType: [AccountType.MSP_INTEGRATOR, AccountType.MSP_INSTALLER] }
  const { rbacOpsApiEnabled } = getUserProfile()
  const hasAddPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.addMspEcAccount)]) : isAdmin
  const hasAssignAdminPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.updateMspEcDelegations)]) : isAdmin
  const hasAssignEcPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.assignMspEcToIntegrator)]) : isAdmin

  const defaultPayload = {
    searchString: '',
    filters: ecFilters,
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

  const columns: TableProps<MspEc>['columns'] = [
    {
      title: $t({ defaultMessage: 'Name' }),
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      searchable: true,
      defaultSortOrder: 'ascend' as SortOrder,
      onCell: (data) => {
        return isSupportToMspDashboardAllowed ? {} : {
          onClick: () => { checkDelegateAdmin(data.id, userProfile!.adminId) }
        }
      },
      render: function (_, { name }, __, highlightFn) {
        return (isSupportToMspDashboardAllowed ? name :
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
        return (hasAssignAdminPermission) ? {
          onClick: () => {
            setTenantId(data.id)
            setDrawerAdminVisible(true)
          }
        } : {}
      },
      render: function (_, { mspAdminCount }) {
        return (
          (hasAssignAdminPermission)
            ? <Link to=''>{mspAdminCount}</Link> : mspAdminCount
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
        return (hasAssignEcPermission) ? {
          onClick: () => {
            setTenantId(data.id)
            setTenantType(data.tenantType)
            if (!drawerEcVisible) setDrawerEcVisible(true)
          }
        } : {}
      },
      render: function (_, row) {
        return (hasAssignEcPermission)
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
    const settingsId = 'msp-integrators-table'
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload,
      search: {
        searchTargetFields: defaultPayload.searchTargetFields as string[]
      },
      pagination: { settingsId }
    })
    const [
      deleteMspEc,
      { isLoading: isDeleteEcUpdating }
    ] = useDeleteMspEcMutation()

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.updateMspEcAccount)],
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
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.resendEcInvitation)],
        onClick: (selectedRows) => {
          setSelTenantId(selectedRows[0].id)
          setModalVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Delete' }),
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.deleteMspEcAccount)],
        onClick: ([{ name, id }], clearSelection) => {
          showActionModal({
            type: 'confirm',
            customContent: {
              action: 'DELETE',
              entityName: $t({ defaultMessage: 'Tech Partner' }),
              entityValue: name,
              confirmationText: $t({ defaultMessage: 'Delete' })
            },
            onOk: () => deleteMspEc({ params: { mspEcTenantId: id }, enableRbac: isRbacEnabled })
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
          settingsId={settingsId}
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
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null,
            <MspTenantLink to='/integrators/create'>
              <Button
                hidden={!onBoard || !hasAddPermission}
                type='primary'>{$t({ defaultMessage: 'Add Tech Partner' })}</Button>
            </MspTenantLink>
          ]
          : [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null
          ]}
      />
      <IntegratorssTable />
      {drawerAdminVisible && (isAbacToggleEnabled && isRbacPhase2Enabled
        ? <ManageMspDelegationDrawer
          visible={drawerAdminVisible}
          tenantIds={[tenantId]}
          setVisible={setDrawerAdminVisible}
          setSelectedUsers={() => {}}
          setSelectedPrivilegeGroups={() => {}}/>
        : (isAbacToggleEnabled
          ? <ManageDelegateAdminDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelected={() => {}}
            tenantId={tenantId}
          />
          : <ManageAdminsDrawer
            visible={drawerAdminVisible}
            setVisible={setDrawerAdminVisible}
            setSelected={() => {}}
            tenantId={tenantId}
          />))}
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
