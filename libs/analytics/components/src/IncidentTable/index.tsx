import React, { useState, useMemo } from 'react'

import { Checkbox }                                 from 'antd'
import { useIntl, defineMessage, FormattedMessage } from 'react-intl'

import {
  productNames,
  defaultSort,
  dateSort,
  clientImpactSort,
  severitySort,
  sortProp,
  Incident,
  IncidentFilter,
  getRootCauseAndRecommendations,
  shortDescription,
  formattedPath
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Drawer, Tooltip, Button } from '@acx-ui/components'
import { DateFormatEnum, formatter }                   from '@acx-ui/formatter'
import { TenantLink, useNavigateToPath }               from '@acx-ui/react-router-dom'
import { noDataDisplay }                               from '@acx-ui/utils'

import {
  useIncidentsListQuery,
  useMuteIncidentsMutation,
  IncidentTableRow
} from './services'
import * as UI           from './styledComponents'
import {
  GetIncidentBySeverity,
  ShortIncidentDescription,
  filterMutedIncidents
} from './utils'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'

const IncidentDrawerContent = (props: { selectedIncidentToShowDescription: Incident }) => {
  const { $t } = useIntl()
  const { metadata, id } = props.selectedIncidentToShowDescription
  const [{ rootCauses }] = getRootCauseAndRecommendations(props.selectedIncidentToShowDescription)
  const gotoIncident = useNavigateToPath(`/analytics/incidents/${id}`)
  const values = {
    ...productNames,
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
      <div>
        <FormattedMessage {...rootCauses} values={values} />
        <Button type='link' onClick={gotoIncident} size='small'>
          {$t({ defaultMessage: 'More Details' })}
        </Button>
      </div>
    </UI.IncidentDrawerContent>
  )
}

const DateLink = ({ value }: { value: IncidentTableRow }) => {
  return <TenantLink to={`/analytics/incidents/${value.id}`}>
    {formatter(DateFormatEnum.DateTimeFormat)(value.endTime)}
  </TenantLink>
}

export function IncidentTable ({ filters, systemNetwork }: {
   filters: IncidentFilter, systemNetwork?: boolean }) {
  const intl = useIntl()
  const { $t } = intl
  const queryResults = useIncidentsListQuery(filters)
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
      sorter: { compare: sortProp('severity', severitySort) },
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
        return <DateLink value={value}/>
      },
      sorter: { compare: sortProp('endTime', dateSort) },
      fixed: 'left'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Duration' })),
      width: 100,
      dataIndex: 'duration',
      key: 'duration',
      render: (_, value) => formatter('durationFormat')(value.duration),
      sorter: { compare: sortProp('duration', defaultSort) }
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Description' })),
      width: 200,
      dataIndex: 'description',
      key: 'description',
      render: (_, value, __, highlightFn ) => (
        <ShortIncidentDescription
          onClickDesc={setDrawerSelection}
          incident={value}
          highlightFn={highlightFn}
        />
      ),
      sorter: { compare: sortProp('description', defaultSort) },
      ellipsis: true,
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Category' })),
      width: 100,
      dataIndex: 'category',
      key: 'category',
      sorter: { compare: sortProp('category', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Sub-Category' })),
      width: 130,
      dataIndex: 'subCategory',
      key: 'subCategory',
      sorter: { compare: sortProp('subCategory', defaultSort) },
      filterable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Client Impact' })),
      width: 130,
      dataIndex: 'clientImpact',
      key: 'clientImpact',
      sorter: { compare: sortProp('clientImpact', clientImpactSort) },
      sortDirections: ['descend', 'ascend', 'descend']
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Impacted Clients' })),
      width: 160,
      dataIndex: 'impactedClients',
      key: 'impactedClients',
      sorter: { compare: sortProp('impactedClients', clientImpactSort) },
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Scope' })),
      width: 200,
      dataIndex: 'scope',
      key: 'scope',
      render: (_, value, __, highlightFn ) => {
        return <Tooltip placement='top' title={formattedPath(value.path, value.sliceValue)}>
          {highlightFn(value.scope)}
        </Tooltip>
      },
      sorter: { compare: sortProp('scope', defaultSort) },
      searchable: true
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Type' })),
      width: 90,
      dataIndex: 'type',
      key: 'type',
      sorter: { compare: sortProp('type', defaultSort) },
      show: false,
      filterable: true
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' are not changing

  return (
    <Loader states={[queryResults]}>
      <UI.IncidentTableWrapper
        settingsId='incident-table'
        type='tall'
        dataSource={data}
        columns={ColumnHeaders}
        rowActions={rowActions}
        rowSelection={!systemNetwork && {
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
        columnEmptyText={noDataDisplay}
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
        filterableWidth={155}
        searchableWidth={240}
      />
      <Drawer
        visible={!!drawerSelection}
        title={$t(defineMessage({ defaultMessage: 'Incident Description' }))}
        onClose={onDrawerClose}
        children={drawerSelection
          ? <IncidentDrawerContent selectedIncidentToShowDescription={drawerSelection} />
          : null
        }
        width={400}
      />
    </Loader>
  )
}
