import { useEffect, useState } from 'react'

import { PageHeader, Table, TableProps } from '@acx-ui/components'
import { Alarm, useAlarmsListQuery }     from '@acx-ui/rc/services'
import { CommonUrlsInfo, useTableQuery } from '@acx-ui/rc/utils'

const columns: TableProps<Alarm>['columns'] = [
  {
    title: 'Alarm Time',
    dataIndex: 'startTime',
    sorter: true,
    defaultSortOrder: 'ascend'
  },
  {
    title: 'Severity',
    dataIndex: 'severity',
    sorter: true
  },
  {
    title: 'Description',
    dataIndex: 'message',
    sorter: false
  }
]

const defaultPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
  fields: [
    'startTime',
    'severity',
    'message',
    'entity_id',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'entity_type',
    'venueName',
    'apName',
    'switchName',
    'sourceType'
  ],
  sortField: 'startTime'
}

const defaultArray: Alarm[] = []

export function AlarmsTable () {
  const AlarmsTable = () => {
    const tableQuery = useTableQuery({
      useQuery: useAlarmsListQuery,
      defaultPayload
    })
    const [tableData, setTableData] = useState(defaultArray)
    useEffect(()=>{
      if (tableQuery.data?.data) {
        setTableData(tableQuery.data.data)
      }
    }, [tableQuery.data])

    if (tableQuery.isLoading) return <div>Loading...</div>
    if (tableQuery.error) return <div role='alert'>error</div>
    return <Table columns={columns}
      dataSource={tableData}
      pagination={tableQuery.pagination}
      onChange={tableQuery.handleTableChange}
      style={{ width: '800px' }}
      rowKey='id' />
  }

  return <>
    <PageHeader
      title='Alarms'
    />
    <AlarmsTable />
  </>
}
