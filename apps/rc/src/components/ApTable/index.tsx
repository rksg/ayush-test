import React from 'react'

import { Badge }   from 'antd'
import { useIntl } from 'react-intl'


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

export function ApTable () {
  const { $t } = useIntl()
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
      title: $t({ defaultMessage: 'AP Name' }),
      dataIndex: 'name',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'Status' }),
      dataIndex: 'deviceStatus',
      sorter: true,
      render: getApStatus
    }, {
      title: $t({ defaultMessage: 'Model' }),
      dataIndex: 'model',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'IP Address' }),
      dataIndex: 'IP'
    }, {
      title: $t({ defaultMessage: 'MAC Address' }),
      dataIndex: 'apMac',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'Venue' }),
      dataIndex: 'venueName',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'Switch' }),
      dataIndex: 'switchName'
    }, {
      title: $t({ defaultMessage: 'Mesh Role' }),
      dataIndex: 'meshRole',
      sorter: true,
      render: transformMeshRole
    }, {
      title: $t({ defaultMessage: 'Connected Clients' }),
      dataIndex: 'clients',
      align: 'center',
      render: transformDisplayNumber
    }, {
      title: $t({ defaultMessage: 'AP Group' }),
      dataIndex: 'deviceGroupName',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'RF Channels' }),
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
      title: $t({ defaultMessage: 'Tags' }),
      dataIndex: 'tags',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'Serial Number' }),
      dataIndex: 'serialNumber',
      sorter: true
    }, {
      title: $t({ defaultMessage: 'Version' }),
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
