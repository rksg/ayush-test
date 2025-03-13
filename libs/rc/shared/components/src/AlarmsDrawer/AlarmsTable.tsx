import { Key, useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  Table,
  TableProps,
  Tooltip
} from '@acx-ui/components'
import { Features, useIsSplitOn }                                                                                                                           from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter }                                                                                                                        from '@acx-ui/formatter'
import { eventAlarmApi, networkApi, useAlarmsListQuery, useClearAlarmByVenueMutation, useClearAlarmMutation, useClearAllAlarmsMutation, useGetVenuesQuery } from '@acx-ui/rc/services'
import {
  Alarm,
  CommonRbacUrlsInfo,
  CommonUrlsInfo,
  EventSeverityEnum,
  EventTypeEnum,
  FILTER,
  SEARCH,
  useTableQuery
} from '@acx-ui/rc/utils'
import { TenantLink, useParams }                          from '@acx-ui/react-router-dom'
import { store }                                          from '@acx-ui/store'
import { RolesEnum }                                      from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasRoles } from '@acx-ui/user'
import { getOpsApi, noDataDisplay }                       from '@acx-ui/utils'

import * as UI from './styledComponents'

const defaultPayload: {
  url: string
  fields: string[]
  filters?: {
    severity?: string[],
    serialNumber?: string[],
    venueId?: string[],
    alarmType?: string[] // 'new' or 'clear'
  }
} = {
  url: CommonUrlsInfo.getAlarmsList.url,
  filters: {},
  fields: [
    'startTime',
    'severity',
    'message',
    'entity_id',
    'id',
    'serialNumber',
    'entityType',
    'entityId',
    'entity_type',
    'venueName',
    'apName',
    'switchName',
    'sourceType',
    'switchMacAddress',
    'apModel',
    'minimumRequiredVersion',
    'clearTime',
    'clearedBy'
  ]
}

interface AlarmsTableProps {
  isNewAlarm: boolean
  venueId?: string
  serialNumber?: string
  selectedFilters: { severity?: (boolean | Key)[],product?: (boolean | Key)[] },
  setSelectedFilters:
    (selectedFilters: { severity?: (boolean | Key)[],product?: (boolean | Key)[] }) => void
}

export const AlarmsTable = (props: AlarmsTableProps) => {
  const params = useParams()
  const { $t } = useIntl()
  const [selectedAlarmFilters, setSelectedAlarmFilters] = useState({})

  const { rbacOpsApiEnabled } = getUserProfile()
  const isClearAllAlarmsToggleEnabled = useIsSplitOn(Features.ALARM_CLEAR_ALL_ALARMS_TOGGLE)

  const { isNewAlarm, venueId, serialNumber, selectedFilters, setSelectedFilters } = props

  const venuesListPayload = {
    fields: ['name', 'country', 'id'],
    pageSize: 10000,
    sortField: 'name',
    sortOrder: 'ASC'
  }

  const [
    clearAlarm,
    { isLoading: isAlarmCleaning }
  ] = useClearAlarmMutation()

  const [
    clearAlarmByVenue,
    { isLoading: isAlarmByVenueCleaning }
  ] = useClearAlarmByVenueMutation()

  const [
    clearAllAlarms,
    { isLoading: isAllAlarmsCleaning }
  ] = useClearAllAlarmsMutation()

  const { data: venuesList } =
    useGetVenuesQuery({ params: useParams(), payload: venuesListPayload },
      { skip: !isNewAlarm })

  const tableQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload: { ...defaultPayload,
      filters: { alarmType: isNewAlarm ? ['new'] : ['clear'] } },
    sorter: {
      sortField: isNewAlarm ? 'startTime' : 'clearTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 25
    }
  })

  const allAlarmsPayload = { ...defaultPayload,
    filters: {},
    sortField: 'startTime',
    sortOrder: 'DESC',
    page: 1,
    pageSize: 10000 }

  const { data: allAlarms } = useAlarmsListQuery({ payload: allAlarmsPayload },
    { skip: !isNewAlarm }
  )

  const getIconBySeverity = (severity: EventSeverityEnum)=>{

    const SeverityIcon = {
      [EventSeverityEnum.MAJOR]: <UI.WarningTriang />,
      [EventSeverityEnum.CRITICAL]: <UI.WarningCircle />,
      [EventSeverityEnum.MINOR]: <></>,
      [EventSeverityEnum.WARNING]: <></>,
      [EventSeverityEnum.INFORMATIONAL]: <></>
    }

    return SeverityIcon[severity]
  }

  const getDeviceLink = (alarm:Alarm)=>{
    switch (alarm.entityType) {
      case EventTypeEnum.AP: {
        return <TenantLink
          to={`/devices/wifi/${alarm.entityId}/details/overview`}>{alarm.apName}
        </TenantLink>
      }
      case EventTypeEnum.SWITCH: {
        const switchId = alarm.switchMacAddress || alarm.serialNumber
        return alarm.isSwitchExists ? <TenantLink
          to={`/devices/switch/${switchId}/${alarm.serialNumber}/details/overview`}>
          {alarm.switchName}
        </TenantLink> : alarm.switchName
      }
      case EventTypeEnum.EDGE: {
        return <TenantLink
          to={`/devices/edge/${alarm.entityId}/details/overview`}>{alarm.edgeName}
        </TenantLink>
      }
      default: {
        return <UI.EmptyLink>{alarm.apName}</UI.EmptyLink>
      }
    }
  }

  const getVenueIdsOfAlarms = (venueNames: string[]) => {
    const venueIds = (venuesList?.data.filter(venue =>
      venueNames.includes(venue.name)) || []).map(venue => venue.id)
    return venueIds
  }

  const getDeviceType = (entityType: string) => {
    switch (entityType) {
      case 'AP':
        return $t({ defaultMessage: 'Wi-Fi' })
      case 'SWITCH':
        return $t({ defaultMessage: 'Switch' })
      case 'EDGE':
        return $t({ defaultMessage: 'RUCKUS Edge' })
      default:
        return ''
    }
  }

  const hasPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(CommonUrlsInfo.clearAlarm),
      getOpsApi(isClearAllAlarmsToggleEnabled ? CommonRbacUrlsInfo.clearAllAlarms
        : CommonRbacUrlsInfo.clearAlarmByVenue)
    ])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const columns: TableProps<Alarm>['columns'] = [
    {
      title: $t({ defaultMessage: 'Alarm' }),
      key: 'message',
      dataIndex: 'message',
      width: 270,
      render: function (_, row) {
        return (<UI.ListItem>
          <UI.Meta
            avatar={getIconBySeverity(row.severity as EventSeverityEnum)}
            title={row.message}
            description={
              <UI.SpaceBetween>
                {getDeviceLink(row)}
              </UI.SpaceBetween>
            }
          />
        </UI.ListItem>)
      }
    }, {
      title: $t({ defaultMessage: 'Generated on' }),
      key: 'startTime',
      dataIndex: 'startTime',
      sorter: true,
      width: 140,
      render: function (_, row) {
        return (<UI.ListItem>
          <UI.Meta title={formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.startTime)} />
        </UI.ListItem>)
      }
    },
    ...(isNewAlarm ? [] : [{
      title: $t({ defaultMessage: 'Cleared on' }),
      key: 'clearTime',
      dataIndex: 'clearTime',
      sorter: true,
      width: 140,
      render: function (_: React.ReactNode, row: Alarm) {
        return (<UI.ListItem>
          <UI.Meta title={row.clearTime
            ? formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.clearTime)
            : noDataDisplay
          } />
        </UI.ListItem>)
      }
    }]),
    {
      title: $t({ defaultMessage: 'Device Type' }),
      key: 'entityType',
      dataIndex: 'entityType',
      render: function (_, row) {
        return (<UI.ListItem>
          <UI.Meta title={getDeviceType(row.entityType)} />
        </UI.ListItem>)
      }
    }, isNewAlarm ? {
      title: '',
      key: 'clearBtn',
      dataIndex: 'clearBtn',
      width: 30,
      render: function (_, row) {
        return (<UI.ListItem>
          <UI.Meta style={{ marginTop: '-5px' }}
            avatar={
              <Tooltip placement='topLeft'
                title={$t({ defaultMessage: 'Clear this alarm' })}
                arrowPointAtCenter>
                <UI.ClearButton
                  ghost={true}
                  disabled={!hasPermission}
                  icon={<UI.AcknowledgeCircle/>}
                  onClick={async ()=>{
                    await clearAlarm({ params: { ...params, alarmId: row.id } })
                    //FIXME: temporary workaround to waiting for backend add websocket to refresh the RTK cache automatically
                    setTimeout(() => {
                      store.dispatch(
                        eventAlarmApi.util.invalidateTags([
                          { type: 'Alarms', id: 'LIST' },
                          { type: 'Alarms', id: 'OVERVIEW' }
                        ]))
                      store.dispatch(
                        networkApi.util.invalidateTags([
                          { type: 'Network', id: 'Overview' }
                        ]))
                    }, 1000)
                  }}
                />
              </Tooltip>
            } />

        </UI.ListItem>)
      }
    } : {
      title: $t({ defaultMessage: 'Cleared By' }),
      key: 'clearedBy',
      dataIndex: 'clearedBy',
      width: 100,
      render: function (_, row) {
        return (<UI.ListItem>
          <UI.Meta title={row.clearedBy} />
        </UI.ListItem>)
      }
    }, {
      key: 'severity',
      dataIndex: 'severity',
      filterKey: 'severity',
      filterable: [
        { key: 'Critical', value: $t({ defaultMessage: 'Critical' }) },
        { key: 'Major', value: $t({ defaultMessage: 'Major' }) }
      ],
      filterPlaceholder: 'All Severities',
      filterableWidth: 135,
      filterMultiple: false,
      show: false
    }, {
      key: 'product',
      dataIndex: 'product',
      filterKey: 'product',
      filterable: [
        { key: 'WIFI', value: $t({ defaultMessage: 'Wi-Fi' }) },
        { key: 'SWITCH', value: $t({ defaultMessage: 'Switch' }) },
        { key: 'EDGE', value: $t({ defaultMessage: 'RUCKUS Edge' }) }
      ],
      filterPlaceholder: 'Products',
      filterableWidth: 135,
      filterMultiple: false,
      show: false
    }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    const severityFilter =
        { severity: customFilters?.severity ? [customFilters.severity[0]] : undefined }
    const productFilter =
        { product: customFilters?.product ? [customFilters.product[0]] : undefined }
    let _customFilters = {}
    _customFilters = {
      ...customFilters,
      ...severityFilter,
      ...productFilter,
      ...{ venueId: venueId ? [venueId] : undefined },
      ...{ serialNumber: serialNumber ? [serialNumber] : undefined },
      ...{ alarmType: isNewAlarm ? ['new'] : ['clear'] }
    }
    tableQuery.handleFilterChange(_customFilters, customSearch)
    setSelectedFilters({ ...severityFilter, ...productFilter })
    const alarmFilter = severityFilter.severity || productFilter.product
      ? { ...severityFilter, ...productFilter } : undefined
    setSelectedAlarmFilters(alarmFilter as {})
  }

  const actions: TableProps<Alarm>['actions'] = [
    {
      label: selectedAlarmFilters
        ? $t({ defaultMessage: 'Clear filtered alarms' })
        : $t({ defaultMessage: 'Clear all alarms' }),
      disabled: !hasPermission || tableQuery.data?.totalCount === 0,
      onClick: async () => {
        if (isClearAllAlarmsToggleEnabled) {
          const filterPayload = selectedAlarmFilters ? { filters: selectedAlarmFilters } : undefined
          await clearAllAlarms({ params, payload: filterPayload })
        } else {
          const venueNames: string[] = []
          const alarmIds: string[] = []
          allAlarms?.data.forEach(alarm => {
            if(alarm?.venueName) {
              if (!venueNames.includes(alarm?.venueName)) {
                venueNames.push(alarm?.venueName)
              }
            } else {
              if (!alarmIds.includes(alarm.id)) {
                alarmIds.push(alarm.id)
              }
            }})

          if (venueNames.length) {
            const venueIds = getVenueIdsOfAlarms(venueNames)
            if (venueIds.length) {
              await Promise.all(venueIds.map(async (venueId) => {
                await clearAlarmByVenue({ params: { ...params,
                  venueId } })
              }))
            }
          }

          if (alarmIds.length) {
            await Promise.all(alarmIds.map(async (alarmId) => {
              await clearAlarm({ params: { ...params, alarmId } })
            }))
          }

        }

        //FIXME: temporary workaround to waiting for backend add websocket to refresh the RTK cache automatically
        setTimeout(() => {
          store.dispatch(
            eventAlarmApi.util.invalidateTags([
              { type: 'Alarms', id: 'LIST' },
              { type: 'Alarms', id: 'OVERVIEW' }
            ]))
          store.dispatch(
            networkApi.util.invalidateTags([
              { type: 'Network', id: 'Overview' }
            ]))

        }, 1000)
      }
    }
  ]

  return <Loader states={[
    tableQuery,{ isLoading: false,
      isFetching: isNewAlarm && (isAlarmCleaning || isAlarmByVenueCleaning || isAllAlarmsCleaning) }
  ]}>
    <UI.TableWrapper>
      <Table<Alarm>
        className='alarms-table'
        rowKey='id'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={{ ...tableQuery.pagination, defaultPageSize: 0, showSizeChanger: false }}
        enablePagination={true}
        actions={isNewAlarm ? actions : []}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        enableApiFilter={true}
        selectedFilters={selectedFilters}
      />
    </UI.TableWrapper>
  </Loader>
}
