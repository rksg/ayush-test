import { useEffect, useState } from 'react'
import { SortOrder }           from 'antd/lib/table/interface'
import { Table }               from 'libs/common/components/src/components/Table'
import { PageHeader }          from 'libs/common/components/src/components/PageHeader'
import { CommonUrlsInfo }      from '@acx-ui/rc/utils'
import { useAlarmsListQuery }  from '@acx-ui/rc/services'
import { useParams }           from '@acx-ui/react-router-dom'

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
    sorter: false,
    render: function (row: any) {
      return transformDescription(row)
    }
  }
]

const transformDescription = (row: any) => {
  return row
}

const defaultPagination = {
  current: 1,
  pageSize: 5,
  total: 0
}

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
  sortField: 'startTime',
  sortOrder: 'DESC',
  page: defaultPagination.current,
  pageSize: defaultPagination.pageSize
}

const transferSorter = (order: string) => {
  return order === 'ascend' ? 'ASC' : 'DESC'
}

export function AlarmsTable () {
  const AlarmsTable = () => {
    const params = useParams()
    const [payload, setPayload] = useState(defaultPayload)
    const [pagination, setPagination] = useState(defaultPagination)
    const { data, error, isLoading } = useAlarmsListQuery({payload, params})
    const handleResponse = () => {
      if (data) {
        setPagination({
          ...defaultPagination,
          current: data.page,
          total: data.totalCount
        })
      }
    }

    useEffect(handleResponse, [data])

    const handleTableChange = (pagination: any, filters: any, sorter: any) => {
      const tableProps = {
        sortField: sorter.field || 'name',
        sortOrder: sorter.order ? transferSorter(sorter.order) : 'ASC',
        page: pagination.current,
        pageSize: pagination.pageSize
      }
      const request = { ...defaultPayload, ...tableProps }
      setPayload(request)
    }

    if (isLoading) return <div>Loading...</div>
    if (error) return <div role='alert'>error</div>
    return <Table columns={columns}
      dataSource={data.data}
      pagination={pagination}
      onChange={handleTableChange}
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
