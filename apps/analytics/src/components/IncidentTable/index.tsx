import { useIntl, defineMessage } from 'react-intl'

import { Incident, noDataSymbol, IncidentFilter, nodeTypes } from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table }                         from '@acx-ui/components'
import { useTenantLink, Link }                               from '@acx-ui/react-router-dom'
import { formatter }                                         from '@acx-ui/utils'

import { useIncidentsListQuery, IncidentNodeData, IncidentTableRow } from './services'
import {
  GetIncidentBySeverity,
  FormatDate,
  clientImpactSort,
  ShortIncidentDescription,
  GetCategory,
  GetScope,
  severitySort,
  dateSort,
  defaultSort,
  ClientImpact
} from './utils'


function IncidentTableWidget ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()
  const queryResults = useIncidentsListQuery(filters)
  const basePath = useTenantLink('/analytics/incidents/')
  const mutedKeysFilter = (data: IncidentNodeData) => {
    return data.filter((row) => row.isMuted === true).map((row) => row.id)
  }

  const actions: TableProps<Incident>['actions'] = [
    {
      label: $t(defineMessage({ defaultMessage: 'Mute' })),
      onClick: () => {
        // TODO: to be updated for muting
      }
    }
  ]

  const ColumnHeaders: TableProps<IncidentTableRow>['columns'] = [
    {
      title: $t(defineMessage({ defaultMessage: 'Severity' })),
      width: 80,
      dataIndex: 'severity',
      key: 'severity',
      render: (_, value) => <GetIncidentBySeverity value={value.severity} id={value.id}/>,
      sorter: {
        compare: (a, b) => severitySort(a.severity, b.severity),
        multiple: 1
      },
      defaultSortOrder: 'descend',
      fixed: 'left'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Date' })),
      width: 'auto',
      dataIndex: 'endTime',
      valueType: 'dateTime',
      key: 'endTime',
      render: (_, value) => {
        return <Link to={`${basePath.pathname}/${value.id}`}>
          <FormatDate datetimestamp={value.endTime} />
        </Link>
      },
      sorter: {
        compare: (a, b) => dateSort(a.endTime, b.endTime),
        multiple: 2
      },
      fixed: 'left'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Duration' })),
      width: 'auto',
      dataIndex: 'duration',
      key: 'duration',
      render: (_, value) => formatter('durationFormat')(value.duration) as string,
      sorter: {
        compare: (a, b) => defaultSort(b.duration, a.duration),
        multiple: 3
      }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Description' })),
      width: 'auto',
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
      title: $t(defineMessage({ defaultMessage: 'Category' })),
      width: 'auto',
      dataIndex: 'category',
      key: 'category',
      render: (_, value) => GetCategory(value.code),
      sorter: {
        compare: (a, b) => defaultSort(a.code, b.code),
        multiple: 5
      }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Sub-Category' })),
      width: 'auto',
      dataIndex: 'subCategory',
      key: 'subCategory',
      render: (_, value) => GetCategory(value.code, true),
      sorter: {
        compare: (a, b) => defaultSort(a.code, b.code),
        multiple: 5
      },
      show: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Client Impact' })),
      width: 'auto',
      dataIndex: 'clientCount',
      key: 'clientCount',
      render: (_, incident) => <ClientImpact type='clientImpact' incident={incident}/>,
      sorter: {
        compare: (a, b) => clientImpactSort(a.clientCount, b.clientCount),
        multiple: 6
      }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Impacted Clients' })),
      width: 'auto',
      dataIndex: 'impactedClientCount',
      key: 'impactedClientCount',
      render: (_, incident) => <ClientImpact type='impactedClients' incident={incident}/>,
      sorter: {
        compare: (a, b) => clientImpactSort(a.impactedClientCount, b.impactedClientCount),
        multiple: 7
      },
      align: 'center'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Scope' })),
      width: 'auto',
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
      title: $t(defineMessage({ defaultMessage: 'Type' })),
      width: 'auto',
      dataIndex: 'type',
      key: 'type',
      render: (_, value) => $t(nodeTypes(value.sliceType)),
      sorter: {
        compare: (a, b) => clientImpactSort(a.code, b.code),
        multiple: 8
      },
      show: false
    }
  ]

  return (
    <Loader states={[queryResults]}>
      <Table
        type='tall'
        dataSource={queryResults?.data}
        columns={ColumnHeaders}
        actions={actions}
        rowSelection={{
          type: 'radio',
          defaultSelectedRowKeys: queryResults.data
            ? mutedKeysFilter(queryResults.data)
            : undefined
        }}
        pagination={{
          defaultPageSize: 10,
          position: ['bottomCenter'],
          pageSizeOptions: [5, 10, 20, 25, 50, 100],
          showTotal: undefined
        }}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataSymbol}
        scroll={{ y: 'max-content' }}
        indentSize={6}
      />
    </Loader>
  )
}

export default IncidentTableWidget
