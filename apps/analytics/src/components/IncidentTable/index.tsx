import { useState } from 'react'

import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  Incident,
  noDataSymbol,
  IncidentFilter,
  getRootCauseAndRecommendations,
  useShortDescription
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Drawer } from '@acx-ui/components'
import { useTenantLink, Link }               from '@acx-ui/react-router-dom'
import { formatter }                         from '@acx-ui/utils'

import { useIncidentsListQuery, IncidentNodeData, IncidentTableRow } from './services'
import * as UI                                                       from './styledComponents'
import {
  GetIncidentBySeverity,
  FormatDate,
  clientImpactSort,
  ShortIncidentDescription,
  severitySort,
  dateSort,
  defaultSort
} from './utils'

const IncidentDrawerContent = (props: { selectedIncidentToShowDescription: Incident }) => {
  const { $t } = useIntl()
  const { metadata } = props.selectedIncidentToShowDescription
  const [{ rootCauses }] = getRootCauseAndRecommendations(props.selectedIncidentToShowDescription)
  const values = {
    p: (text: string) => <UI.DrawerPara>{text}</UI.DrawerPara>,
    ol: (text: string) => <UI.DrawerOrderList>{text}</UI.DrawerOrderList>,
    li: (text: string) => <UI.DrawerList>{text}</UI.DrawerList>
  }
  const { dominant } = metadata
  const wlanInfo = (dominant && dominant.ssid)
    ? $t(defineMessage({ defaultMessage: 'Most impacted WLAN: {ssid}' }), { ssid: dominant.ssid })
    : ''
  const desc = useShortDescription(props.selectedIncidentToShowDescription)
  return (
    <UI.IncidentDrawerContent>
      <UI.IncidentCause>{desc}</UI.IncidentCause>
      <UI.IncidentImpactedClient showImpactedClient={!!(dominant && dominant.ssid)}>
        {wlanInfo}
      </UI.IncidentImpactedClient>
      <UI.IncidentRootCauses>
        {$t(defineMessage({ defaultMessage: 'Root cause' }))}{':'}
      </UI.IncidentRootCauses>
      <FormattedMessage {...rootCauses} values={values} />
    </UI.IncidentDrawerContent>
  )
}

function IncidentTableWidget ({ filters }: { filters: IncidentFilter }) {
  const { $t } = useIntl()
  const queryResults = useIncidentsListQuery(filters)
  const basePath = useTenantLink('/analytics/incidents/')
  const [ drawerSelection, setDrawerSelection ] = useState<Incident | null>(null)
  const onDrawerClose = () => setDrawerSelection(null)
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
      dataIndex: 'severityLabel',
      key: 'severity',
      render: (_, value) => <GetIncidentBySeverity value={value.severity} id={value.id}/>,
      sorter: {
        compare: (a, b) => severitySort(a.severity, b.severity),
        multiple: 1
      },
      defaultSortOrder: 'descend',
      fixed: 'left',
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Date' })),
      dataIndex: 'endTime',
      valueType: 'dateTime',
      key: 'endTime',
      render: (_, value) => {
        return <Link to={{ ...basePath, pathname: `${basePath.pathname}/${value.id}` }}>
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
      dataIndex: 'description',
      key: 'description',
      render: (_, value ) => (
        <ShortIncidentDescription
          onClickDesc={setDrawerSelection}
          incident={value}
        />
      ),
      sorter: {
        compare: (a, b) => defaultSort(a.description, b.description),
        multiple: 4
      },
      ellipsis: true,
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Category' })),
      dataIndex: 'category',
      key: 'category',
      sorter: {
        compare: (a, b) => defaultSort(a.category as string, b.category as string),
        multiple: 5
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Sub-Category' })),
      dataIndex: 'subCategory',
      key: 'subCategory',
      sorter: {
        compare: (a, b) => defaultSort(a.subCategory as string, b.subCategory as string),
        multiple: 6
      },
      show: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Client Impact' })),
      dataIndex: 'clientImpact',
      key: 'clientImpact',
      sorter: {
        compare: (a, b) => clientImpactSort(a.clientImpact, b.clientImpact),
        multiple: 7
      }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Impacted Clients' })),
      dataIndex: 'impactedClients',
      key: 'impactedClients',
      sorter: {
        compare: (a, b) => clientImpactSort(a.impactedClients, b.impactedClients),
        multiple: 8
      },
      align: 'center'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Scope' })),
      dataIndex: 'scope',
      ellipsis: true,
      key: 'scope',
      sorter: {
        compare: (a, b) => defaultSort(a.scope, b.scope),
        multiple: 9
      },
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Type' })),
      dataIndex: 'type',
      key: 'type',
      sorter: {
        compare: (a, b) => defaultSort(a.type, b.type),
        multiple: 10
      },
      show: false,
      filterable: true
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
      {drawerSelection &&
      <Drawer
        visible
        title={$t(defineMessage({ defaultMessage: 'Incident Description' }))}
        onClose={onDrawerClose}
        children={<IncidentDrawerContent selectedIncidentToShowDescription={drawerSelection} />}
        width={400}
      />
      }
    </Loader>
  )
}

export default IncidentTableWidget
