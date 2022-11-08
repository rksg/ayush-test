import React, { useState, useMemo } from 'react'

import { Checkbox }                                 from 'antd'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  Incident,
  noDataSymbol,
  IncidentFilter,
  getRootCauseAndRecommendations,
  shortDescription,
  formattedPath
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Drawer, Tooltip } from '@acx-ui/components'
import { useTenantLink, Link }                 from '@acx-ui/react-router-dom'
import { formatter }                           from '@acx-ui/utils'

import {
  useIncidentsListQuery,
  useMuteIncidentsMutation,
  IncidentTableRow
} from './services'
import * as UI           from './styledComponents'
import {
  GetIncidentBySeverity,
  FormatDate,
  clientImpactSort,
  ShortIncidentDescription,
  severitySort,
  dateSort,
  defaultSort,
  filterMutedIncidents
} from './utils'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

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
  const desc = shortDescription(props.selectedIncidentToShowDescription)
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

export function IncidentTable ({ filters }: { filters: IncidentFilter }) {
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useIncidentsListQuery(filters)
  const basePath = useTenantLink('/analytics/incidents/')
  const [ drawerSelection, setDrawerSelection ] = useState<Incident | null>(null)
  const [ showMuted, setShowMuted ] = useState<boolean>(false)
  const onDrawerClose = () => setDrawerSelection(null)
  const [muteIncident] = useMuteIncidentsMutation()
  const [selectedRowData, setSelectedRowData] = useState<{
    id: string,
    code: string,
    severityLabel: string,
    isMuted: boolean
  }[]>([])

  const selectedIncident = selectedRowData[0]
  const data = (showMuted)
    ? queryResults.data
    : filterMutedIncidents(queryResults.data)

  const rowActions: TableProps<IncidentTableRow>['rowActions'] = [
    {
      label: $t(selectedIncident?.isMuted
        ? defineMessage({ defaultMessage: 'Unmute' })
        : defineMessage({ defaultMessage: 'Mute' })
      ),
      onClick: async () => {
        const { id, code, severityLabel, isMuted } = selectedIncident
        await muteIncident({ id, code, priority: severityLabel, mute: !isMuted }).unwrap()
        setSelectedRowData([])
      }
    }
  ]

  const ColumnHeaders: TableProps<IncidentTableRow>['columns'] = useMemo(() => [
    {
      title: $t(defineMessage({ defaultMessage: 'Severity' })),
      width: 80,
      dataIndex: 'severityLabel',
      key: 'severity',
      render: (_, value) =>
        <GetIncidentBySeverity severityLabel={value.severityLabel} id={value.id}/>,
      sorter: {
        compare: (a, b) => severitySort(a.severity, b.severity)
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
        compare: (a, b) => dateSort(a.endTime, b.endTime)
      },
      fixed: 'left'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Duration' })),
      width: 100,
      dataIndex: 'duration',
      key: 'duration',
      render: (_, value) => formatter('durationFormat')(value.duration),
      sorter: {
        compare: (a, b) => defaultSort(a.duration, b.duration)
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
        compare: (a, b) => defaultSort(a.description, b.description)
      },
      ellipsis: true,
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Category' })),
      width: 100,
      dataIndex: 'category',
      key: 'category',
      sorter: {
        compare: (a, b) => defaultSort(a.category as string, b.category as string)
      },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Sub-Category' })),
      width: 130,
      dataIndex: 'subCategory',
      key: 'subCategory',
      sorter: {
        compare: (a, b) => defaultSort(a.subCategory as string, b.subCategory as string)
      },
      show: false
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Client Impact' })),
      width: 130,
      dataIndex: 'clientImpact',
      key: 'clientImpact',
      sorter: {
        compare: (a, b) => clientImpactSort(a.clientImpact, b.clientImpact)
      }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Impacted Clients' })),
      width: 160,
      dataIndex: 'impactedClients',
      key: 'impactedClients',
      sorter: {
        compare: (a, b) => clientImpactSort(a.impactedClients, b.impactedClients)
      },
      align: 'center'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Scope' })),
      width: 200,
      dataIndex: 'scope',
      key: 'scope',
      render: (_, value ) => {
        return <Tooltip placement='top' title={formattedPath(value.path, value.sliceValue)}>
          {value.scope}
        </Tooltip>
      },
      sorter: {
        compare: (a, b) => defaultSort(a.scope, b.scope)
      },
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Type' })),
      width: 90,
      dataIndex: 'type',
      key: 'type',
      sorter: {
        compare: (a, b) => defaultSort(a.type, b.type)
      },
      show: false,
      filterable: true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' are not changing

  return (
    <Loader states={[queryResults]}>
      <UI.IncidentTableWrapper
        type='tall'
        dataSource={data}
        columns={ColumnHeaders}
        rowActions={rowActions}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowData.map(val => val.id),
          onChange: (_, [row]) => {
            row && setSelectedRowData([{
              id: row.id,
              code: row.code,
              severityLabel: row.severityLabel,
              isMuted: row.isMuted
            }])
          }
        }}
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataSymbol}
        indentSize={6}
        onResetState={() => {
          setShowMuted(false)
          setSelectedRowData([])
        }}
        extraSettings={[
          <Checkbox
            onChange={(e: CheckboxChangeEvent) => setShowMuted(e.target.checked)}
            checked={showMuted}
            children={$t({ defaultMessage: 'Show Muted Incidents' })}
          />
        ]}
        rowClassName={(record) => record.isMuted ? 'table-row-muted' : 'table-row-normal'}
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
