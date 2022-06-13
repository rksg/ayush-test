import React, { useEffect, useState } from 'react'

import Column      from 'antd/lib/table/Column'
import ColumnGroup from 'antd/lib/table/ColumnGroup'

import {
  Loader,
  Table
} from '@acx-ui/components'
import { useApListQuery } from '@acx-ui/rc/services'
import {
  APMeshRole,
  APView,
  transformApStatus,
  transformDisplayNumber,
  transformDisplayText,
  useTableQuery
} from '@acx-ui/rc/utils'

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

  return (
    <Loader states={[tableQuery]}>
      <Table dataSource={tableData}
        rowKey='id'
        pagination={tableQuery.pagination}
        onChange={tableQuery.handleTableChange}
      >
        <Column title='AP Name' dataIndex='name' sorter={true} />
        <Column title='Status'
          dataIndex='deviceStatus'
          sorter={true}
          render={(value) => (
            <>
              {transformApStatus(value, APView.AP_LIST)}
            </>
          )} />
        <Column title='Model' dataIndex='model' sorter={true} />
        <Column title='IP Address' dataIndex='IP' />
        <Column title='MAC Address' dataIndex='apMac' sorter={true} />
        <Column title='Venue' dataIndex='venueName' sorter={true} />
        <Column title='Switch' dataIndex='switchName' />
        <Column title='Mesh Role'
          dataIndex='meshRole'
          sorter={true}
          render={
            (value) => (
              <>
                {transformMeshRole(value)}
              </>
            )} />
        <Column title='Connected Clients'
          dataIndex='clients'
          render={
            (value) => <>
              {transformDisplayNumber(value)}
            </>
          } />
        <Column title='AP Group' dataIndex='deviceGroupName' sorter={true} />
        <ColumnGroup title='RF Channels'>
          <Column title='2.4 GHz' dataIndex='apStatusData' key='firstName' />
          <Column title='5 GHz' dataIndex='apStatusData' key='deviceStatus' />
        </ColumnGroup>
        <Column title='Tags' dataIndex='tags' sorter={true} />
        <Column title='Serial Number' dataIndex='serialNumber' sorter={true} />
        <Column title='Version' dataIndex='fwVersion' sorter={true} />
      </Table>
    </Loader>
  )
}
