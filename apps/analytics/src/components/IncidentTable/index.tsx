import AutoSizer from 'react-virtualized-auto-sizer'

import { Incident, noDataSymbol, IncidentFilter } from '@acx-ui/analytics/utils'
import { Loader, TableProps, showToast }          from '@acx-ui/components'
import { Link }                                   from '@acx-ui/react-router-dom'

import { useIncidentsListQuery, IncidentNodeData, IncidentTableRows } from './services'
import * as UI                                                        from './styledComponents'
import {
  GetIncidentBySeverity,
  FormatDate,
  formatDuration,
  clientImpactSort,
  ShortIncidentDescription,
  GetCategory,
  GetScope,
  severitySort,
  dateSort,
  defaultSort,
  ClientImpact
} from './utils'


const ColumnHeaders: TableProps<IncidentTableRows>['columns'] = [
  {
    title: 'Severity',
    width: '8%',
    dataIndex: 'severity',
    key: 'severity',
    render: (_, value) => <GetIncidentBySeverity value={value.severity}/>,
    sorter: {
      compare: (a, b) => severitySort(a.severity, b.severity),
      multiple: 1
    }
  },
  {
    title: 'Date',
    width: '12%',
    dataIndex: 'endTime',
    valueType: 'dateTime',
    key: 'endTime',
    render: (_, value) => {
      return <Link to={value.id}><FormatDate datetimestamp={value.endTime}/></Link>
    },
    sorter: {
      compare: (a, b) => dateSort(a.endTime, b.endTime),
      multiple: 2
    }
  },
  {
    title: 'Duration',
    width: '10%',
    dataIndex: 'duration',
    key: 'duration',
    render: (_, value) => formatDuration(value.duration),
    sorter: {
      compare: (a, b) => defaultSort(a.duration, b.duration),
      multiple: 3
    }
  },
  {
    title: 'Description',
    width: '20%',
    dataIndex: 'description',
    key: 'description',
    render: (_, value) => <ShortIncidentDescription incident={value}/>,
    sorter: {
      compare: (a, b) => defaultSort(a.code, b.code),
      multiple: 4
    },
    ellipsis: true
  },
  {
    title: 'Category',
    width: '10%',
    dataIndex: 'category',
    key: 'category',
    render: (_, value) => GetCategory(value.code),
    sorter: {
      compare: (a, b) => defaultSort(a.code, b.code),
      multiple: 5
    }
  },
  {
    title: 'Client Impact',
    width: '15%',
    dataIndex: 'clientCount',
    key: 'clientCount',
    render: (_, incident) => <ClientImpact type='clientImpact' incident={incident}/>,
    sorter: {
      compare: (a, b) => clientImpactSort(a.clientCount, b.clientCount),
      multiple: 6
    }
  },
  {
    title: 'Impacted Clients',
    width: '15%',
    dataIndex: 'impactedClientCount',
    key: 'impactedClientCount',
    render: (_, incident) => <ClientImpact type='impactedClients' incident={incident}/>,
    sorter: {
      compare: (a, b) => clientImpactSort(a.impactedClientCount, b.impactedClientCount),
      multiple: 7
    }
  },
  {
    title: 'Scope',
    width: '10%',
    dataIndex: 'scope',
    ellipsis: true,
    key: 'scope',
    render: (_, value) => <GetScope incident={value} />,
    sorter: {
      compare: (a, b) => clientImpactSort(a.code, b.code),
      multiple: 8
    }
  },
  {
    title: 'Type',
    width: '10%',
    dataIndex: 'sliceType',
    key: 'sliceType',
    render: (_, value) => value.sliceType.toLocaleUpperCase(),
    sorter: {
      compare: (a, b) => defaultSort(a.sliceType, b.sliceType),
      multiple: 9
    }
  }
]

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

function IncidentTableWidget ({ filters }: { filters: IncidentFilter }) {
  const queryResults = useIncidentsListQuery(filters)

  const mutedKeysFilter = (data: IncidentNodeData) => {
    return data.filter((row) => row.isMuted === true).map((row) => row.id)
  }

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          <UI.Table
            type='tall'
            style={{ width, height }}
            dataSource={queryResults?.data}
            columns={ColumnHeaders}
            actions={actions}
            rowSelection={{
              type: 'checkbox',
              defaultSelectedRowKeys: queryResults.data
                ? mutedKeysFilter(queryResults.data)
                : undefined
            }}
            pagination={{ 
              defaultPageSize: 10,
              position: ['bottomCenter'],
              pageSizeOptions: [5, 10, 20, 25, 50, 100]
            }}
            rowKey='id'
            showSorterTooltip={false}
            columnEmptyText={noDataSymbol}
            scroll={{ y: 'max-content' }}
          />
        )}
      </AutoSizer>
    </Loader>
  )
}

export default IncidentTableWidget
