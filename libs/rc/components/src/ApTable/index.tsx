/* eslint-disable max-len */
import React from 'react'

import { Badge, Space } from 'antd'
import { useIntl }      from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  deviceStatusColors,
  StackedBarChart,
  cssStr
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import {
  useApListQuery
} from '@acx-ui/rc/services'
import {
  ApDeviceStatusEnum,
  ApExtraParams,
  AP,
  APMeshRole,
  APView,
  DeviceConnectionStatus,
  transformApStatus,
  transformDisplayNumber,
  transformDisplayText,
  useTableQuery,
  TableQuery,
  RequestPayload
} from '@acx-ui/rc/utils'
import { getFilters }                         from '@acx-ui/rc/utils'
import { TenantLink, useNavigate, useParams } from '@acx-ui/react-router-dom'

import { useApActions } from '../useApActions'



export const defaultApPayload = {
  searchString: '',
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData.APRadio.band', 'tags', 'serialNumber',
    'venueId', 'apStatusData.APRadio.radioId', 'apStatusData.APRadio.channel',
    'fwVersion'
  ]
}

const handleStatusColor = (status: DeviceConnectionStatus) => {
  return `var(${deviceStatusColors[status]})`
}

const channelTitleMap: Record<keyof ApExtraParams, string> = {
  channel24: '2.4 GHz',
  channel50: '5 GHz',
  channelL50: 'LO 5 GHz',
  channelU50: 'HI 5 GHz',
  channel60: '6 GHz'
}

const transformMeshRole = (value: APMeshRole) => {
  let meshRole = ''
  switch (value) {
    case APMeshRole.EMAP:
      meshRole = 'eMAP'
      break
    case APMeshRole.DISABLED:
      meshRole = ''
      break
    default:
      meshRole = value
      break
  }
  return transformDisplayText(meshRole)
}

export const APStatus = (
  { status, showText = true }: { status: ApDeviceStatusEnum, showText?: boolean }
) => {
  const intl = useIntl()
  const apStatus = transformApStatus(intl, status, APView.AP_LIST)
  return (
    <span>
      <Badge color={handleStatusColor(apStatus.deviceStatus)}
        text={showText ? apStatus.message : ''}
      />
    </span>
  )
}

interface ApTableProps
  extends Omit<TableProps<AP>, 'columns'> {
  tableQuery?: TableQuery<AP, RequestPayload<unknown>, ApExtraParams>
}

export function ApTable (props: ApTableProps) {
  const { $t } = useIntl()
  const navigate = useNavigate()
  const params = useParams()
  const filters = getFilters(params)
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const tableQuery = props.tableQuery ?? useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultApPayload,
      filters
    },
    pollingInterval: 30000 //TODO: Wait for confirm the interval with PLM
  })

  const apAction = useApActions()
  const releaseTag = useIsSplitOn(Features.DEVICES)

  const tableData = tableQuery.data?.data ?? []

  const columns = React.useMemo(() => {
    const extraParams = tableQuery.data?.extra ?? {
      channel24: true,
      channel50: false,
      channelL50: false,
      channelU50: false,
      channel60: false
    }

    return [{
      key: 'name',
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true,
      render: (data, row) => (
        <TenantLink to={`/devices/wifi/${row.serialNumber}/details/overview`}>{data}</TenantLink>
      )
    }, {
      key: 'deviceStatus',
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      render: (status: unknown) => <APStatus status={status as ApDeviceStatusEnum} />
    }, {
      key: 'model',
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    }, {
      key: 'ip',
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'IP'
    }, {
      key: 'apMac',
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true
    }, {
      key: 'incidents',
      title: () => (
        <>
          { $t({ defaultMessage: 'Incidents' }) }
          <Table.SubTitle children={$t({ defaultMessage: 'Last 24 hours' })} />
        </>
      ),
      dataIndex: 'incidents',
      sorter: false,
      render: (data, row) => {
        //TODO: Shows breakdown by severity - with a counter for each severity
        return (<Space direction='horizontal'>
          <StackedBarChart
            style={{ height: 10, width: 40 }}
            data={[{
              category: 'emptyStatus',
              series: [{
                name: '',
                value: 1
              }]
            }]}
            showTooltip={false}
            showLabels={false}
            showTotal={false}
            barColors={[cssStr(deviceStatusColors.empty)]}
          />
          <TenantLink to={`/devices/wifi/${row.serialNumber}/details/analytics/incidents/overview`}>
            {data ? data: 0}
          </TenantLink>
        </Space>)
      }
    }, {
      key: 'venueName',
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true,
      render: (data, row) => (
        <TenantLink to={`/venues/${row.venueId}/venue-details/overview`}>{data}</TenantLink>
      )
    }, {
      key: 'switchName',
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName',
      render: (data, row) => {
        return (
          <TenantLink to={`/switches/${row.venueId}/details/overview`}>{data}</TenantLink>
        )
      }
    }, {
      key: 'meshRole',
      title: $t({ defaultMessage: 'Mesh Role' }),
      dataIndex: 'meshRole',
      sorter: true,
      render: transformMeshRole
    }, {
      key: 'clients',
      title: $t({ defaultMessage: 'Clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: (data, row) => {
        return releaseTag ?
          <TenantLink to={`/devices/wifi/${row.serialNumber}/details/clients`}>
            {transformDisplayNumber(row.clients)}
          </TenantLink>
          : <>{transformDisplayNumber(row.clients)}</>
      }
    }, {
      key: 'deviceGroupName',
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'deviceGroupName',
      sorter: true
      //TODO: Click-> Filter by AP group
    }, {
      key: 'rf-channels',
      title: $t({ defaultMessage: 'RF Channels' }),
      children: Object.entries(extraParams)
        .map(([channel, visible]) => visible ? {
          key: channel,
          dataIndex: channel,
          title: <Table.SubTitle children={channelTitleMap[channel as keyof ApExtraParams]} />,
          align: 'center',
          ellipsis: true,
          render: transformDisplayText
        } : null)
        .filter(Boolean)
    }, {
      key: 'tags',
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
      //TODO: Click-> Filter by Tag
    }, {
      key: 'serialNumber',
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      show: false,
      sorter: true
    }, {
      key: 'fwVersion',
      title: $t({ defaultMessage: 'Version' }),
      dataIndex: 'fwVersion',
      show: false,
      sorter: true
    }] as TableProps<AP>['columns']
  }, [$t, tableQuery.data?.extra])


  const isActionVisible = (
    selectedRows: AP[],
    { selectOne, isOperational }: { selectOne?: boolean, isOperational?: boolean }) => {
    let visible = true
    if (isOperational) {
      visible = selectedRows.every(ap => ap.deviceStatus === ApDeviceStatusEnum.OPERATIONAL)
    }
    if (selectOne) {
      visible = visible && selectedRows.length === 1
    }
    return visible
  }



  const rowActions: TableProps<AP>['rowActions'] = [{
    label: $t({ defaultMessage: 'Edit' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true }),
    onClick: (rows) => {
      navigate(`${rows[0].serialNumber}/edit/details`, { replace: false })
    }
  }, {
    label: $t({ defaultMessage: 'Delete' }),
    onClick: async (rows, clearSelection) => {
      apAction.showDeleteAps(rows, params.tenantId, clearSelection)
    }
  }, {
    label: $t({ defaultMessage: 'Reboot' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows, clearSelection) => {
      apAction.showRebootAp(rows[0].serialNumber, params.tenantId, clearSelection)
    }
  }, {
    label: $t({ defaultMessage: 'Download Log' }),
    visible: (rows) => isActionVisible(rows, { selectOne: true, isOperational: true }),
    onClick: (rows) => {
      apAction.showDownloadApLog(rows[0].serialNumber, params.tenantId)
    }
  }]

  return (
    <Loader states={[tableQuery]}>
      <Table<AP>
        {...props}
        columns={columns}
        dataSource={tableData}
        rowKey='serialNumber'
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
        rowActions={rowActions}
      />
    </Loader>
  )
}
