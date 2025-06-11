import { useState, useMemo, useCallback } from 'react'

import { stringify }                                           from 'csv-stringify/browser/esm/sync'
import { omit }                                                from 'lodash'
import { useIntl, defineMessage, FormattedMessage, IntlShape } from 'react-intl'

import {
  productNames,
  defaultSort,
  dateSort,
  clientImpactSort,
  severitySort,
  sortProp,
  Incident,
  IncidentFilter,
  longDescription,
  formattedPath
} from '@acx-ui/analytics/utils'
import { Loader, TableProps, Drawer, Tooltip, Button, Table } from '@acx-ui/components'
import { Features, useIsSplitOn }                             from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                          from '@acx-ui/formatter'
import {
  DownloadOutlined,
  EyeOpenOutlined,
  EyeSlashOutlined
} from '@acx-ui/icons'
import { TenantLink, useNavigateToPath } from '@acx-ui/react-router-dom'
import { SwitchScopes, WifiScopes }      from '@acx-ui/types'
import {
  filterByAccess,
  getShowWithoutRbacCheckKey,
  hasCrossVenuesPermission,
  hasPermission,
  aiOpsApis
} from '@acx-ui/user'
import {
  exportMessageMapping,
  noDataDisplay,
  handleBlobDownloadFile,
  useTrackLoadTime,
  widgetsMapping
} from '@acx-ui/utils'

import { getRootCauseAndRecommendations } from '../IncidentDetails/rootCauseRecommendation'
import { useIncidentToggles }             from '../useIncidentToggles'

import {
  useIncidentsListQuery,
  useMuteIncidentsMutation,
  IncidentTableRow,
  IncidentNodeData
} from './services'
import * as UI                                             from './styledComponents'
import { GetIncidentBySeverity, ShortIncidentDescription } from './utils'

export function downloadIncidentList (
  incidents: IncidentNodeData,
  columns: TableProps<IncidentTableRow>['columns'],
  { startDate, endDate }: IncidentFilter
) {
  const data = stringify(
    incidents
      .reduce((data : Incident[], incident) => {
        data.push(omit(incident, ['children']))
        if (incident.children?.length) {
          data.push(...incident.children)
        }
        return data
      }, [])
      .sort((a, b) => b.severity - a.severity),
    {
      header: true,
      quoted: true,
      cast: {
        string: s => s === '--' ? '-' : s,
        boolean: b => b ? 'true' : 'false'
      },
      columns: [
        ...columns.map(({ key, title }) => ({
          key: key === 'severity' ? 'severityLabel' : key,
          header: title as string
        })),
        { key: 'isMuted', header: 'Muted' }
      ]
    }
  )
  handleBlobDownloadFile(
    new Blob([data], { type: 'text/csv;charset=utf-8;' }),
    `Incidents-${startDate}-${endDate}.csv`
  )
}

const IncidentDrawerContent = (props: { selectedIncidentToShowDescription: Incident }) => {
  const { $t } = useIntl()
  const { metadata, id } = props.selectedIncidentToShowDescription
  const [{ rootCauses }] = getRootCauseAndRecommendations(props.selectedIncidentToShowDescription)
  const { rootCauseText, rootCauseValues } = rootCauses
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
  const desc = longDescription(props.selectedIncidentToShowDescription)
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
        <FormattedMessage {...rootCauseText} values={{ ...values, ...rootCauseValues }} />
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

interface IncidentRowData {
  id: string;
  code: string;
  severityLabel: string;
  isMuted: boolean;
}

export enum IncidentMutedStatus {
  All,
  Muted,
  Unmuted
}

const mutedStatusFilterOptions = ($t: IntlShape['$t']) => [
  {
    id: IncidentMutedStatus.Unmuted,
    key: 'false',
    value: (
      <UI.OptionItemWithIcon>
        <EyeOpenOutlined height={18} /> {$t({ defaultMessage: 'Unmuted' })}
      </UI.OptionItemWithIcon>
    ),
    label: $t({ defaultMessage: 'Unmuted' })
  },
  {
    id: IncidentMutedStatus.Muted,
    key: 'true',
    value: (
      <UI.OptionItemWithIcon>
        <EyeSlashOutlined height={18} /> {$t({ defaultMessage: 'Muted' })}
      </UI.OptionItemWithIcon>
    ),
    label: $t({ defaultMessage: 'Muted' })
  }
]

export const getIncidentsMutedStatus = (incidents: IncidentRowData[]) => {
  if (incidents.length === 0) return IncidentMutedStatus.All
  const firstIncidentIsMuted = incidents[0].isMuted

  for (let i = 1; i < incidents.length; i++) {
    if (incidents[i].isMuted !== firstIncidentIsMuted) return IncidentMutedStatus.All
  }

  return firstIncidentIsMuted
    ? IncidentMutedStatus.Muted
    : IncidentMutedStatus.Unmuted
}

export function IncidentTable ({ filters }: {
   filters: IncidentFilter }) {
  const intl = useIntl()
  const toggles = useIncidentToggles()
  const { $t } = intl
  const queryResults = useIncidentsListQuery({ ...filters, toggles })
  const isMonitoringPageEnabled = useIsSplitOn(Features.MONITORING_PAGE_LOAD_TIMES)

  const [ drawerSelection, setDrawerSelection ] = useState<Incident | null>(null)
  const onDrawerClose = () => setDrawerSelection(null)
  const [muteIncident, { isLoading }] = useMuteIncidentsMutation()
  const [selectedRowsData, setSelectedRowsData] = useState<IncidentRowData[]>(
    []
  )

  const hasRowSelection = hasCrossVenuesPermission() && hasPermission({
    permission: 'WRITE_INCIDENTS',
    scopes: [WifiScopes.UPDATE, SwitchScopes.UPDATE],
    rbacOpsIds: [aiOpsApis.updateIncident]
  })
  const hasUpdateSwitchIncidentPermission = hasPermission({
    permission: 'WRITE_INCIDENTS',
    scopes: [SwitchScopes.UPDATE],
    rbacOpsIds: [aiOpsApis.updateIncident]
  })
  const hasUpdateWifiIncidentPermission = hasPermission({
    permission: 'WRITE_INCIDENTS',
    scopes: [WifiScopes.UPDATE],
    rbacOpsIds: [aiOpsApis.updateIncident]
  })

  const muteSelectedIncidents = useCallback(async (mute: boolean) => {
    await muteIncident(
      selectedRowsData
        .filter(({ isMuted }) => isMuted !== mute)
        .map(({ id, code, severityLabel }) => ({
          id,
          code,
          priority: severityLabel,
          mute
        }))
    ).unwrap()
  }, [muteIncident, selectedRowsData])

  const rowActions: TableProps<IncidentTableRow>['rowActions'] = useMemo(() => {
    const incidentsMutedStatus = getIncidentsMutedStatus(selectedRowsData)
    return [
      {
        key: getShowWithoutRbacCheckKey('mute'),
        visible: ([row]) =>
          row && row.sliceType.startsWith('switch')
            ? !!hasUpdateSwitchIncidentPermission
            : !!hasUpdateWifiIncidentPermission,
        label: $t(defineMessage({ defaultMessage: 'Mute' })),
        onClick: async () => {
          await muteSelectedIncidents(true)
          setSelectedRowsData([])
        },
        disabled: incidentsMutedStatus === IncidentMutedStatus.Muted
      },
      {
        key: getShowWithoutRbacCheckKey('unmute'),
        visible: ([row]) =>
          row && row.sliceType.startsWith('switch')
            ? !!hasUpdateSwitchIncidentPermission
            : !!hasUpdateWifiIncidentPermission,
        label: $t(defineMessage({ defaultMessage: 'Unmute' })),
        onClick: async () => {
          await muteSelectedIncidents(false)
          setSelectedRowsData([])
        },
        disabled: incidentsMutedStatus === IncidentMutedStatus.Unmuted
      }
    ]
  }, [
    $t,
    hasUpdateSwitchIncidentPermission,
    hasUpdateWifiIncidentPermission,
    selectedRowsData,
    muteSelectedIncidents
  ])

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
      filterable: true,
      filterableWidth: 130
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
      sorter: { compare: sortProp('impactedClientCount', defaultSort) },
      sortDirections: ['descend', 'ascend', 'descend'],
      align: 'center'
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Scope' })),
      width: 200,
      dataIndex: 'scope',
      key: 'scope',
      render: (_, value, __, highlightFn ) => {
        return <Tooltip
          placement='top'
          title={formattedPath(value.path, value.sliceValue)}
          dottedUnderline={true}
        >
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
    },
    {
      title: $t(defineMessage({ defaultMessage: 'Visibility' })),
      width: 80,
      dataIndex: 'isMuted',
      key: 'isMuted',
      align: 'center',
      render: (_, { isMuted }) =>
        isMuted ? (
          <Tooltip title={$t({ defaultMessage: 'Muted' })}>
            <EyeSlashOutlined height={18} />
          </Tooltip>
        ) : (
          <Tooltip title={$t({ defaultMessage: 'Unmuted' })}>
            <EyeOpenOutlined height={18} />
          </Tooltip>
        ),
      filterValueNullable: true,
      filterValueArray: true,
      filterMultiple: false,
      filterable: mutedStatusFilterOptions($t)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []) // '$t' 'basePath' 'intl' are not changing

  useTrackLoadTime({
    itemName: widgetsMapping.INCIDENT_TABLE,
    states: [queryResults],
    isEnabled: isMonitoringPageEnabled
  })

  return (
    <Loader
      states={[
        { ...queryResults, isLoading: queryResults.isLoading || isLoading }
      ]}
      style={{ height: 'auto' }}
    >
      <Table<IncidentTableRow>
        settingsId='incident-table'
        type='tall'
        dataSource={queryResults.data}
        columns={ColumnHeaders}
        rowActions={filterByAccess(rowActions)}
        iconButton={{
          icon: <DownloadOutlined />,
          disabled: !Boolean(queryResults.data?.length),
          tooltip: $t(exportMessageMapping.EXPORT_TO_CSV),
          onClick: () => {
            downloadIncidentList(queryResults.data as IncidentNodeData, ColumnHeaders, filters)
          } }}
        rowSelection={
          hasRowSelection && {
            type: 'checkbox',
            selectedRowKeys: selectedRowsData.map((val) => val.id),
            onChange: (_, selectedRows) => {
              selectedRows.length > 0 &&
                setSelectedRowsData(
                  selectedRows.map((row) => ({
                    id: row.id,
                    code: row.code,
                    severityLabel: row.severityLabel,
                    isMuted: row.isMuted
                  }))
                )
            }
          }
        }
        rowKey='id'
        showSorterTooltip={false}
        columnEmptyText={noDataDisplay}
        indentSize={6}
        onResetState={() => setSelectedRowsData([])}
        filterableWidth={100}
        searchableWidth={240}
        optionLabelProp='label'
        columnsToHideChildrenIfParentFiltered={['isMuted']}
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
