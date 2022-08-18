import AutoSizer from 'react-virtualized-auto-sizer'

import { Incident, noDataSymbol, useAnalyticsFilter } from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, showToast }       from '@acx-ui/components'
import { Link }                                       from '@acx-ui/react-router-dom'

import { useIncidentsListQuery, IncidentNodeData, IncidentTableRows } from './services'
import { 
  getIncidentBySeverity,
  formatDate,
  formatDuration,
  clientImpactSort,
  LongIncidentDescription,
  getCategory,
  GetScope,
  severitySort,
  dateSort,
  defaultSort
} from './utils'


export const ColumnHeaders: TableProps<IncidentTableRows>['columns'] = [
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
      compare: (a, b) => dateSort(a.endTime, b.endTime),
      multiple: 2
    }
  },
  {
    title: 'Duration',
    dataIndex: 'duration',
    key: 'duration',
    render: (_, value) => formatDuration(value.startTime, value.endTime),
    sorter: {
      compare: (a, b) => defaultSort(a.duration, b.duration),
      multiple: 3
    }
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (_, value) => <LongIncidentDescription incident={value}/>,
    sorter: {
      compare: (a, b) => defaultSort(a.description, b.description),
      multiple: 4
    },
    ellipsis: true
  },
  {
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    render: (_, value) => getCategory(value.code),
    sorter: {
      compare: (a, b) => defaultSort(a.category, b.category),
      multiple: 5
    }
  },
  {
    title: 'Client Impact',
    dataIndex: 'clientCount',
    key: 'clientCount',
    sorter: {
      compare: (a, b) => clientImpactSort(a.clientCount, b.clientCount),
      multiple: 6
    }
  },
  {
    title: 'Impacted Clients',
    dataIndex: 'impactedClientCount',
    key: 'impactedClientCount',
    sorter: {
      compare: (a, b) => clientImpactSort(a.impactedClientCount, b.impactedClientCount),
      multiple: 7
    }
  },
  {
    title: 'Scope',
    dataIndex: 'scope',
    key: 'scope',
    render: (_, value) => <GetScope incident={value} />,
    sorter: {
      compare: (a, b) => clientImpactSort(a.scope, b.scope),
      multiple: 8
    }
  }, 
  {
    title: 'Type',
    dataIndex: 'type',
    key: 'type',
    sorter: {
      compare: (a, b) => defaultSort(a.type, b.type),
      multiple: 9
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

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          <Table
            type='tall'
            style={{ width, height }}
            dataSource={queryResults?.data}
            columns={ColumnHeaders}
            actions={actions}
            rowSelection={{ type: 'checkbox' }}
            pagination={{ pageSize: 10 }}
            rowKey='id'
            showSorterTooltip={false}
            columnEmptyText={noDataSymbol}
          />
        )}
      </AutoSizer>
    </Loader>
  )
}

export default IncidentTableWidget
