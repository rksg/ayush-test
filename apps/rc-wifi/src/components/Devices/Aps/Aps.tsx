import React from 'react'

import { Badge } from 'antd'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { ApExtraParams, useApListQuery, AP } from '@acx-ui/rc/services'
import {
  ApDeviceStatusEnum,
  APMeshRole,
  APView,
  DeviceConnectionStatus,
  transformApStatus,
  transformDisplayNumber,
  transformDisplayText,
  useTableQuery
} from '@acx-ui/rc/utils'
import { getFilters } from '@acx-ui/rc/utils'
import { useParams }  from '@acx-ui/react-router-dom'


const defaultPayload = {
  searchString: '',
  fields: [
    'name', 'deviceStatus', 'model', 'IP', 'apMac', 'venueName',
    'switchName', 'meshRole', 'clients', 'deviceGroupName',
    'apStatusData.APRadio.band', 'tags', 'serialNumber',
    'venueId', 'apStatusData.APRadio.radioId', 'apStatusData.APRadio.channel',
    'fwVersion'
  ]
}

const handleStatusColor = (color: DeviceConnectionStatus) => {
  switch (color) {
    case DeviceConnectionStatus.INITIAL:
      return 'var(--acx-neutrals-50)'
    case DeviceConnectionStatus.ALERTING:
      return 'var(--acx-semantics-yellow-40)'
    case DeviceConnectionStatus.DISCONNECTED:
      return 'var(--acx-semantics-red-60)'
    case DeviceConnectionStatus.CONNECTED:
      return 'var(--acx-semantics-green-50)'
  }
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

const getApStatus = function (status: ApDeviceStatusEnum) {
  const apStatus = transformApStatus(status, APView.AP_LIST)
  return (
    <span>
      <Badge color={handleStatusColor(apStatus.deviceStatus)}
        text={apStatus.message}
      />
    </span>
  )
}

export function Aps () {
  const params = useParams()
  const filters = getFilters(params)
  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    defaultPayload: {
      ...defaultPayload,
      filters
    }
  })

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
      title: 'AP Name',
      dataIndex: 'name',
      sorter: true
    }, {
      title: 'Status',
      dataIndex: 'deviceStatus',
      sorter: true,
      render: getApStatus
    }, {
      title: 'Model',
      dataIndex: 'model',
      sorter: true
    }, {
      title: 'IP Address',
      dataIndex: 'IP'
    }, {
      title: 'MAC Address',
      dataIndex: 'apMac',
      sorter: true
    }, {
      title: 'Venue',
      dataIndex: 'venueName',
      sorter: true
    }, {
      title: 'Switch',
      dataIndex: 'switchName'
    }, {
      title: 'Mesh Role',
      dataIndex: 'meshRole',
      sorter: true,
      render: transformMeshRole
    }, {
      title: 'Connected Clients',
      dataIndex: 'clients',
      align: 'center',
      render: transformDisplayNumber
    }, {
      title: 'AP Group',
      dataIndex: 'deviceGroupName',
      sorter: true
    }, {
      title: 'RF Channels',
      children: Object.entries(extraParams)
        .map(([channel, visible]) => visible ? {
          key: channel,
          dataIndex: channel,
          title: channelTitleMap[channel as keyof ApExtraParams],
          align: 'center',
          render: transformDisplayText
        } : null)
        .filter(Boolean)
    }, {
      title: 'Tags',
      dataIndex: 'tags',
      sorter: true
    }, {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      sorter: true
    }, {
      title: 'Version',
      dataIndex: 'fwVersion',
      sorter: true
    }] as TableProps<AP>['columns']
  }, [tableQuery.data?.extra])

  return (
    <Loader states={[tableQuery]}>
      <Table<AP>
        columns={columns}
        dataSource={tableData}
        rowKey='serialNumber'
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      />
    </Loader>
  )
}
