/* eslint-disable max-len */
import { useState } from 'react'

import { Space, Badge } from 'antd'
import { useIntl }      from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  deviceStatusColors,
  ColumnType
} from '@acx-ui/components'
import { hasAccesses }                                 from '@acx-ui/rbac'
import { useLazyGetJwtTokenQuery, useSwitchListQuery } from '@acx-ui/rc/services'
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
  isStrictOperationalSwitch
} from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams, useTenantLink } from '@acx-ui/react-router-dom'

import { seriesSwitchStatusMapping } from '../DevicesWidget/helper'
import { SwitchCliSession }          from '../SwitchCliSession'
import { useSwitchActions }          from '../useSwitchActions'

export const SwitchStatus = (
  { row, showText = true }: { row: SwitchRow, showText?: boolean }
) => {
  if(row){
    const switchStatus = transformSwitchStatus(row.deviceStatus, row.configReady, row.syncedSwitchConfig, row.suspendingDeployTime)
    return (
      <span>
        <Badge color={handleStatusColor(switchStatus.deviceStatus)}
          text={showText ? getSwitchStatusString(row) : ''}
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
  searchTargetFields: ['name', 'model', 'switchMac', 'ipAddress'],
  fields: [
    'check-all','name','deviceStatus','model','activeSerial','switchMac','ipAddress','venueName','uptime',
    'clientCount','cog','id','serialNumber','isStack','formStacking','venueId','switchName','configReady',
    'syncedSwitchConfig','syncDataId','operationalWarning','cliApplied','suspendingDeployTime'
  ]
}

export function SwitchTable (props : {
  showAllColumns?: boolean,
  tableQuery?: TableQuery<SwitchRow, RequestPayload<unknown>, unknown>
  searchable?: boolean
  filterableKeys?: { [key: string]: ColumnType['filterable'] }
}) {
  const { $t } = useIntl()
  const params = useParams()
  const navigate = useNavigate()
  const { showAllColumns, searchable, filterableKeys } = props
  const linkToEditSwitch = useTenantLink('/devices/switch/')

  const inlineTableQuery = usePollingTableQuery({
    useQuery: useSwitchListQuery,
    defaultPayload: {
      filters: getFilters(params),
      ...defaultSwitchPayload,
      search: {
        searchTargetFields: defaultSwitchPayload.searchTargetFields
      }
    },
    option: { skip: Boolean(props.tableQuery) }
  })
  const tableQuery = props.tableQuery || inlineTableQuery

  const switchAction = useSwitchActions()
  const tableData = tableQuery.data?.data ?? []

  const statusFilterOptions = seriesSwitchStatusMapping().map(({ key, name }) => ({
    key, value: name
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

  const columns: TableProps<SwitchRow>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend',
    disable: true,
    searchable: searchable,
    filterKey: 'isStack',
    filterMultiple: false,
    filterValueNullable: false,
    filterable: filterableKeys ? switchFilterOptions : false,
    render: (data, row) => {
      return row.isFirstLevel ?
        <TenantLink to={`/devices/switch/${row.id || row.serialNumber}/${row.serialNumber}/details/overview`}>
          {getSwitchName(row)}
        </TenantLink> :
        <Space>
          <>{getSwitchName(row)}</>
          <span>({getStackMemberStatus(row.unitStatus || '', true)})</span>
        </Space>
    }
  }, {
    key: 'deviceStatus',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'deviceStatus',
    sorter: true,
    filterMultiple: false,
    filterable: filterableKeys ? statusFilterOptions : false,
    render: (data, row) => <SwitchStatus row={row} />
  }, {
    key: 'model',
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    sorter: true,
    searchable: searchable
  }, {
    key: 'activeSerial',
    title: $t({ defaultMessage: 'Serial Number' }),
    dataIndex: 'activeSerial',
    sorter: true,
    show: !!showAllColumns
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
  },
  // { TODO: Health scope
  //   key: 'incidents',
  //   title: $t({ defaultMessage: 'Incidents' }),
  //   dataIndex: 'incidents',
  // },
  {
    key: 'venueName',
    title: $t({ defaultMessage: 'Venue' }),
    dataIndex: 'venueName',
    sorter: true,
    filterKey: 'venueId',
    filterable: filterableKeys ? filterableKeys['venueId'] : false,
    render: (data, row) => (
      <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
    )
  }, {
    key: 'uptime',
    title: $t({ defaultMessage: 'Up Time' }),
    dataIndex: 'uptime',
    sorter: true
  }, {
    key: 'clientCount',
    title: $t({ defaultMessage: 'Clients' }),
    dataIndex: 'clientCount',
    sorter: true,
    render: (data, row) => (
      <TenantLink to={`/devices/switch/${row.id || row.serialNumber}/${row.serialNumber}/details/clients`}>
        {data ? data : ((row.unitStatus === undefined) ? 0 : '') }
      </TenantLink>
    )
  }
  // { // TODO: Waiting for TAG feature support
  //   key: 'tags',
  //   title: $t({ defaultMessage: 'Tags' }),
  //   dataIndex: 'tags'
  // }
  ]

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
      setCliModalOpen(true)
    }
  }, {
    label: $t({ defaultMessage: 'Stack Switches' }),
    tooltip: stackTooltip, // TODO: tooltip won't show when button is disabled
    disabled: (rows) => {
      const modelFamily = rows[0]?.model?.split('-')[0]
      const venueId = rows[0]?.venueId
      const notOperational = rows.find(i =>
        !isStrictOperationalSwitch(i?.deviceStatus, i?.configReady, i?.syncedSwitchConfig ?? false))
      const invalid = rows.find(i =>
        i?.model.split('-')[0] !== modelFamily || i?.venueId !== venueId)
      const hasStack = rows.find(i => i.isStack || i.formStacking)
      setStackTooltip('')

      if(!!hasStack) {
        setStackTooltip($t({ defaultMessage: 'Switches should be standalone' }))
      } else if(!!notOperational) {
        setStackTooltip($t({ defaultMessage: 'Switch must be operational before you can stack switches' }))
      } else if(!!invalid) {
        setStackTooltip($t({ defaultMessage: 'Switches should belong to the same model family and venue' }))
      }

      return !!notOperational || !!invalid || !!hasStack
    },
    onClick: (selectedRows) => {
      navigate(`stack/${selectedRows?.[0]?.venueId}/${selectedRows.map(row => row.serialNumber).join('_')}/add`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (rows, clearSelection) => {
      switchAction.showDeleteSwitches(rows, params.tenantId, clearSelection)
    }
  }]

  // TODO: add search string and filter to retrieve data
  // const retrieveData () => {}

  return <Loader states={[tableQuery]}>
    <Table<SwitchRow>
      columns={columns}
      dataSource={tableData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      onFilterChange={tableQuery.handleFilterChange}
      enableApiFilter={true}
      rowKey={(record)=> record.serialNumber + (!record.isFirstLevel ? 'stack-member' : '')}
      rowActions={hasAccesses(rowActions)}
      rowSelection={{
        type: 'checkbox',
        renderCell: (checked, record, index, originNode) => {
          return record.isFirstLevel
            ? originNode
            : null
        }
      }}
    />
    <SwitchCliSession
      modalState={cliModalState}
      setIsModalOpen={setCliModalOpen}
      serialNumber={cliData.serialNumber}
      jwtToken={cliData.token}
      switchName={cliData.switchName}
    />
  </Loader>
}
