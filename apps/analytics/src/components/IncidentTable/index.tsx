import { useEffect, useState } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { Incident, noDataSymbol, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Card, Loader, Table, TableProps, showToast } from '@acx-ui/components'
import { Link }                                       from '@acx-ui/react-router-dom'

import { useIncidentsListQuery, IncidentNodeData } from './services'
import { 
  getIncidentBySeverity,
  formatDate,
  formatDuration,
  clientImpactSort,
  LongIncidentDescription,
  getCategory,
  GetScope,
  severitySort
} from './utils'


const ColumnHeaders: TableProps<Incident>['columns'] = [
  {
    title: 'Severity',
    dataIndex: 'severity',
    key: 'severity',
    render: (_, value) => getIncidentBySeverity(value.severity),
    sorter: {
      compare: (a, b) => severitySort(a.severity, b.severity),
      multiple: 1
    }
  },
  {
    title: 'Date',
    dataIndex: 'endTime',
    valueType: 'dateTime',
    key: 'endTime',
    render: (_, value) => {
      return <Link to={value.id}>{formatDate(value.endTime)}</Link>
    },
    sorter: {
      compare: (a, b) => clientImpactSort(a.endTime, b.endTime),
      multiple: 2
    }
  },
  {
    title: 'Duration',
    dataIndex: 'startTime',
    key: 'startTime',
    render: (_, value) => formatDuration(value.startTime, value.endTime),
    sorter: {
      compare: (a, b) => clientImpactSort(
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
    render: (_, value) => LongIncidentDescription(value),
    sorter: {
      compare: (a, b) => clientImpactSort(a.code, b.code)
    },
    ellipsis: true
  },
  {
    title: 'Category',
    dataIndex: 'sliceType',
    key: 'sliceType',
    render: (_, value) => getCategory(value.code),
    sorter: {
      compare: (a, b) => clientImpactSort(a.sliceType, b.sliceType)
    }
  },
  {
    title: 'Client Impact',
    dataIndex: 'clientCount',
    key: 'clientCount',
    sorter: {
      compare: (a, b) => clientImpactSort(a.clientCount, b.clientCount)
    }
  },
  {
    title: 'Impacted Clients',
    dataIndex: 'impactedClientCount',
    key: 'impactedClientCount',
    sorter: {
      compare: (a, b) => clientImpactSort(a.impactedClientCount, b.impactedClientCount)
    }
  },
  {
    title: 'Scope',
    dataIndex: 'mutedBy',
    key: 'mutedBy',
    render: (_, value) => <GetScope incident={value} />,
    sorter: {
      compare: (a, b) => clientImpactSort(a.mutedBy, b.mutedBy)
    }
  }, 
  {
    title: 'Type',
    dataIndex: 'sliceValue',
    key: 'sliceValue',
    sorter: {
      compare: (a, b) => clientImpactSort(a.sliceValue, b.sliceValue)
    }
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
              columnEmptyText={noDataSymbol}
              scroll={{ x: 'max-content' }}
            />
          )}
        </AutoSizer>
      </Card>
    </Loader>
  )
}

export default IncidentTableWidget
