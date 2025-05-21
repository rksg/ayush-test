import { useState, useEffect, useContext } from 'react'

import { Space }              from 'antd'
import { IntlShape, useIntl } from 'react-intl'

import {
  Button,
  Loader,
  PageHeader,
  showActionModal,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn, useIsTierAllowed, TierFeatures } from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                              from '@acx-ui/formatter'
import {
  ManageAdminsDrawer,
  ManageDelegateAdminDrawer,
  ResendInviteModal,
  SelectIntegratorDrawer,
  ManageMspDelegationDrawer
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
  MSPUtils,
  MspEcTierEnum,
  MspEcAccountType,
  MspRbacUrlsInfo
} from '@acx-ui/msp/utils'
import {
  useGetTenantDetailsQuery
} from '@acx-ui/rc/services'
import {
  EntitlementUtil,
  FILTER,
  SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'
import { Link, MspTenantLink, TenantLink, useNavigate, useTenantLink, useParams }                           from '@acx-ui/react-router-dom'
import { RolesEnum }                                                                                        from '@acx-ui/types'
import { filterByAccess, useUserProfileContext, hasRoles, hasAccess, getUserProfile, hasAllowedOperations } from '@acx-ui/user'
import { AccountType, getOpsApi, isDelegationMode, noDataDisplay }                                          from '@acx-ui/utils'

import HspContext from '../../HspContext'
import * as UI    from '../Subscriptions/styledComponent'

import { AssignEcMspAdminsDrawer } from './AssignEcMspAdminsDrawer'
import { ScheduleFirmwareDrawer }  from './ScheduleFirmwareDrawer'

export function MspCustomers () {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const isPrimeAdmin = hasRoles([RolesEnum.PRIME_ADMIN])
  const isAdmin = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])
  const params = useParams()
  const isAssignMultipleEcEnabled =
    useIsSplitOn(Features.ASSIGN_MULTI_EC_TO_MSP_ADMINS) && !isDelegationMode()
  const MAX_ALLOWED_SELECTED_EC = 200
  const MAX_ALLOWED_SELECTED_EC_FIRMWARE_UPGRADE = 100

  const {
    state
  } = useContext(HspContext)
  const { isHsp: isHspSupportEnabled } = state
  const isUpgradeMultipleEcEnabled =
    useIsSplitOn(Features.MSP_UPGRADE_MULTI_EC_FIRMWARE) && !isDelegationMode()
  const isSupportToMspDashboardAllowed =
    useIsSplitOn(Features.SUPPORT_DELEGATE_MSP_DASHBOARD_TOGGLE) && isDelegationMode()
  const isSupportEcAlarmCount = useIsSplitOn(Features.MSPEC_ALARM_COUNT_SUPPORT_TOGGLE)
  const isTechPartnerQueryEcsEnabled = useIsSplitOn(Features.TECH_PARTNER_GET_MSP_CUSTOMERS_TOGGLE)
  const isRbacEarlyAccessEnable = useIsTierAllowed(TierFeatures.RBAC_IMPLICIT_P1)
  const isAbacToggleEnabled = useIsSplitOn(Features.ABAC_POLICIES_TOGGLE) && isRbacEarlyAccessEnable
  const createEcWithTierEnabled = useIsSplitOn(Features.MSP_EC_CREATE_WITH_TIER)
  const isRbacEnabled = useIsSplitOn(Features.MSP_RBAC_API)
  const isvSmartEdgeEnabled = useIsSplitOn(Features.ENTITLEMENT_VIRTUAL_SMART_EDGE_TOGGLE)
  const isvViewModelTpLoginEnabled = useIsSplitOn(Features.VIEWMODEL_TP_LOGIN_ADMIN_COUNT)
  const isMspSortOnTpEnabled = useIsSplitOn(Features.MSP_SORT_ON_TP_COUNT_TOGGLE)
  const isRbacPhase2Enabled = useIsSplitOn(Features.RBAC_PHASE2_TOGGLE)
  const isCustomFilterEnabled = useIsSplitOn(Features.VIEWMODEL_MSPEC_QUERY_TWO_FILTERS_TOGGLE)
  const isViewmodleAPIsMigrateEnabled = useIsSplitOn(Features.VIEWMODEL_APIS_MIGRATE_MSP_TOGGLE)

  const [ecTenantId, setTenantId] = useState('')
  const [selectedTenantType, setTenantType] = useState(AccountType.MSP_INTEGRATOR)
  const [drawerAdminVisible, setDrawerAdminVisible] = useState(false)
  const [drawerIntegratorVisible, setDrawerIntegratorVisible] = useState(false)
  const [techParnersData, setTechPartnerData] = useState([] as MspEc[])

  const { data: userProfile } = useUserProfileContext()
  const { data: mspLabel } = useGetMspLabelQuery({ params, enableRbac: isRbacEnabled })
  const [deactivateMspEc] = useDeactivateMspEcMutation()
  const [reactivateMspEc] = useReactivateMspEcMutation()
  const [deleteMspEc, { isLoading: isDeleteEcUpdating }] = useDeleteMspEcMutation()
  const { delegateToMspEcPath } = useDelegateToMspEcPath()
  const { checkDelegateAdmin } = useCheckDelegateAdmin(isRbacEnabled)
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
  const isExtendedTrialEnabled = tenantDetailsData.data?.extendedTrial ?? false
  const { rbacOpsApiEnabled } = getUserProfile()
  const hasAddPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.addMspEcAccount)]) : isAdmin
  const hasAssignAdminPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.updateMspEcDelegations)]) : isAdmin
  const hasAssignTechPartnerPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(MspRbacUrlsInfo.assignMspEcToMultiIntegrators)]) : isAdmin

  const allowManageAdmin =
      (hasAssignAdminPermission && !userProfile?.support) || isSupportToMspDashboardAllowed
  const allowSelectTechPartner =
      (hasAssignTechPartnerPermission && !drawerIntegratorVisible) || isSupportToMspDashboardAllowed
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
    },
    option: {
      skip: techPartnerAssignEcsEanbled
    },
    enableRbac: isViewmodleAPIsMigrateEnabled
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
      'integratorCount',
      'installerCount',
      'creationDate',
      'expirationDate',
      'wifiLicense',
      'switchLicense',
      'streetAddress',
      'accountTier'
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

  function useColumns (mspEcAlarmList?: MspEcAlarmList, isSupportTier?: boolean,
    isFilterEnable?: boolean) {
    const mspAdminCountIndex = isvViewModelTpLoginEnabled ?
      (tenantType === AccountType.MSP_INTEGRATOR ? 'mspIntegratorAdminCount'
        : (tenantType === AccountType.MSP_INSTALLER ? 'mspInstallerAdminCount'
          : 'mspAdminCount' )) : 'mspAdminCount'

    const statusTypeFilterOpts = ($t: IntlShape['$t']) => [
      { key: '', value: $t({ defaultMessage: 'All' }) },
      {
        key: 'Active',
        value: $t({ defaultMessage: 'Active' })
      },
      {
        key: 'Inactive',
        value: $t({ defaultMessage: 'Inactive' })
      },
      {
        key: 'Trial',
        value: $t({ defaultMessage: 'Trial' })
      },
      ...(isExtendedTrialEnabled ? [{
        key: 'Extended Trial',
        value: $t({ defaultMessage: 'Extended Trial' })
      }
      ] : [])
    ]

    const expirationDateFilterOpts = ($t: IntlShape['$t']) => [
      { key: '', value: $t({ defaultMessage: 'All' }) },
      {
        key: 'Non-Expired',
        value: $t({ defaultMessage: 'Non-Expired' })
      },
      {
        key: '+30',
        value: $t({ defaultMessage: 'Expiring within 30 days' })
      },
      {
        key: '+60',
        value: $t({ defaultMessage: 'Expiring within 60 days' })
      },
      {
        key: '+90',
        value: $t({ defaultMessage: 'Expiring within 90 days' })
      },
      {
        key: 'Expired',
        value: $t({ defaultMessage: 'Expired' })
      },
      {
        key: '-30',
        value: $t({ defaultMessage: 'Expired in last 30 days' })
      },
      {
        key: '-60',
        value: $t({ defaultMessage: 'Expired in last 60 days' })
      },
      {
        key: '-90',
        value: $t({ defaultMessage: 'Expired in last 90 days' })
      }
    ]

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
        filterMultiple: false,
        filterPlaceholder: $t({ defaultMessage: 'Service Status' }),
        filterable: isFilterEnable ? statusTypeFilterOpts($t) : false,
        width: 120,
        render: function (_, row) {
          return $t(mspUtils.getStatus(row))
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
        dataIndex: mspAdminCountIndex,
        align: 'center',
        key: mspAdminCountIndex,
        sorter: true,
        width: 140,
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
        dataIndex: isMspSortOnTpEnabled ? 'integratorCount' : 'integrator',
        key: isMspSortOnTpEnabled ? 'integratorCount' : 'integrator',
        sorter: isMspSortOnTpEnabled,
        width: 130,
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
          const val = techPartnerAssignEcsEanbled
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
        dataIndex: isMspSortOnTpEnabled ? 'installerCount' : 'installer',
        key: isMspSortOnTpEnabled ? 'installerCount' : 'installer',
        sorter: isMspSortOnTpEnabled,
        width: 120,
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
          const val = techPartnerAssignEcsEanbled
            ? mspUtils.transformTechPartnerCount(row.installerCount)
            : row?.installer ? mspUtils.transformTechPartner(row.installer, techParnersData)
              : noDataDisplay
          return (
            (allowSelectTechPartner)
              ? <Link to=''><div style={{ textAlign: 'center' }}>{val}</div></Link> : val
          )
        }
      }]),
      {
        title: isvSmartEdgeEnabled ? $t({ defaultMessage: 'Used Licenses' })
          : $t({ defaultMessage: 'Installed Devices' }),
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
        title: isvSmartEdgeEnabled ? $t({ defaultMessage: 'Assigned Licenses' })
          : $t({ defaultMessage: 'Assigned Device Subscriptions' }) ,
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
        render: function (_: React.ReactNode, row: MspEc) {
          return <div style={{ textAlign: 'center' }}>
            {mspUtils.transformDeviceUtilization(row.entitlements)}</div>
        }
      },
      ...(!isSupportTier ? [] : [{
        title: $t({ defaultMessage: 'Service Tier' }),
        dataIndex: 'accountTier',
        key: 'accountTier',
        sorter: true,
        render: function (_: React.ReactNode, row: MspEc) {
          return row.accountTier === MspEcTierEnum.Essentials
            ? $t({ defaultMessage: 'Essentials' })
            : row.accountTier === MspEcTierEnum.Professional
              ? $t({ defaultMessage: 'Professional' })
              : $t({ defaultMessage: 'Core' })
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
        filterMultiple: false,
        filterPlaceholder: $t({ defaultMessage: 'Service Date' }),
        filterable: isFilterEnable ? expirationDateFilterOpts($t) : false,
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
      pagination: { settingsId },
      enableRbac: isViewmodleAPIsMigrateEnabled
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

    const columns = useColumns(mspEcAlarmList, createEcWithTierEnabled, isCustomFilterEnabled)

    const rowActions: TableProps<MspEc>['rowActions'] = [
      {
        label: $t({ defaultMessage: 'Edit' }),
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.updateMspEcAccount)],
        visible: (selectedRows) => {
          return (selectedRows.length === 1)
        },
        onClick: (selectedRows) => {
          const accType = selectedRows[0].accountType
          const status = accType === MspEcAccountType.TRIAL ? 'Trial'
            : (accType === MspEcAccountType.EXTENDED_TRIAL ? 'ExtendedTrial': 'Paid')
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
        label: $t({ defaultMessage: 'Schedule Firmware Update' }),
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.mspEcFirmwareUpgradeSchedules)],
        visible: (selectedRows) => {
          const len = selectedRows.length
          const validRows = selectedRows.filter(en => en.status === 'Active')
          return (isUpgradeMultipleEcEnabled && validRows.length > 0 &&
                  len >= 1 && len <= MAX_ALLOWED_SELECTED_EC_FIRMWARE_UPGRADE)
        },
        onClick: (selectedRows) => {
          const selectedEcIds = selectedRows.map(item => item.id)
          setSelEcTenantIds(selectedEcIds)
          setDrawerScheduleFirmwareVisible(true)
        }
      },
      {
        label: $t({ defaultMessage: 'Resend Invitation Email' }),
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.resendEcInvitation)],
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
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.deactivateMspEcAccount)],
        visible: (selectedRows) => {
          if(selectedRows.length === 1 && selectedRows[0] &&
            (selectedRows[0].status === 'Active' &&
              selectedRows[0].accountType !== MspEcAccountType.TRIAL)) {
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
            onOk: () => deactivateMspEc({ params: { mspEcTenantId: id },
              enableRbac: isRbacEnabled })
              .then(clearSelection)
          })
        }
      },
      {
        label: $t({ defaultMessage: 'Reactivate' }),
        rbacOpsIds: [getOpsApi(MspRbacUrlsInfo.reactivateMspEcAccount)],
        visible: (selectedRows) => {
          if(selectedRows.length !== 1 || (selectedRows[0] &&
            (selectedRows[0].status === 'Active' ||
              selectedRows[0].accountType === MspEcAccountType.TRIAL))) {
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
            onOk: () => reactivateMspEc({ params: { mspEcTenantId: id },
              enableRbac: isRbacEnabled })
              .then(clearSelection)
          })
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
              entityName: $t({ defaultMessage: 'EC' }),
              entityValue: name,
              confirmationText: $t({ defaultMessage: 'Delete' })
            },
            onOk: () => deleteMspEc({ params: { mspEcTenantId: id }, enableRbac: isRbacEnabled })
              .then(clearSelection)
          })
        }
      }]

    const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
      let _customFilters = {}
      _customFilters = {
        ...customFilters,
        ...(customFilters?.status ? { status: [customFilters.status[0]] } : {}),
        ...(customFilters?.expirationDate ?
          { expirationDate: [customFilters.expirationDate[0]] } : {})
      }
      tableQuery.handleFilterChange(_customFilters, customSearch)
    }

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
          onFilterChange={handleFilterChange}
          rowKey='id'
          rowActions={filterByAccess(rowActions)}
          rowSelection={hasAccess() && { type: isAssignMultipleEcEnabled ? 'checkbox' : 'radio' }}
          enableApiFilter={true}
        />
        {modalVisible && <ResendInviteModal
          visible={modalVisible}
          setVisible={setModalVisible}
          tenantId={selTenantId}
        />}
        {drawerAssignEcMspAdminsVisible && (isAbacToggleEnabled && isRbacPhase2Enabled
          ? <ManageMspDelegationDrawer
            visible={drawerAssignEcMspAdminsVisible}
            tenantIds={selEcTenantIds}
            setVisible={setDrawerAssignEcMspAdminsVisible}
            setSelectedUsers={() => {}}
            setSelectedPrivilegeGroups={() => {}}/>
          : (isAbacToggleEnabled && selEcTenantIds.length === 1)
            ? <ManageDelegateAdminDrawer
              visible={drawerAssignEcMspAdminsVisible}
              setVisible={setDrawerAssignEcMspAdminsVisible}
              setSelected={() => {}}
              tenantId={selEcTenantIds[0]}
              tenantType={AccountType.MSP_EC}/>
            : <AssignEcMspAdminsDrawer
              visible={drawerAssignEcMspAdminsVisible}
              tenantIds={selEcTenantIds}
              setVisible={setDrawerAssignEcMspAdminsVisible}
              setSelected={() => {}}/>)
        }
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
      pagination: { settingsId },
      enableRbac: isViewmodleAPIsMigrateEnabled
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
                  len >= 1 && len <= MAX_ALLOWED_SELECTED_EC_FIRMWARE_UPGRADE)
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
        extra={hasAddPermission ?
          [
            !isHspSupportEnabled ? <TenantLink to='/dashboard'>
              <Button>{$t({ defaultMessage: 'Manage My Account' })}</Button>
            </TenantLink> : null,
            <MspTenantLink to='/dashboard/mspcustomers/create'>
              <Button
                hidden={(userProfile?.support && !isSupportToMspDashboardAllowed)
                  || !onBoard || !hasAddPermission}
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
