import { useState } from 'react'

import AutoSizer from 'react-virtualized-auto-sizer'

import { Incident, noDataSymbol, useAnalyticsFilter, getRootCauseAndRecommendations, useShortDescription } from '@acx-ui/analytics/utils'
import { Loader, Table, TableProps, showToast, Drawer }                                                    from '@acx-ui/components'
import { Link }                                                                                            from '@acx-ui/react-router-dom'

import { useIncidentsListQuery, IncidentNodeData, IncidentTableRows } from './services'
import * as UI                                                        from './styledComponents'
import { 
  getIncidentBySeverity,
  formatDate,
  formatDuration,
  clientImpactSort,
  ShortIncidentDescription,
  getCategory,
  GetScope,
  severitySort,
  dateSort,
  defaultSort,
  renderNumberedListFromArray
} from './utils'


const ColumnHeaders: TableProps<IncidentTableRows>['columns'] = [
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
      return <Link to={value.id}>{formatDate(value.endTime) as string}</Link>
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
    title: 'Category',
    dataIndex: 'category',
    key: 'category',
    render: (_, value) => getCategory(value.code),
    sorter: {
      compare: (a, b) => defaultSort(a.code, b.code),
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
      compare: (a, b) => clientImpactSort(a.code, b.code),
      multiple: 8
    }
  },
  {
    title: 'Type',
    dataIndex: 'sliceType',
    key: 'sliceType',
    render: (_, value) => value.sliceType.toLocaleUpperCase(),
    sorter: {
      compare: (a, b) => defaultSort(a.sliceType, b.sliceType),
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

const IncidentDrawerContent = (props: { selectedIncidentToShowDescription: Incident }) => {
  const { rootCauses } = getRootCauseAndRecommendations(
    props.selectedIncidentToShowDescription.code,
    props.selectedIncidentToShowDescription.metadata
  )[0]
  const desc = useShortDescription(props.selectedIncidentToShowDescription)
  return (
    <UI.IncidentDrawerContent>
      <UI.IncidentCause>{desc}</UI.IncidentCause>
      <UI.IncidentRootCauses>{'Root cause:'}</UI.IncidentRootCauses>
      {renderNumberedListFromArray(rootCauses)}
    </UI.IncidentDrawerContent>
  )
}


const IncidentTableWidget = () => {
  const descriptionHeader = {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    render: (_: React.ReactNode, value: Incident ) => (
      <ShortIncidentDescription
        onClickDesc={setDrawerProps}
        incident={value}
      />
    ),
    sorter: {
      compare: (a: Incident, b: Incident) => defaultSort(a.code, b.code),
      multiple: 4
    },
    ellipsis: true
  }
  const filters = useAnalyticsFilter()
  const queryResults = useIncidentsListQuery(filters)
  const [drawerProps, setDrawerProps ] = 
  useState<{ visible : boolean, incident: Incident | null }>({ visible: false, incident: null })

  const onDrawerClose = () => {
    setDrawerProps({ incident: null, visible: false })
  }
  const mutedKeysFilter = (data: IncidentNodeData) => {
    return data.filter((row) => row.isMuted === true).map((row) => row.id)
  }

  return (
    <Loader states={[queryResults]}>
      <AutoSizer>
        {({ height, width }) => (
          <Table
            type='tall'
            style={{ width, height }}
            dataSource={queryResults?.data}
            columns={[
              ...ColumnHeaders.slice(0, 3),
              descriptionHeader,
              ...ColumnHeaders.slice(3)
            ]}
            actions={actions}
            rowSelection={{
              type: 'checkbox',
              defaultSelectedRowKeys: queryResults.data
                ? mutedKeysFilter(queryResults.data)
                : undefined
            }}
            pagination={{ pageSize: 10 }}
            rowKey='id'
            showSorterTooltip={false}
            columnEmptyText={noDataSymbol}
            scroll={{ y: 'max-content' }}
          />
        )}
      </AutoSizer>
      {drawerProps.incident && 
      <Drawer
        title={'Incident Description'}
        visible={drawerProps.visible}
        onClose={onDrawerClose}
        children={
          <IncidentDrawerContent
            selectedIncidentToShowDescription={
              drawerProps.incident
            }
          />
        }
        style={{ width: 450 }}
      />
      }
    </Loader>
  )
}

export default IncidentTableWidget
