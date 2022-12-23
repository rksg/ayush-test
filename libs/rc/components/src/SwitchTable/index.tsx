/* eslint-disable max-len */
import { Space, Badge } from 'antd'
import { useIntl }      from 'react-intl'

import {
  Table,
  TableProps,
  Loader,
  deviceStatusColors
} from '@acx-ui/components'
import { useSwitchListQuery } from '@acx-ui/rc/services'
import {
  getSwitchStatusString,
  STACK_MEMBERSHIP,
  SwitchRow,
  transformSwitchStatus,
  getSwitchName,
  useTableQuery,
  DeviceConnectionStatus
} from '@acx-ui/rc/utils'
import { TenantLink, useParams } from '@acx-ui/react-router-dom'

import { useSwitchActions } from '../useSwitchActions'

export const SwitchStatus = (
  { row, showText = true }: { row: SwitchRow, showText?: boolean }
) => {
  const switchStatus = transformSwitchStatus(row.deviceStatus, row.configReady, row.syncedSwitchConfig, row.suspendingDeployTime)
  return (
    <span>
      <Badge color={handleStatusColor(switchStatus.deviceStatus)}
        text={showText ? getSwitchStatusString(row) : ''}
      />
    </span>
  )
}

const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}

export function SwitchTable ({ showAllColumns } : {
  showAllColumns?: boolean
}) {
  const { $t } = useIntl()
  const params = useParams()
  const tableQuery = useTableQuery({
    useQuery: useSwitchListQuery,
    defaultPayload: {
      fields: [
        'check-all','name','deviceStatus','model','activeSerial','switchMac','ipAddress','venueName','uptime',
        'clientCount','cog','id','serialNumber','isStack','formStacking','venueId','switchName','configReady',
        'syncedSwitchConfig','syncDataId','operationalWarning','cliApplied','suspendingDeployTime'
      ]
    }
  })

  const switchAction = useSwitchActions()
  const tableData = tableQuery.data?.data ?? []

  const getStackMemberStatus = (unitStatus: string) => {
    if (unitStatus === STACK_MEMBERSHIP.ACTIVE) {
      return $t({ defaultMessage: '(Active)' })
    } else if (unitStatus === STACK_MEMBERSHIP.STANDBY) {
      return $t({ defaultMessage: '(Standby)' })
    } else {
      return $t({ defaultMessage: '(Member)' })
    }
  }

  const columns: TableProps<SwitchRow>['columns'] = [{
    key: 'name',
    title: $t({ defaultMessage: 'Switch' }),
    dataIndex: 'name',
    sorter: true,
    defaultSortOrder: 'ascend',
    disable: true,
    render: (data, row) => {
      return <>
        {
          row.isFirstLevel ?
            <TenantLink to={`/devices/switch/${row.id}/${row.serialNumber}/details/overview`}>
              {getSwitchName(row)}
            </TenantLink> :
            <Space>
              <>{getSwitchName(row)}</>
              {getStackMemberStatus(row.unitStatus || '')}
            </Space>
        }
      </>
    }
  }, {
    key: 'deviceStatus',
    title: $t({ defaultMessage: 'Status' }),
    dataIndex: 'deviceStatus',
    sorter: true,
    render: (data, row) => <SwitchStatus row={row} />
  }, {
    key: 'model',
    title: $t({ defaultMessage: 'Model' }),
    dataIndex: 'model',
    sorter: true
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
    render: (data) => typeof data === 'string' && data.toUpperCase()
  }, {
    key: 'ipAddress',
    title: $t({ defaultMessage: 'IP Address' }),
    dataIndex: 'ipAddress',
    sorter: true
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
      <TenantLink to={`/devices/switch/${row.id}/${row.serialNumber}/details/clients`}>{data || 0}</TenantLink>
    )
  }
  // { TODO: tags
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
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'CLI Session' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    disabled: true,
    onClick: () => {
      // TODO:
    }
  }, {
    label: $t({ defaultMessage: 'Stack Switches' }),
    disabled: true,
    onClick: () => {
      // TODO:
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
    <Table
      columns={columns}
      dataSource={tableData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      rowKey='serialNumber'
      rowActions={rowActions}
      rowSelection={{
        type: 'checkbox',
        renderCell: (checked, record, index, originNode) => {
          return record.isFirstLevel
            ? originNode
            : null
        }
      }}
    />
    {/* TODO: rowKey{(record)=> record.serialNumber + (record.isFirstLevel && 'stack')} */}
  </Loader>
}
