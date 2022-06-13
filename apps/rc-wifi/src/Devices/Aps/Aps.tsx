import React, { useEffect, useState } from 'react'

import {
  Loader,
  Table,
  TableProps
} from '@acx-ui/components'
import { useApListQuery } from '@acx-ui/rc/services'
import { useTableQuery }  from '@acx-ui/rc/utils'

import TableButtonBar from '../../NetworkForm/Venues/TableButtonBar'



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

const defaultArray: any[] = []

const getNetworkId = () => {
  return 'UNKNOWN-NETWORK-ID'
}

export function Aps () {
  const tableQuery = useTableQuery({
    useQuery: useApListQuery,
    apiParams: { networkId: getNetworkId() },
    defaultPayload
  })
  const [tableData, setTableData] = useState(defaultArray)

  useEffect(() => {
    if (tableQuery.data) {
      const data = tableQuery.data.data
      setTableData(data)
    }
  }, [tableQuery.data])

  const columns: TableProps<any>['columns'] = [
    {
      title: 'AP Name',
      dataIndex: 'name',
      sorter: true
    },
    {
      title: 'Status',
      dataIndex: 'deviceStatus',
      sorter: true
    },
    {
      title: 'Model',
      dataIndex: 'model',
      sorter: true
    },
    {
      title: 'IP Address',
      dataIndex: 'IP',
      sorter: true
    },
    {
      title: 'MAC Address',
      dataIndex: 'apMac',
      sorter: true
    },
    {
      title: 'Venue',
      dataIndex: 'switchName',
      sorter: true
    },
    {
      title: 'Switch',
      dataIndex: 'model',
      sorter: true
    },
    {
      title: 'Mesh Role',
      dataIndex: 'meshRole',
      sorter: true
    },
    {
      title: 'Connected Clients',
      dataIndex: 'clients',
      sorter: true
    },
    {
      title: 'AP Group',
      dataIndex: 'deviceGroupName',
      sorter: true
    },
    {
      title: 'RF Channels',
      dataIndex: 'apStatusData.APRadio.band',
      sorter: true
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      sorter: true
    },
    {
      title: 'Serial Number',
      dataIndex: 'serialNumber',
      sorter: true
    },
    {
      title: 'AP Group',
      dataIndex: 'deviceGroupName',
      sorter: true
    },
    {
      title: 'Version',
      dataIndex: 'fwVersion',
      sorter: true
    }]

  return (
    <>
      <TableButtonBar
        rowsSelected={tableQuery.selectedRowsData.length}
      />
      <Loader states={[tableQuery]}>
        <Table
          rowKey='id'
          columns={columns}
          dataSource={tableData}
          pagination={tableQuery.pagination}
          onChange={tableQuery.handleTableChange
          }
        />
      </Loader>
    </>
  )
}
