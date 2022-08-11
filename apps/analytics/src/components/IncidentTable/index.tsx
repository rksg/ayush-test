import { useEffect, useState } from 'react'

import moment    from 'moment-timezone'
import AutoSizer from 'react-virtualized-auto-sizer'

import { useAnalyticsFilter }                            from '@acx-ui/analytics/utils'
import { Card, Loader, Table, TableProps, showToast } from '@acx-ui/components'
import { Link }                                       from '@acx-ui/react-router-dom'

import { useIncidentsListQuery, IncidentNodeData, IncidentNodeInfo, getIncidentBySeverity } from './services'

const ColumnHeaders: TableProps<IncidentNodeInfo>['columns'] = [
  {
    title: 'Severity',
    dataIndex: 'severity',
    key: 'severity',
    render: (_, value) => getIncidentBySeverity(value.severity)
  },
  {
    title: 'Date',
    dataIndex: 'startTime',
    valueType: 'dateTime',
    key: 'startTime',
    render: (_, value) => {
      return <Link to={`/analytics/incident/${value.id}`}>{
        moment(value.startTime).format('MMM DD yyyy HH:mm')
      }</Link>
    }
  },
  {
    title: 'Duration',
    dataIndex: 'endTime',
    key: 'endTime',
    render: (_, value) => {
      const start = moment(value.startTime, 'hh:mm:ss a')
      const end = moment(value.endTime, 'hh:mm:ss a')
      return end.diff(start, 'hours')
    }
  },
  {
    title: 'Description',
    dataIndex: 'code',
    key: 'code'
  },
  {
    title: 'Category',
    dataIndex: 'code',
    key: 'code'
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

const actions: TableProps<IncidentNodeInfo>['actions'] = [
  {
    label: 'Mute',
    onClick: (selectedRows) => showToast({
      type: 'info',
      content: `Mute ${selectedRows.length}`
    })
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
              style={{ height, width }}
              dataSource={data}
              columns={ColumnHeaders}
              actions={actions}
              rowSelection={{ type: 'checkbox' }}
              pagination={{ pageSize: 10 }}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default IncidentTableWidget
