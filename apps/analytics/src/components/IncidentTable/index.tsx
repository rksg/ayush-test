import { useEffect, useState } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { Incident, useAnalyticsFilter }               from '@acx-ui/analytics/utils'
import { Card, Loader, Table, TableProps, showToast } from '@acx-ui/components'
import { Link }                                       from '@acx-ui/react-router-dom'

import { useIncidentsListQuery, IncidentNodeData } from './services'
import { 
  getIncidentBySeverity,
  formatDate,
  formatDuration,
  sorterCompare,
  LongIncidentDescription,
  getCategory
} from './utils'


const ColumnHeaders: TableProps<Incident>['columns'] = [
  {
    title: 'Severity',
    dataIndex: 'severity',
    key: 'severity',
    render: (_, value) => getIncidentBySeverity(value.severity),
    sorter: {
      compare: (a, b) => sorterCompare(a.severity, b.severity),
      multiple: 1
    }
  },
  {
    title: 'Date',
    dataIndex: 'startTime',
    valueType: 'dateTime',
    key: 'startTime',
    render: (_, value) => {
      return <Link to={`/analytics/incident/${value.id}`}>{formatDate(value.startTime)}</Link>
    },
    sorter: {
      compare: (a, b) => sorterCompare(a.startTime, b.startTime),
      multiple: 2
    }
  },
  {
    title: 'Duration',
    dataIndex: 'endTime',
    key: 'endTime',
    render: (_, value) => formatDuration(value.startTime, value.endTime),
    sorter: {
      compare: (a, b) => sorterCompare(
        formatDuration(a.startTime, a.endTime),
        formatDuration(b.startTime, b.endTime)
      ),
      multiple: 2
    }
  },
  {
    title: 'Description',
    dataIndex: 'code',
    key: 'code',
    render: (_, value) => LongIncidentDescription(value)
  },
  {
    title: 'Category',
    dataIndex: 'sliceType',
    key: 'sliceType',
    render: (_, value) => getCategory(value.code)
  },
  {
    title: 'Client Impact',
    dataIndex: 'clientCount',
    key: 'clientCount'
  },
  {
    title: 'Impacted Clients',
    dataIndex: 'impactedClientCount',
    key: 'impactedClientCount'
  }
]

export type IncidentTableProps = TableProps<IncidentNodeData>

const actions: TableProps<Incident>['actions'] = [
  {
    label: 'Mute',
    onClick: (selectedRows) => {
      showToast({
        type: 'info',
        content: `Mute ${selectedRows[0].id}`
      })
    }
  }
]

const IncidentTableWidget = () => {
  const filters = useAnalyticsFilter()
  const queryResults = useIncidentsListQuery(filters)
  const [data, setData] = useState<IncidentNodeData>([])

  useEffect(() => {
    if (queryResults && queryResults.data) {
      setData(queryResults.data)
    }
  }, [queryResults, queryResults.data])


  return (
    <Loader states={[queryResults]}>
      <Card>
        <AutoSizer>
          {({ height, width }) => (
            <Table
              type='tall'
              style={{ width, height }}
              dataSource={data}
              columns={ColumnHeaders}
              actions={actions}
              rowSelection={{ type: 'checkbox' }}
              pagination={{ pageSize: 10 }}
              rowKey='id'
              showSorterTooltip={false}
              scroll={{ y: 0 }}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default IncidentTableWidget
