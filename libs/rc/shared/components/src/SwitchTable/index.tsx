/* eslint-disable max-len */
import React, { useContext, useEffect, useState, useImperativeHandle, forwardRef, Ref } from 'react'

import { FetchBaseQueryError }    from '@reduxjs/toolkit/query'
import { Badge, Divider, Form }   from 'antd'
import _                          from 'lodash'
import { defineMessage, useIntl } from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  deviceStatusColors,
  ColumnType,
  PasswordInput,
  showToast,
  cssStr
} from '@acx-ui/components'
import { showActionModal, Tooltip }  from '@acx-ui/components'
import type { TableHighlightFnArgs } from '@acx-ui/components'
import {
  Features,
  useIsSplitOn
} from '@acx-ui/feature-toggle'
import {
  DownloadOutlined
} from '@acx-ui/icons'
import { useImportSwitchesMutation,
  useLazyGetJwtTokenQuery,
  useSwitchListQuery } from '@acx-ui/rc/services'
import {
  getSwitchStatusString,
  SwitchRow,
  transformSwitchStatus,
  getSwitchName,
  DeviceConnectionStatus,
  getStackMemberStatus,
  usePollingTableQuery,
  getFilters,
  TableQuery,
  SwitchStatusEnum,
  isStrictOperationalSwitch,
  isFirmwareSupportAdminPassword,
  transformSwitchUnitStatus,
  FILTER,
  SEARCH,
  GROUPBY,
  getSwitchModel,
  getAdminPassword,
  SwitchRbacUrlsInfo,
  SwitchUrlsInfo
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { RolesEnum, RequestPayload, SwitchScopes }           from '@acx-ui/types'
import { filterByAccess, hasPermission, hasRoles }           from '@acx-ui/user'
import {
  exportMessageMapping,
  getIntl,
  noDataDisplay,
  getJwtTokenPayload,
  AccountVertical,
  useTrackLoadTime,
  widgetsMapping,
  getOpsApi
} from '@acx-ui/utils'

import { seriesSwitchStatusMapping }                       from '../DevicesWidget/helper'
import { CsvSize, ImportFileDrawer, ImportFileDrawerType } from '../ImportFileDrawer'
import { SwitchBlinkLEDsDrawer, SwitchInfo }               from '../SwitchBlinkLEDsDrawer'
import { SwitchCliSession }                                from '../SwitchCliSession'
import { useSwitchActions }                                from '../useSwitchActions'
import { VenueSelector }                                   from '../VenueSelector'

import {
  getGroupableConfig
} from './config'
import { SwitchTabContext } from './context'
import * as UI              from './styledComponents'
import { useExportCsv }     from './useExportCsv'

export const SwitchStatus = (
  { row, showText = true }: { row: SwitchRow, showText?: boolean }
) => {
  if(row){
    const { $t } = getIntl()
    const switchStatus = transformSwitchStatus(row.deviceStatus, row.configReady, row.syncedSwitchConfig, row.suspendingDeployTime)
    let switchStatusString = row.isFirstLevel || row.isGroup
      ? getSwitchStatusString(row)
      : transformSwitchUnitStatus(row.deviceStatus, row.configReady, row.syncedSwitchConfig)
    if(row.isGroup && row.deviceStatus?.toLocaleUpperCase() === SwitchStatusEnum.OPERATIONAL) {
      // For groupBy table display
      switchStatusString = $t({ defaultMessage: 'Online' })
    }
    return (
      <span data-testid='switch-status'>
        <Badge color={handleStatusColor(switchStatus.deviceStatus)}
          text={showText ? switchStatusString : ''}
        />
      </span>
    )
  }
  return null
}

const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}

const PasswordTooltip = {
  SYNCING: defineMessage({ defaultMessage: 'We are not able to determine the password before completing data synchronization.' }),
  SYNCED: defineMessage({ defaultMessage: 'To change the admin password in <venueSingular></venueSingular> setting, please go to <VenueSingular></VenueSingular> > <VenueSingular></VenueSingular> Configuration > Switch Configuration > AAA' }),
  CUSTOM: defineMessage({ defaultMessage: 'For security reasons, RUCKUS One is not able to show custom passwords that are set on the switch.' })
}

export const defaultSwitchPayload = {
  searchString: '',
  searchTargetFields: ['name', 'model', 'switchMac', 'ipAddress', 'serialNumber', 'firmware', 'extIp'],
  fields: [
    'check-all','name','deviceStatus','model','activeSerial','switchMac','ipAddress','venueName','uptime',
    'clientCount','cog','id','serialNumber','isStack','formStacking','venueId','switchName','configReady',
    'syncedSwitchConfig','syncDataId','operationalWarning','cliApplied','suspendingDeployTime', 'firmware',
    'syncedAdminPassword', 'adminPassword', 'extIp'
  ]
}

export type SwitchTableRefType = { openImportDrawer: ()=>void }

interface SwitchTableProps
  extends Omit<TableProps<SwitchRow>, 'columns'> {
  showAllColumns?: boolean,
  tableQuery?: TableQuery<SwitchRow, RequestPayload<unknown>, unknown>
  searchable?: boolean
  enableActions?: boolean
  filterableKeys?: { [key: string]: ColumnType['filterable'] }
}

export const SwitchTable = forwardRef((props : SwitchTableProps, ref?: Ref<SwitchTableRefType>) => {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const isSwitchRbacEnabled = useIsSplitOn(Features.SWITCH_RBAC_API)
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)
  const { showAllColumns, searchable, filterableKeys, settingsId = 'switch-table' } = props
  const linkToEditSwitch = useTenantLink('/devices/switch/')

  const { acx_account_vertical } = getJwtTokenPayload()
  const { setSwitchCount } = useContext(SwitchTabContext)
  const [ importVisible, setImportVisible] = useState(false)
  const [ importCsv, importResult ] = useImportSwitchesMutation()
  const isHospitality = acx_account_vertical === AccountVertical.HOSPITALITY ? AccountVertical.HOSPITALITY.toLowerCase() + '_' : ''
  const importTemplateLink = `assets/templates/${isHospitality}switches_import_template.csv`
  const importRBACTemplateLink = 'assets/templates/new_switches_import_template.csv'

  useImperativeHandle(ref, () => ({
    openImportDrawer: () => {
      setImportVisible(true)
    }
  }))

  const inlineTableQuery = usePollingTableQuery({
    useQuery: useSwitchListQuery,
    enableRbac: isSwitchRbacEnabled,
    defaultPayload: {
      filters: getFilters(params),
      ...defaultSwitchPayload
    },
    search: {
      searchString: '',
      searchTargetFields: defaultSwitchPayload.searchTargetFields
    },
    option: { skip: Boolean(props.tableQuery) },
    enableSelectAllPagesData: ['id', 'serialNumber', 'isStack', 'formStacking', 'deviceStatus', 'switchName', 'name',
      'model', 'venueId', 'configReady', 'syncedSwitchConfig', 'syncedAdminPassword', 'adminPassword', 'extIp' ],
    enableSelectAllExtraArg: {
      enableAggregateStackMember: false
    },
    pagination: { settingsId }
  })
  const tableQuery = props.tableQuery || inlineTableQuery

  useEffect(() => {
    setSwitchCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  useTrackLoadTime({
    itemName: widgetsMapping.SWITCH_TABLE,
    states: [tableQuery],
    isEnabled: isMonitoringPageEnabled
  })

  const { exportCsv, disabled } = useExportCsv<SwitchRow>(tableQuery as TableQuery<SwitchRow, RequestPayload<unknown>, unknown>)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)
  const enableSwitchExternalIp = useIsSplitOn(Features.SWITCH_EXTERNAL_IP_TOGGLE)
  const enableSwitchBlinkLed = useIsSplitOn(Features.SWITCH_BLINK_LED)

  const switchAction = useSwitchActions()
  const tableData = tableQuery.data?.data ?? []

  const statusFilterOptions = seriesSwitchStatusMapping().map(({ key, name, color }) => ({
    key, value: name, label: <UI.FilterBadge color={color} text={name} />
  }))

  const switchType = () => [
    { key: null, text: $t({ defaultMessage: 'All Switches' }) },
    { key: 'true', text: $t({ defaultMessage: 'Stack' }) },
    { key: 'false', text: $t({ defaultMessage: 'Standalone' }) }
  ] as Array<{ key: string, text: string }>

  const switchFilterOptions = switchType().map(({ key, text }) => ({
    key, value: text
  }))

  const [getJwtToken] = useLazyGetJwtTokenQuery()
  const [cliModalState, setCliModalOpen] = useState(false)
  const [cliData, setCliData] = useState({
    token: '',
    serialNumber: '',
    switchName: ''
  })
  const [stackTooltip, setStackTooltip] = useState('')

  const [blinkData, setBlinkData] = useState([] as SwitchInfo[])
  const [blinkDrawerVisible, setBlinkDrawerVisible] = useState(false)



  const getPasswordTooltip = (row: SwitchRow) => {
    if (!(row?.configReady && row?.syncedSwitchConfig)) {
      return $t(PasswordTooltip.SYNCING)
    } else if (!row?.syncedAdminPassword) {
      return $t(PasswordTooltip.CUSTOM)
    }
    return $t(PasswordTooltip.SYNCED)
  }

  const handleBlinkLeds = (switchRows: SwitchRow[])=> {

    const transformedSwitchRows: SwitchInfo[] = switchRows.map(row => ({
      switchId: row.id,
      venueId: row.venueId
    }))
    setBlinkData(transformedSwitchRows)
    setBlinkDrawerVisible(true)

  }

  const handleClickMatchPassword = (rows: SwitchRow[], clearSelection: () => void) => {
    showActionModal({
      type: 'confirm',
      title: $t({ defaultMessage: 'Match Admin Password to <VenueSingular></VenueSingular>' }),
      content: $t({ defaultMessage: 'The switch admin password will be set same as the <venueSingular></venueSingular> setting. Are you sure you want to proceed?' }),
      okText: $t({ defaultMessage: 'Match Password' }),
      cancelText: $t({ defaultMessage: 'Cancel' }),
      onOk: () => {
        const switchRows = rows
          .filter(row => isFirmwareSupportAdminPassword(row?.firmware ?? ''))

        const callback = () => {
          clearSelection?.()
          showToast({
            type: 'success',
            content: $t({ defaultMessage: 'Start admin password sync' })
          })
        }
        switchAction.doSyncAdminPassword(switchRows, callback)
      }
    })
  }

  const columns = React.useMemo(() => {
    return [{
      key: 'name',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'name',
      sorter: true,
      defaultSortOrder: 'ascend',
      fixed: 'left',
      searchable: searchable,
      filterKey: 'isStack',
      filterMultiple: false,
      filterValueNullable: false,
      filterable: filterableKeys ? switchFilterOptions : false,
      render: (_, row, __, highlightFn) => {
        const name = getSwitchName(row)
        return row.isFirstLevel ?
          <TenantLink
            to={`/devices/switch/${row.id || row.serialNumber}/${row.serialNumber}/details/overview`}
            style={{ lineHeight: '20px' }}
          >
            {searchable ? highlightFn(name) : name}
          </TenantLink> :
          `${name} (${getStackMemberStatus(row.unitStatus || '', true)})`
      }
    }, {
      key: 'deviceStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      fixed: 'left',
      filterMultiple: false,
      filterable: filterableKeys ? statusFilterOptions : false,
      groupable: filterableKeys && getGroupableConfig()?.deviceStatusGroupableOptions,
      render: (_, row) => <SwitchStatus row={row}/>
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      filterable: filterableKeys ? filterableKeys['model'] : false,
      sorter: true,
      searchable: searchable,
      groupable: filterableKeys && getGroupableConfig()?.modelGroupableOptions,
      render: (_, row, __, highlightFn) => {
        const model = row.model || getSwitchModel(row.serialNumber) || ''
        return searchable ? highlightFn(model) : model
      }
    },
    {
      key: 'syncedAdminPassword',
      title: $t({ defaultMessage: 'Admin Password' }),
      dataIndex: 'syncedAdminPassword',
      disabled: true,
      show: false,
      render: (data:boolean, row:SwitchRow) => {
        const isSupportAdminPassword = isFirmwareSupportAdminPassword(row?.firmware ?? '')
        const isShowPassword = row?.configReady && row?.syncedSwitchConfig && row?.syncedAdminPassword
        return isSupportAdminPassword
          ? <div onClick={e=> isShowPassword ? e.stopPropagation() : e}>
            <Tooltip title={getPasswordTooltip(row)}>{
              getAdminPassword(row, PasswordInput)
            }</Tooltip>
          </div>
          : noDataDisplay
      }
    },
    {
      key: 'activeSerial',
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'activeSerial',
      sorter: true,
      show: !!showAllColumns,
      searchable: searchable,
      render: (_, { activeSerial }, __, highlightFn) => {
        return searchable ? highlightFn(activeSerial) : activeSerial
      }
    }, {
      key: 'switchMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'switchMac',
      sorter: true,
      searchable: searchable,
      render: (_, { switchMac }, __, highlightFn) => {
        const mac = (typeof switchMac === 'string' && switchMac.toUpperCase()) || ''
        return searchable ? highlightFn(mac) : mac
      }
    }, {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      searchable: searchable,
      render: (_: string, { ipAddress }, __, highlightFn) => {
        const address = ipAddress || ''
        return searchable ? highlightFn(address) : address
      }
    }, {
      key: 'firmware',
      title: $t({ defaultMessage: 'Firmware' }),
      dataIndex: 'firmware',
      sorter: true
    },
    ...(params.venueId ? [] : [{
      key: 'venueName',
      title: $t({ defaultMessage: '<VenueSingular></VenueSingular>' }),
      dataIndex: 'venueName',
      sorter: true,
      filterKey: 'venueId',
      filterable: filterableKeys ? filterableKeys['venueId'] : false,
      render: (_: React.ReactNode, row: SwitchRow) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>
          {row.venueName}
        </TenantLink>
      )
    }]), {
      key: 'uptime',
      title: $t({ defaultMessage: 'Up Time' }),
      dataIndex: 'uptime',
      sorter: true
    }, {
      key: 'clientCount',
      title: $t({ defaultMessage: 'Connected Clients' }),
      dataIndex: 'clientCount',
      align: 'center',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (_, row) => (
        <TenantLink to={`/devices/switch/${row.id || row.serialNumber}/${row.serialNumber}/details/clients`}>
          {row.clientCount ? row.clientCount : ((row.unitStatus === undefined) ? 0 : '')}
        </TenantLink>
      )
    },
    ...( enableSwitchExternalIp ? [{
      key: 'extIp',
      title: $t({ defaultMessage: 'Ext. IP Address' }),
      dataIndex: 'extIp',
      sorter: true,
      searchable: searchable,
      show: false,
      render: (_: React.ReactNode, row: SwitchRow, __: number, highlightFn: TableHighlightFnArgs) => {
        const extIp = row.isFirstLevel ? row.extIp || noDataDisplay : ''
        return searchable ? highlightFn(extIp) : extIp
      }
    }] : [])
    ] as TableProps<SwitchRow>['columns']
  }, [$t, filterableKeys])

  const isActionVisible = (
    selectedRows: SwitchRow[],
    { selectOne }: { selectOne?: boolean }) => {
    return !!selectOne && selectedRows.length === 1
  }

  const isReadOnlyRole = hasRoles([RolesEnum.READ_ONLY]) ?? false
  const isSelectionVisible = searchable !== false
    && (hasPermission({
      scopes: [SwitchScopes.READ, SwitchScopes.UPDATE, SwitchScopes.DELETE],
      rbacOpsIds: [
        getOpsApi(SwitchRbacUrlsInfo.updateSwitch),
        getOpsApi(SwitchRbacUrlsInfo.deleteSwitches),
        getOpsApi(SwitchRbacUrlsInfo.addSwitch)
      ]
    }) || (isReadOnlyRole && enableSwitchBlinkLed)
    )

  const rowActions: TableProps<SwitchRow>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitch)],
    onClick: (selectedRows) => {
      const switchId = selectedRows[0].id ? selectedRows[0].id : selectedRows[0].serialNumber
      const serialNumber = selectedRows[0].serialNumber
      const isStack = selectedRows[0].isStack || selectedRows[0].formStacking
      if(isStack){
        navigate(`${linkToEditSwitch.pathname}/${switchId}/${serialNumber}/stack/edit`, { replace: false })
      }else{
        navigate(`${linkToEditSwitch.pathname}/${switchId}/${serialNumber}/edit`, { replace: false })
      }
    },
    disabled: (rows) => rows[0].deviceStatus === SwitchStatusEnum.DISCONNECTED
  }, {
    label: $t({ defaultMessage: 'CLI Session' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitch)],
    disabled: (rows) => {
      const row = rows[0]
      const isUpgradeFail = row.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
      const isOperational = row.deviceStatus === SwitchStatusEnum.OPERATIONAL
      return !(isOperational || isUpgradeFail)
    },
    onClick: async (rows) => {
      const row = rows[0]
      const token = (await getJwtToken({
        params: {
          tenantId: params.tenantId,
          serialNumber: row.serialNumber,
          venueId: row.venueId
        },
        enableRbac: isSwitchRbacEnabled
      }, true)
        .unwrap()).access_token || ''
      setCliData({ token, switchName: row.switchName || row.name || row.serialNumber, serialNumber: row.serialNumber })
      setTimeout(() => {
        setCliModalOpen(true)
      }, 1000)
    }
  }, {
    label: $t({ defaultMessage: 'Stack Switches' }),
    tooltip: stackTooltip,
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.updateSwitch)],
    disabled: (rows) => {
      const { hasStack, notOperational, invalid } = checkSelectedRowsStatus(rows)
      return !!notOperational || !!invalid || !!hasStack
    },
    onClick: (selectedRows) => {
      navigate(`${linkToEditSwitch.pathname}/stack/${selectedRows?.[0]?.venueId}/${selectedRows.map(row => row.serialNumber).join('_')}/add`)
    }
  },
  {
    label: $t({ defaultMessage: 'Match Admin Password to <VenueSingular></VenueSingular>' }),
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.syncSwitchesData)],
    disabled: (rows: SwitchRow[]) => {
      return rows.filter((row:SwitchRow) => {
        const isConfigSynced = row?.configReady && row?.syncedSwitchConfig
        const isOperational = row?.deviceStatus === SwitchStatusEnum.OPERATIONAL ||
          row?.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
        const isSupportAdminPassword = isFirmwareSupportAdminPassword(row?.firmware ?? '')
        return !row?.syncedAdminPassword && isConfigSynced && isOperational && isSupportAdminPassword
      }).length === 0
    },
    onClick: handleClickMatchPassword
  },
  {
    label: $t({ defaultMessage: 'Retry firmware update' }),
    scopeKey: [SwitchScopes.UPDATE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.retryFirmwareUpdate)],
    visible: (rows) => {
      const isFirmwareUpdateFailed = rows[0]?.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
      return isActionVisible(rows, { selectOne: true }) && isFirmwareUpdateFailed
    },
    onClick: async (rows, clearSelection) => {
      const switchId = rows[0].id ? rows[0].id : rows[0].serialNumber
      const callback = () => {
        clearSelection?.()
        showToast({
          type: 'success',
          content: $t({ defaultMessage: 'Start firmware upgrade retry' })
        })
      }
      switchAction.doRetryFirmwareUpdate({
        switchId,
        tenantId: params.tenantId,
        venueId: rows[0].venueId
      }, callback)
    }
  },
  ...(enableSwitchBlinkLed ? [{
    label: $t({ defaultMessage: 'Blink LEDs' }),
    key: 'SHOW_WITHOUT_RBAC_CHECK_BLINK_LEDs',
    rbacOpsIds: [getOpsApi(SwitchUrlsInfo.blinkLeds)],
    disabled: (rows: SwitchRow[]) => {
      return rows.filter((row: SwitchRow) => {
        const isOperational = row?.deviceStatus === SwitchStatusEnum.OPERATIONAL ||
              row?.deviceStatus === SwitchStatusEnum.FIRMWARE_UPD_FAIL
        return !isOperational
      }).length > 0
    },
    onClick: handleBlinkLeds
  }] : []),
  {
    label: $t({ defaultMessage: 'Delete' }),
    scopeKey: [SwitchScopes.DELETE],
    rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.deleteSwitches)],
    onClick: async (rows, clearSelection) => {
      switchAction.showDeleteSwitches(rows, params.tenantId, clearSelection)
    }
  }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH, groupBy?: GROUPBY) => {
    if (customFilters.deviceStatus?.includes('ONLINE')) {
      customFilters.syncedSwitchConfig = [true]
    } else if(!_.isEmpty(customFilters)) {
      customFilters.syncedSwitchConfig = null
    }

    if (customFilters.deviceStatus?.includes(SwitchStatusEnum.FIRMWARE_UPD_START)) {
      customFilters.deviceStatus = [
        SwitchStatusEnum.FIRMWARE_UPD_START,
        SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_PARAMETERS,
        SwitchStatusEnum.FIRMWARE_UPD_DOWNLOADING,
        SwitchStatusEnum.FIRMWARE_UPD_VALIDATING_IMAGE,
        SwitchStatusEnum.FIRMWARE_UPD_SYNCING_TO_REMOTE,
        SwitchStatusEnum.FIRMWARE_UPD_WRITING_TO_FLASH,
        SwitchStatusEnum.FIRMWARE_UPD_FAIL
      ]
    }

    tableQuery.handleFilterChange(customFilters, customSearch, groupBy)
  }

  const checkSelectedRowsStatus = (rows: SwitchRow[]) => {
    const modelFamily = rows[0]?.model?.split('-')[0]
    const venueId = rows[0]?.venueId

    const notOperational = rows.find(i =>
      !isStrictOperationalSwitch(i?.deviceStatus, i?.configReady, i?.syncedSwitchConfig ?? false))
    const invalid = rows.find(i =>
      i?.model.split('-')[0] !== modelFamily || i?.venueId !== venueId)
    const hasStack = rows.find(i => i.isStack || i.formStacking)

    return {
      hasStack,
      notOperational,
      invalid
    }
  }

  return <Loader states={[tableQuery]}>
    <div data-testid='switch-table'>
      <Table<SwitchRow>
        {...props}
        settingsId={settingsId}
        columns={columns}
        dataSource={tableData}
        getAllPagesData={tableQuery.getAllPagesData}
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
        searchableWidth={220}
        filterableWidth={140}
        rowKey={(record)=> record.isGroup || record.serialNumber + (!record.isFirstLevel ? record.switchMac + 'stack-member' : '')}
        rowActions={filterByAccess(rowActions)}
        rowSelection={isSelectionVisible ? {
          type: 'checkbox',
          renderCell: (checked, record, index, originNode) => {
            return record.isFirstLevel
              ? originNode
              : null
          },
          getCheckboxProps: (record) => ({
            disabled: !record.isFirstLevel
          }),
          onChange (selectedRowKeys, selectedRows) {
            const { hasStack, notOperational, invalid } = checkSelectedRowsStatus(selectedRows)

            setStackTooltip('')
            if(!!hasStack) {
              setStackTooltip($t({ defaultMessage: 'Switches should be standalone' }))
            } else if(!!notOperational) {
              setStackTooltip($t({ defaultMessage: 'Switch must be operational before you can stack switches' }))
            } else if(!!invalid) {
              setStackTooltip($t({ defaultMessage: 'Switches should belong to the same model family and <venueSingular></venueSingular>' }))
            }
          }
        } : undefined}
        actions={filterByAccess(props.enableActions ? [{
          label: $t({ defaultMessage: 'Add Switch' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitch)],
          onClick: () => {
            navigate(`${linkToEditSwitch.pathname}/add`)
          }
        }, {
          label: $t({ defaultMessage: 'Add Stack' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.addSwitch)],
          onClick: () => {
            navigate(`${linkToEditSwitch.pathname}/stack/add`)
          }
        }, {
          label: $t({ defaultMessage: 'Import from file' }),
          scopeKey: [SwitchScopes.CREATE],
          rbacOpsIds: [getOpsApi(SwitchRbacUrlsInfo.importSwitches)],
          onClick: () => {
            setImportVisible(true)
          }
        }
        ] : [])}
        iconButton={exportDevice ? {
          icon: <DownloadOutlined />,
          disabled,
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: exportCsv
        } : undefined}
        filterPersistence={true}
      />
      <SwitchCliSession
        modalState={cliModalState}
        setIsModalOpen={setCliModalOpen}
        serialNumber={cliData.serialNumber}
        jwtToken={cliData.token}
        switchName={cliData.switchName}
      />
      <SwitchBlinkLEDsDrawer
        visible={blinkDrawerVisible}
        setVisible={setBlinkDrawerVisible}
        switches={blinkData}
        isStack={false}
      />
      <ImportFileDrawer
        type={ImportFileDrawerType.Switch}
        title={$t({ defaultMessage: 'Import from file' })}
        maxSize={CsvSize['5MB']}
        maxEntries={50}
        acceptType={['csv']}
        templateLink={isSwitchRbacEnabled ? importRBACTemplateLink : importTemplateLink}
        visible={importVisible}
        isLoading={importResult.isLoading}
        importError={importResult.error as FetchBaseQueryError}
        importRequest={async (formData, values) => {
          await importCsv({
            params: {
              ...params,
              venueId: isSwitchRbacEnabled ? _.get(values, 'venueId') : params.venueId
            },
            payload: formData,
            enableRbac: isSwitchRbacEnabled
          }).unwrap().then(() => {
            setImportVisible(false)
          }).catch((error) => {
            console.log(error) // eslint-disable-line no-console
          })
        }}
        onClose={() => setImportVisible(false)}
      >
        {isSwitchRbacEnabled &&
        <div style={{ display: params.venueId ? 'none' : 'block' }}>
          <Divider style={{ margin: '4px 0px 20px', background: cssStr('--acx-neutrals-30') }} />
          <Form.Item
            name={'venueId'}
            label={$t({ defaultMessage: '<VenueSingular></VenueSingular>' })}
            rules={[{ required: true }]}
            initialValue={params.venueId}
            children={<VenueSelector />} />
        </div>
        }
      </ImportFileDrawer>
    </div>
  </Loader>
})
