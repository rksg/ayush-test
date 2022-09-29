import { useState } from 'react'

import { Tooltip }                                  from 'antd'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  Incident,
  noDataSymbol,
  IncidentFilter,
  getRootCauseAndRecommendations,
  useShortDescription,
  formattedPath
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Table, Drawer } from '@acx-ui/components'
import { useTenantLink, Link }               from '@acx-ui/react-router-dom'
import { formatter }                         from '@acx-ui/utils'

import { 
  useIncidentsListQuery,
  IncidentTableRow 
} from './services'
import * as UI  from './styledComponents'
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
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useIncidentsListQuery(filters)
  const basePath = useTenantLink('/analytics/incidents/')
  const [ drawerSelection, setDrawerSelection ] = useState<Incident | null>(null)
  const onDrawerClose = () => setDrawerSelection(null)

  const rowActions: TableProps<IncidentTableRow>['rowActions'] = [
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
      width: 130,
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
      width: 100,
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
      width: 200,
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
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Category' })),
      width: 100,
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
      width: 130,
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
      width: 130,
      dataIndex: 'clientImpact',
      key: 'clientImpact',
      sorter: {
        compare: (a, b) => clientImpactSort(a.clientImpact, b.clientImpact),
        multiple: 7
      }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Impacted Clients' })),
      width: 160,
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
      width: 200,
      dataIndex: 'scope',
      key: 'scope',
      render: (_, value ) => {
        return <Tooltip placement='top' title={formattedPath(value.path, value.sliceValue, intl)}>
          {value.scope}
        </Tooltip>
      },
      sorter: {
        compare: (a, b) => defaultSort(a.scope, b.scope),
        multiple: 9
      },
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Type' })),
      width: 90,
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
        rowActions={rowActions}
        rowSelection={{
          type: 'radio'
        }}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataSymbol}
        ellipsis={true}
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
