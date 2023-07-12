/* eslint-disable max-len */
import React, { useContext, useEffect, useState, useImperativeHandle, forwardRef, Ref } from 'react'

import { FetchBaseQueryError } from '@reduxjs/toolkit/dist/query'
import { Badge }               from 'antd'
import { useIntl }             from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  deviceStatusColors,
  ColumnType,
  showToast
} from '@acx-ui/components'
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
  RequestPayload,
  SwitchStatusEnum,
  isStrictOperationalSwitch,
  transformSwitchUnitStatus,
  FILTER,
  SEARCH,
  GROUPBY,
  getSwitchModel
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'
import { filterByAccess }                                    from '@acx-ui/user'
import { getIntl }                                           from '@acx-ui/utils'

import { seriesSwitchStatusMapping } from '../DevicesWidget/helper'
import { CsvSize, ImportFileDrawer } from '../ImportFileDrawer'
import { SwitchCliSession }          from '../SwitchCliSession'
import { useSwitchActions }          from '../useSwitchActions'

import {
  getGroupableConfig
} from './config'
import { SwitchTabContext } from './context'
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
      <span>
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

export const defaultSwitchPayload = {
  searchString: '',
  searchTargetFields: ['name', 'model', 'switchMac', 'ipAddress', 'serialNumber', 'firmware'],
  fields: [
    'check-all','name','deviceStatus','model','activeSerial','switchMac','ipAddress','venueName','uptime',
    'clientCount','cog','id','serialNumber','isStack','formStacking','venueId','switchName','configReady',
    'syncedSwitchConfig','syncDataId','operationalWarning','cliApplied','suspendingDeployTime', 'firmware'
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
  const { showAllColumns, searchable, filterableKeys } = props
  const linkToEditSwitch = useTenantLink('/devices/switch/')

  const { setSwitchCount } = useContext(SwitchTabContext)
  const [ importVisible, setImportVisible] = useState(false)
  const [ importCsv, importResult ] = useImportSwitchesMutation()
  const importTemplateLink = 'assets/templates/switches_import_template.csv'

  useImperativeHandle(ref, () => ({
    openImportDrawer: () => {
      setImportVisible(true)
    }
  }))

  const inlineTableQuery = usePollingTableQuery({
    useQuery: useSwitchListQuery,
    defaultPayload: {
      filters: getFilters(params),
      ...defaultSwitchPayload
    },
    search: {
      searchTargetFields: defaultSwitchPayload.searchTargetFields
    },
    option: { skip: Boolean(props.tableQuery) },
    enableSelectAllPagesData: ['id', 'serialNumber', 'isStack', 'formStacking', 'deviceStatus', 'switchName', 'name',
      'model', 'venueId', 'configReady', 'syncedSwitchConfig' ]
  })
  const tableQuery = props.tableQuery || inlineTableQuery

  useEffect(() => {
    setSwitchCount?.(tableQuery.data?.totalCount || 0)
  }, [tableQuery.data])

  const { exportCsv, disabled } = useExportCsv<SwitchRow>(tableQuery as TableQuery<SwitchRow, RequestPayload<unknown>, unknown>)
  const exportDevice = useIsSplitOn(Features.EXPORT_DEVICE)

  const switchAction = useSwitchActions()
  const tableData = tableQuery.data?.data ?? []

  const statusFilterOptions = seriesSwitchStatusMapping().map(({ key, name, color }) => ({
    key, value: name, label: <Badge color={color} text={name} />
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
      render: (data, row) => {
        return row.isFirstLevel ?
          <TenantLink
            to={`/devices/switch/${row.id || row.serialNumber}/${row.serialNumber}/details/overview`}
            style={{ lineHeight: '20px' }}
          >
            {getSwitchName(row)}
          </TenantLink> :
          <div>
            {getSwitchName(row)}
            <span style={{ marginLeft: '4px' }}>({getStackMemberStatus(row.unitStatus || '', true)})</span>
          </div>
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
      render: (data, row) => <SwitchStatus row={row}/>
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      filterable: filterableKeys ? filterableKeys['model'] : false,
      sorter: true,
      searchable: searchable,
      groupable: filterableKeys && getGroupableConfig()?.modelGroupableOptions,
      render: (data, row) => {
        return data || getSwitchModel(row.serialNumber)
      }
    }, {
      key: 'activeSerial',
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'activeSerial',
      sorter: true,
      show: !!showAllColumns,
      searchable: searchable
    }, {
      key: 'switchMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'switchMac',
      sorter: true,
      searchable: searchable,
      render: (data) => typeof data === 'string' && data.toUpperCase()
    }, {
      key: 'ipAddress',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'ipAddress',
      sorter: true,
      searchable: searchable
    }, {
      key: 'firmware',
      title: $t({ defaultMessage: 'Firmware' }),
      dataIndex: 'firmware',
      sorter: true
    },
    // { TODO: Health scope
    //   key: 'incidents',
    //   title: $t({ defaultMessage: 'Incidents' }),
    //   dataIndex: 'incidents',
    // },
    ...(params.venueId ? [] : [{
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      filterKey: 'venueId',
      filterable: filterableKeys ? filterableKeys['venueId'] : false,
      render: (data: React.ReactNode, row: SwitchRow) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      )
    }]), {
      key: 'uptime',
      title: $t({ defaultMessage: 'Up Time' }),
      dataIndex: 'uptime',
      sorter: true
    }, {
      key: 'clientCount',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clientCount',
      align: 'center',
      sorter: true,
      sortDirections: ['descend', 'ascend', 'descend'],
      render: (data, row) => (
        <TenantLink to={`/devices/switch/${row.id || row.serialNumber}/${row.serialNumber}/details/clients`}>
          {data ? data : ((row.unitStatus === undefined) ? 0 : '')}
        </TenantLink>
      )
    }
      // { // TODO: Waiting for TAG feature support
      //   key: 'tags',
      //   title: $t({ defaultMessage: 'Tags' }),
      //   dataIndex: 'tags'
      // }
    ] as TableProps<SwitchRow>['columns']
  }, [$t, filterableKeys])

  const isActionVisible = (
    selectedRows: SwitchRow[],
    { selectOne }: { selectOne?: boolean }) => {
    return !!selectOne && selectedRows.length === 1
  }

  const rowActions: TableProps<SwitchRow>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
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
    key: 'EnableCliSessionButton',
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    disabled: (rows) => {
      const row = rows[0]
      return row.deviceStatus !== SwitchStatusEnum.OPERATIONAL
    },
    onClick: async (rows) => {
      const row = rows[0]
      const token = (await getJwtToken({ params: { tenantId: params.tenantId, serialNumber: row.serialNumber } }, true)
        .unwrap()).access_token || ''
      setCliData({ token, switchName: row.switchName || row.name || row.serialNumber, serialNumber: row.serialNumber })
      setTimeout(() => {
        setCliModalOpen(true)
      }, 1000)
    }
  }, {
    label: $t({ defaultMessage: 'Stack Switches' }),
    tooltip: stackTooltip,
    disabled: (rows) => {
      const { hasStack, notOperational, invalid } = checkSelectedRowsStatus(rows)
      return !!notOperational || !!invalid || !!hasStack
    },
    onClick: (selectedRows) => {
      navigate(`${linkToEditSwitch.pathname}/stack/${selectedRows?.[0]?.venueId}/${selectedRows.map(row => row.serialNumber).join('_')}/add`)
    }
  }, {
    label: $t({ defaultMessage: 'Retry firmware update' }),
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
      switchAction.doRetryFirmwareUpdate(switchId, params.tenantId, callback)
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (rows, clearSelection) => {
      switchAction.showDeleteSwitches(rows, params.tenantId, clearSelection)
    }
  }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH, groupBy?: GROUPBY) => {
    if (customFilters.deviceStatus?.includes('ONLINE')) {
      customFilters.syncedSwitchConfig = [true]
    } else {
      customFilters.syncedSwitchConfig = null
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
    <Table<SwitchRow>
      {...props}
      settingsId='switch-table'
      columns={columns}
      dataSource={tableData}
      getAllPagesData={tableQuery.getAllPagesData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={handleFilterChange}
      enableApiFilter={true}
      searchableWidth={220}
      filterableWidth={140}
      rowKey={(record)=> record.isGroup || record.serialNumber + (!record.isFirstLevel ? 'stack-member' : '')}
      rowActions={filterByAccess(rowActions)}
      rowSelection={searchable !== false ? {
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
            setStackTooltip($t({ defaultMessage: 'Switches should belong to the same model family and venue' }))
          }
        }
      } : undefined}
      actions={filterByAccess(props.enableActions ? [{
        label: $t({ defaultMessage: 'Add Switch' }),
        onClick: () => {
          navigate(`${linkToEditSwitch.pathname}/add`)
        }
      }, {
        label: $t({ defaultMessage: 'Add Stack' }),
        onClick: () => {
          navigate(`${linkToEditSwitch.pathname}/stack/add`)
        }
      }, {
        label: $t({ defaultMessage: 'Import from file' }),
        onClick: () => {
          setImportVisible(true)
        }
      }
      ] : [])}
      // eslint-disable-next-line max-len
      iconButton={exportDevice ? { icon: <DownloadOutlined />, disabled, onClick: exportCsv } : undefined}
    />
    <SwitchCliSession
      modalState={cliModalState}
      setIsModalOpen={setCliModalOpen}
      serialNumber={cliData.serialNumber}
      jwtToken={cliData.token}
      switchName={cliData.switchName}
    />
    <ImportFileDrawer type='Switch'
      title={$t({ defaultMessage: 'Import from file' })}
      maxSize={CsvSize['5MB']}
      maxEntries={50}
      acceptType={['csv']}
      templateLink={importTemplateLink}
      visible={importVisible}
      isLoading={importResult.isLoading}
      importError={importResult.error as FetchBaseQueryError}
      importRequest={async (formData) => {
        await importCsv({ params, payload: formData }
        ).unwrap().then(() => {
          setImportVisible(false)
        }).catch((error) => {
          console.log(error) // eslint-disable-line no-console
        })
      }}
      onClose={() => setImportVisible(false)}
    />
  </Loader>
})
