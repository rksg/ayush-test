import { useState, useEffect } from 'react'

import { Space }   from 'antd'
import { useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, TierFeatures, useIsSplitOn, useIsTierAllowed } from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                              from '@acx-ui/formatter'
import {
  ManageAdminsDrawer,
  ManageDelegateAdminDrawer,
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
  useDelegateToMspEcPath,
  useCheckDelegateAdmin,
  useGetMspEcAlarmListQuery
} from '@acx-ui/msp/services'
import {
  MspEcAlarmList,
  MspEc,
  MSPUtils
} from '@acx-ui/msp/utils'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  EntitlementNetworkDeviceType,
  EntitlementUtil,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, MspTenantLink, TenantLink, useNavigate, useTenantLink, useParams } from '@acx-ui/react-router-dom'
import { RolesEnum }                                                              from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess }             from '@acx-ui/user'
import { AccountType, isDelegationMode, noDataDisplay }                           from '@acx-ui/utils'

import * as UI from '../Subscriptions/styledComponent'

import { AssignEcMspAdminsDrawer } from './AssignEcMspAdminsDrawer'
import { ScheduleFirmwareDrawer }  from './ScheduleFirmwareDrawer'

export function MspCustomers () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const edgeEnabled = useIsTierAllowed(TierFeatures.SMART_EDGES)
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const params = useParams()
  const isAssignMultipleEcEnabled =
    useIsSplitOn(Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS) && isPrimeAdmin && !isDelegationMode()
  const isDeviceAgnosticEnabled = useIsSplitOn(Features.DEVICE_AGNOSTIC)
  const MAX_ALLOWED_SELECTED_EC = 200
  const isHspPlmFeatureOn = useIsTierAllowed(Features.MSP_HSP_PLM_FF)
  const isHspSupportEnabled = useIsSplitOn(Features.MSP_HSP_SUPPORT) && isHspPlmFeatureOn
  const isUpgradeMultipleEcEnabled =
    useIsSplitOn(Features.MSP_UPGRADE_MULTI_EC_FIRMWARE) && isPrimeAdmin && !isDelegationMode()
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isSupportEcAlarmCount = useIsSplitOn(Features.MSPEC_ALARM_COUNT_SUPPORT_TOGGLE)
  const isTechPartnerQueryEcsEnabled = useIsSplitOn(Features.TECH_PARTNER_GET_MSP_CUSTOMERS_TOGGLE)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE)

  const [ecTenantId, setTenantId] = useState('')
  const [selectedTenantType, setTenantType] = useState(AccountType.MSP_INTEGRATOR)
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
  const linkVarPath = useTenantLink('/dashboard/varCustomers/', 'v')
  const mspUtils = MSPUtils()

  const onBoard = mspLabel?.msp_label
  const ecFilters = isPrimeAdmin || isSupportToMspDashboardAllowed
    ? { tenantType: [AccountType.MSP_EC] }
    : { mspAdmins: [userProfile?.adminId], tenantType: [AccountType.MSP_EC] }

  const tenantDetailsData = useGetTenantDetailsQuery({ params })
  const tenantType = tenantDetailsData.data?.tenantType
  const isIntegrator =
    (tenantType === AccountType.MSP_INSTALLER ||
     tenantType === AccountType.MSP_INTEGRATOR)
  const parentTenantid = tenantDetailsData.data?.mspEc?.parentMspId

  const allowManageAdmin =
      ((isPrimeAdmin || isAdmin) && !userProfile?.support) || isSupportToMspDashboardAllowed
  const allowSelectTechPartner =
      ((isPrimeAdmin || isAdmin) && !drawerIntegratorVisible) || isSupportToMspDashboardAllowed
  const hideTechPartner = (isIntegrator || userProfile?.support) && !isSupportToMspDashboardAllowed

  const techPartnerAssignEcsEanbled = useIsSplitOn(Features.TECH_PARTNER_ASSIGN_ECS)

  if ((tenantType === AccountType.VAR || tenantType === AccountType.REC) &&
      (userProfile?.support === false || isSupportToMspDashboardAllowed)) {
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
      tenantType: (isTechPartnerQueryEcsEnabled || isHspSupportEnabled) ? [AccountType.MSP_EC]
        : [AccountType.MSP_INSTALLER, AccountType.MSP_INTEGRATOR]
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

  function useColumns (mspEcAlarmList?: MspEcAlarmList) {

    const columns: TableProps<MspEc>['columns'] = [
      {
        title: $t({ defaultMessage: 'Customers' }),
        dataIndex: 'name',
        key: 'name',
        searchable: true,
        sorter: true,
        defaultSortOrder: 'ascend',
        onCell: (data) => {
          return (data.status === 'Active' && !isSupportToMspDashboardAllowed) ? {
            onClick: () => {
              userProfile?.support
                ? delegateToMspEcPath(data.id)
                : checkDelegateAdmin(data.id, userProfile!.adminId)
            }
          } : {}
        },
        render: function (_, row, __, highlightFn) {
          return (
            (row.status === 'Active' && !isSupportToMspDashboardAllowed)
              ? <Link to=''>{highlightFn(row.name)}</Link> : row.name
          )
        }
      },
      {
        title: $t({ defaultMessage: 'Status' }),
        dataIndex: 'status',
        key: 'status',
        sorter: true,
        render: function (_, row) {
          return $t({ defaultMessage: '{status}' }, { status: mspUtils.getStatus(row) })
        }
      },
      {
        title: $t({ defaultMessage: 'Address' }),
        dataIndex: 'streetAddress',
        key: 'streetAddress',
        sorter: true
      },
      {
        title: $t({ defaultMessage: '{adminCountHeader}' }, { adminCountHeader:
            mspUtils.transformAdminCountHeader(tenantType) }),
        dataIndex: 'mspAdminCount',
        align: 'center',
        key: 'mspAdminCount',
        sorter: true,
        onCell: (data) => {
          return allowManageAdmin ? {
            onClick: () => {
              setTenantId(data.id)
              setDrawerAdminVisible(true)
            }
          } : {}
        },
        render: function (_, row) {
          return (
            allowManageAdmin
              ? <Link to=''>{mspUtils.transformAdminCount(row, tenantType)}</Link>
              : mspUtils.transformAdminCount(row, tenantType)
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
      ...(!isSupportEcAlarmCount ? [] : [{
        title: $t({ defaultMessage: 'Alarm Count' }),
        dataIndex: 'mspEcAlarmCount',
        key: 'mspEcAlarmCount',
        sorter: false,
        render: function (_: React.ReactNode, row: MspEc) {
          return mspUtils.transformAlarmCount(row, mspEcAlarmList)
        }
      }]),
      ...(hideTechPartner ? [] : [{
        title: techPartnerAssignEcsEanbled
          ? $t({ defaultMessage: 'Integrator Count' })
          : $t({ defaultMessage: 'Integrator' }),
        dataIndex: 'integrator',
        key: 'integrator',
        onCell: (data: MspEc) => {
          return allowSelectTechPartner ? {
            onClick: () => {
              setTenantId(data.id)
              setTenantType(AccountType.MSP_INTEGRATOR)
              setDrawerIntegratorVisible(true)
            }
          } : {}
        },
        render: function (_: React.ReactNode, row: MspEc) {
          const val = (techPartnerAssignEcsEanbled && row.integratorCount !== undefined)
            ? mspUtils.transformTechPartnerCount(row.integratorCount)
            : row?.integrator ? mspUtils.transformTechPartner(row.integrator, techParnersData)
              : noDataDisplay
          return (
            allowSelectTechPartner
              ? <Link to=''><div style={{ textAlign: 'center' }}>{val}</div></Link> : val
          )
        }
      }]),
      ...(hideTechPartner ? [] : [{
        title: techPartnerAssignEcsEanbled
          ? $t({ defaultMessage: 'Installer Count' })
          : $t({ defaultMessage: 'Installer' }),
        dataIndex: 'installer',
        key: 'installer',
        onCell: (data: MspEc) => {
          return allowSelectTechPartner ? {
            onClick: () => {
              setDrawerIntegratorVisible(false)
              setTenantId(data.id)
              setTenantType(AccountType.MSP_INSTALLER)
              setDrawerIntegratorVisible(true)
            }
          } : {}
        },
        render: function (_: React.ReactNode, row: MspEc) {
          const val = (techPartnerAssignEcsEanbled && row.installerCount !== undefined)
            ? mspUtils.transformTechPartnerCount(row.installerCount)
            : row?.installer ? mspUtils.transformTechPartner(row.installer, techParnersData)
              : noDataDisplay
          return (
            allowSelectTechPartner
              ? <Link to=''><div style={{ textAlign: 'center' }}>{val}</div></Link> : val
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
            return <div style={{ textAlign: 'center' }}>
              {mspUtils.transformInstalledDevice(row.entitlements)}</div>
          }
        },
        {
          title: <div style={{ textAlign: 'center' }}>
            <div>{$t({ defaultMessage: 'Assigned Device' })}</div>
            <div>{$t({ defaultMessage: 'Subscriptions' })}</div></div>,
          dataIndex: 'apswLicense',
          key: 'apswLicense',
          sorter: true,
          render: function (data: React.ReactNode, row: MspEc) {
            return <div style={{ textAlign: 'center' }}>
              {mspUtils.transformDeviceEntitlement(row.entitlements)}</div>
          }
        },
        {
          title: <div style={{ textAlign: 'center' }}>
            <div>{$t({ defaultMessage: 'Device Subscriptions' })}</div>
            <div>{$t({ defaultMessage: 'Utilization' })}</div></div>,
          dataIndex: 'apswLicensesUtilization',
          key: 'apswLicensesUtilization',
          sorter: true,
          render: function (_: React.ReactNode, row: MspEc) {
            return <div style={{ textAlign: 'center' }}>
              {mspUtils.transformDeviceUtilization(row.entitlements)}</div>
          }
        }
      ] : [
        {
          title: $t({ defaultMessage: 'Wi-Fi Licenses' }),
          dataIndex: 'wifiLicense',
          key: 'wifiLicense',
          // align: 'center',
          sorter: true,
          render: function (data: React.ReactNode, row: MspEc) {
            return mspUtils.transformApEntitlement(row)
          }
        },
        {
          title: $t({ defaultMessage: 'Wi-Fi License Utilization' }),
          dataIndex: 'wifiLicensesUtilization',
          // align: 'center',
          key: 'wifiLicensesUtilization',
          sorter: true,
          render: function (data: React.ReactNode, row: MspEc) {
            return mspUtils.transformUtilization(row, EntitlementNetworkDeviceType.WIFI)
          }
        },
        {
          title: $t({ defaultMessage: 'Switch Licenses' }),
          dataIndex: 'switchLicense',
          // align: 'center',
          key: 'switchLicense',
          sorter: true,
          render: function (data: React.ReactNode, row: MspEc) {
            return mspUtils.transformSwitchEntitlement(row)
          }
        },
        {
          title: $t({ defaultMessage: 'SmartEdge Licenses' }),
          dataIndex: 'edgeLicenses',
          // align: 'center',
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
          const nextExpirationDate = mspUtils.transformExpirationDate(row)
          if (nextExpirationDate === noDataDisplay)
            return nextExpirationDate
          const formattedDate = formatter(DateFormatEnum.DateFormat)(nextExpirationDate)
          const expiredOnString = `${$t({ defaultMessage: 'Expired on' })} ${formattedDate}`
          const remainingDays = EntitlementUtil.timeLeftInDays(nextExpirationDate)
          const TimeLeftWrapper = remainingDays < 0
            ? UI.Expired
            : (remainingDays <= 60 ? UI.Warning : Space)
          return <TimeLeftWrapper>
            {remainingDays < 0 ? expiredOnString : formattedDate}
          </TimeLeftWrapper>
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
    return columns
  }

  const MspEcTable = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [selTenantId, setSelTenantId] = useState('')
    const [drawerAssignEcMspAdminsVisible, setDrawerAssignEcMspAdminsVisible] = useState(false)
    const [drawerScheduleFirmwareVisible, setDrawerScheduleFirmwareVisible] = useState(false)
    const [selEcTenantIds, setSelEcTenantIds] = useState([] as string[])
    const [mspEcTenantList, setMspEcTenantList] = useState([] as string[])
    const [mspEcAlarmList, setEcAlarmData] = useState({} as MspEcAlarmList)
    const basePath = useTenantLink('/dashboard/mspcustomers/edit', 'v')
    const settingsId = 'msp-customers-table'
    const tableQuery = useTableQuery({
      useQuery: useMspCustomerListQuery,
      defaultPayload: mspPayload,
      search: {
        searchTargetFields: mspPayload.searchTargetFields as string[]
      },
      pagination: { settingsId }
    })

    const alarmList = useGetMspEcAlarmListQuery(
      { params, payload: { mspEcTenants: mspEcTenantList } },
      { skip: !isSupportEcAlarmCount || mspEcTenantList.length === 0 })

    useEffect(() => {
      if (tableQuery?.data?.data) {
        const ecList = tableQuery?.data.data.map(item => item.id)
        setMspEcTenantList(ecList)
      }
      if (alarmList?.data) {
        setEcAlarmData(alarmList?.data)
      }
    }, [tableQuery?.data?.data, alarmList?.data])

    const columns = useColumns(mspEcAlarmList)

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
        label: $t({ defaultMessage: 'Schedule Firmware Update' }),
        visible: (selectedRows) => {
          const len = selectedRows.length
          const validRows = selectedRows.filter(en => en.status === 'Active')
          return (isUpgradeMultipleEcEnabled && validRows.length > 0 &&
                  len >= 1 && len <= MAX_ALLOWED_SELECTED_EC)
        },
        onClick: (selectedRows) => {
          const selectedEcIds = selectedRows.map(item => item.id)
          setSelEcTenantIds(selectedEcIds)
          setDrawerScheduleFirmwareVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Resend Invitation Email' }),
        visible: (selectedRows) => {
          return (selectedRows.length === 1)
        },
        onClick: (selectedRows) => {
          setSelTenantId(selectedRows[0].id)
          setModalVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Deactivate' }),
        visible: (selectedRows) => {
          if(selectedRows.length === 1 && selectedRows[0] &&
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
          if(selectedRows.length !== 1 || (selectedRows[0] &&
            (selectedRows[0].status === 'Active' || selectedRows[0].accountType === 'TRIAL'))) {
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
        {modalVisible && <ResendInviteModal
          visible={modalVisible}
          setVisible={setModalVisible}
          tenantId={selTenantId}
        />}
        {drawerAssignEcMspAdminsVisible && <AssignEcMspAdminsDrawer
          visible={drawerAssignEcMspAdminsVisible}
          tenantIds={selEcTenantIds}
          setVisible={setDrawerAssignEcMspAdminsVisible}
          setSelected={() => {}}
        />}
        {drawerScheduleFirmwareVisible && <ScheduleFirmwareDrawer
          visible={drawerScheduleFirmwareVisible}
          tenantIds={selEcTenantIds}
          setVisible={setDrawerScheduleFirmwareVisible}
        />}
      </Loader>
    )
  }

  const IntegratorTable = () => {
    const [selEcTenantIds, setSelEcTenantIds] = useState([] as string[])
    const [mspEcTenantList, setMspEcTenantList] = useState([] as string[])
    const [mspEcAlarmList, setEcAlarmData] = useState({} as MspEcAlarmList)
    const [drawerScheduleFirmwareVisible, setDrawerScheduleFirmwareVisible] = useState(false)

    const settingsId = 'integrator-customers-table'
    const tableQuery = useTableQuery({
      useQuery: useIntegratorCustomerListQuery,
      defaultPayload: integratorPayload,
      search: {
        searchTargetFields: integratorPayload.searchTargetFields as string[]
      },
      pagination: { settingsId }
    })

    const alarmList = useGetMspEcAlarmListQuery(
      { params, payload: { mspEcTenants: mspEcTenantList } },
      { skip: !isSupportEcAlarmCount || mspEcTenantList.length === 0 })

    useEffect(() => {
      if (tableQuery?.data?.data) {
        const ecList = tableQuery?.data.data.map(item => item.id)
        setMspEcTenantList(ecList)
      }
      if (alarmList?.data) {
        setEcAlarmData(alarmList?.data)
      }
    }, [tableQuery?.data?.data, alarmList?.data])

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Schedule Firmware Update' }),
        visible: (selectedRows) => {
          const len = selectedRows.length
          const validRows = selectedRows.filter(en => en.status === 'Active')
          return (isUpgradeMultipleEcEnabled && validRows.length > 0 &&
                  len >= 1 && len <= MAX_ALLOWED_SELECTED_EC)
        },
        onClick: (selectedRows) => {
          const selectedEcIds = selectedRows.map(item => item.id)
          setSelEcTenantIds(selectedEcIds)
          setDrawerScheduleFirmwareVisible(true)
        }
      }]

    const columns = useColumns(mspEcAlarmList)

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
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: isAssignMultipleEcEnabled ? 'checkbox' : 'radio' }}
        />
        {drawerScheduleFirmwareVisible && <ScheduleFirmwareDrawer
          visible={drawerScheduleFirmwareVisible}
          tenantIds={selEcTenantIds}
          setVisible={setDrawerScheduleFirmwareVisible}
        />}
      </Loader>
    )
  }

  const SupportEcTable = () => {
    const [mspEcTenantList, setMspEcTenantList] = useState([] as string[])
    const [mspEcAlarmList, setEcAlarmData] = useState({} as MspEcAlarmList)
    const settingsId = 'support-ec-table'
    const tableQuery = useTableQuery({
      useQuery: useSupportMspCustomerListQuery,
      defaultPayload: supportPayload,
      search: {
        searchTargetFields: supportPayload.searchTargetFields as string[]
      },
      pagination: { settingsId }
    })

    const alarmList = useGetMspEcAlarmListQuery(
      { params, payload: { mspEcTenants: mspEcTenantList } },
      { skip: !isSupportEcAlarmCount || mspEcTenantList.length === 0 })

    useEffect(() => {
      if (tableQuery?.data?.data) {
        const ecList = tableQuery?.data.data.map(item => item.id)
        setMspEcTenantList(ecList)
      }
      if (alarmList?.data) {
        setEcAlarmData(alarmList?.data)
      }
    }, [tableQuery?.data?.data, alarmList?.data])

    const columns = useColumns(mspEcAlarmList)

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
        title={$t({ defaultMessage: 'MSP Customers' })}
        breadcrumb={[{ text: $t({ defaultMessage: 'My Customers' }) }]}
        extra={isAdmin ?
          [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null,
            <MspTenantLink to='/dashboard/mspcustomers/create'>
              <Button
                hidden={(userProfile?.support && !isSupportToMspDashboardAllowed) || !onBoard}
                type='primary'>{$t({ defaultMessage: 'Add Customer' })}</Button>
            </MspTenantLink>
          ]
          : [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null
          ]}
      />
      {userProfile?.support && !isSupportToMspDashboardAllowed && <SupportEcTable />}
      {(isSupportToMspDashboardAllowed || (!userProfile?.support && !isIntegrator))
        && <MspEcTable />}
      {!userProfile?.support && isIntegrator && <IntegratorTable />}
      {drawerAdminVisible && (isAbacToggleEnabled
        ? <ManageDelegateAdminDrawer
          visible={drawerAdminVisible}
          setVisible={setDrawerAdminVisible}
          setSelected={() => {}}
          tenantId={ecTenantId}
          tenantType={tenantType}/>
        : <ManageAdminsDrawer
          visible={drawerAdminVisible}
          setVisible={setDrawerAdminVisible}
          setSelected={() => {}}
          tenantId={ecTenantId}
          tenantType={tenantType}/>
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
