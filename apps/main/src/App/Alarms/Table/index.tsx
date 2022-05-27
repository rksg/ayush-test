import { useEffect, useState }                from 'react'
import { SortOrder }                          from 'antd/lib/table/interface'
import { Table }                              from 'libs/common/components/src/components/Table'
import { PageHeader }                         from 'libs/common/components/src/components/PageHeader'
import { CommonUrlsInfo, useTableQuery }      from '@acx-ui/rc/utils'
import { useAlarmsListQuery }                 from '@acx-ui/rc/services'
import { useParams }                          from '@acx-ui/react-router-dom'

const columns = [
  {
    title: 'Alarm Time',
    dataIndex: 'startTime',
    sorter: true,
    defaultSortOrder: 'ascend' as SortOrder
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

const defaultArray: any[] = []

export function AlarmsTable () {
  const AlarmsTable = () => {
    const params = useParams()
    const tableQuery = useTableQuery({
      api: useAlarmsListQuery,
      apiParams: params,
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
