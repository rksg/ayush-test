/* eslint-disable react/jsx-no-comment-textnodes */
import { useState } from 'react'

import { useIntl } from 'react-intl'

import {
  Loader,
  Tooltip,
  Table,
  TableProps
} from '@acx-ui/components'
import { Features, useIsSplitOn }    from '@acx-ui/feature-toggle'
import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import {
  useAlarmsListQuery,
  useClearAlarmMutation,
  eventAlarmApi,
  networkApi,
  useClearAlarmByVenueMutation,
  useGetVenuesQuery
} from '@acx-ui/rc/services'
import {
  Alarm,
  CommonUrlsInfo,
  useTableQuery,
  EventSeverityEnum,
  EventTypeEnum,
  FILTER,
  SEARCH
} from '@acx-ui/rc/utils'
import { useParams, TenantLink } from '@acx-ui/react-router-dom'
import { store }                 from '@acx-ui/store'
import { RolesEnum }             from '@acx-ui/types'
import { hasRoles }              from '@acx-ui/user'

import * as UI from './styledComponents'

import { AlarmsType } from '.'

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
      'clearedBy'
    ]
  }

export function NewAlarmsDrawer (props: AlarmsType) {
  const params = useParams()
  const { $t } = useIntl()
  const { visible, setVisible } = props
  const isFilterProductToggleEnabled = useIsSplitOn(Features.ALARM_WITH_PRODUCT_FILTER_TOGGLE)

  window.addEventListener('showAlarmDrawer',(function (e:CustomEvent){
    setVisible(true)
    let filters = e.detail.data.name && e.detail.data.name !== 'all' ?
      { severity: [e.detail.data.name] } : {}
    if (isFilterProductToggleEnabled && e.detail.data.product && e.detail.data.product !== 'all') {
      filters = { ...filters, ...{ product: [e.detail.data.product] } }
    }
    setVenueId(e.detail.data.venueId ?? '')
    setSerialNumber(e.detail.data.serialNumber ?? '')
    setSelectedFilters(filters)
  }) as EventListener)

  const [venueId, setVenueId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [selectedFilters, setSelectedFilters] = useState({})

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

  const { data: venuesList } =
    useGetVenuesQuery({ params: useParams(), payload: venuesListPayload }, { skip: !visible })

  const tableQuery = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload,
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    },
    pagination: {
      pageSize: 25
    },
    option: { skip: !visible }
  })

  const allAlarmsPayload = { ...defaultPayload,
    filters: {},
    sortField: 'startTime',
    sortOrder: 'DESC',
    page: 1,
    pageSize: 10000 }

  const { data: allAlarms } = useAlarmsListQuery({ payload: allAlarmsPayload },
    { skip: !visible })

  /*const getFilters = () => {
    let filters = severity === 'all' ? {} : { severity: [severity] }
    if (isFilterProductToggleEnabled && productType !== 'all') {
      filters = { ...filters, ...{ product: [productType] } }
    }
    if(serialNumber){
      filters = { ...filters, ...{ serialNumber: [serialNumber] } }
    }
    if(venueId){
      filters = { ...filters, ...{ venueId: [venueId] } }
    }
    return filters
  }

  const onTableChange = (currentPage: number, pageSize: number) => {
    const pagination = {
      current: currentPage,
      pageSize: pageSize
    }
    const sorter = {
      field: 'startTime',
      order: 'descend'
    } as SorterResult<Alarm>
    const extra = {
      currentDataSource: [] as Alarm[],
      action: 'paginate' as const
    }
    tableQuery?.handleTableChange?.(pagination, {}, sorter, extra)
  }*/

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

  const hasPermission = hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const columns: TableProps<Alarm>['columns'] = [
    {
      title: $t({ defaultMessage: 'Alarm' }),
      key: 'message',
      dataIndex: 'message',
      width: 350,
      render: function (_, row) {
        return (<UI.ListItem actions={[
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
        ]}>
          <UI.Meta
            avatar={getIconBySeverity(row.severity as EventSeverityEnum)}
            title={row.message}
            description={
              <UI.SpaceBetween>
                {getDeviceLink(row)}
                {/* <UI.ListTime>{formatter('calendarFormat')(row.startTime)}</UI.ListTime> */}
              </UI.SpaceBetween>
            }
          />
        </UI.ListItem>)
      }
    }, {
      title: $t({ defaultMessage: 'Generated on' }),
      key: 'startTime',
      dataIndex: 'startTime',
      render: function (_, row) {
        return formatter(DateFormatEnum.DateTimeFormatWithSeconds)(row.startTime)
      }
    }, {
      title: $t({ defaultMessage: 'Device Type' }),
      key: 'entityType',
      dataIndex: 'entityType'
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
      filterable: isFilterProductToggleEnabled ? [
        { key: 'WIFI', value: $t({ defaultMessage: 'Wi-Fi' }) },
        { key: 'SWITCH', value: $t({ defaultMessage: 'Switch' }) },
        { key: 'EDGE', value: $t({ defaultMessage: 'RUCKUS Edge' }) }
      ] : false,
      filterPlaceholder: 'Products',
      filterableWidth: 135,
      filterMultiple: false,
      show: false
    }]

  const handleFilterChange = (customFilters: FILTER, customSearch: SEARCH) => {
    let _customFilters = {}
    _customFilters = {
      ...customFilters,
      ...{ severity: customFilters?.severity ? [customFilters.severity[0]] : undefined },
      ...{ product: customFilters?.product ? [customFilters.product[0]] : undefined },
      ...{ venueId: venueId ? [venueId] : undefined },
      ...{ serialNumber: serialNumber ? [serialNumber] : undefined }
    }
    tableQuery.handleFilterChange(_customFilters, customSearch)
  }

  const actions: TableProps<Alarm>['actions'] = [
    {
      label: $t({ defaultMessage: 'Clear all alarms' }),
      disabled: !hasPermission || tableQuery.data?.totalCount === 0,
      onClick: async () => {
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

  const alarmList =
    <Loader states={[
      tableQuery,{ isLoading: false,
        isFetching: isAlarmCleaning || isAlarmByVenueCleaning }
    ]}>
      <Table<Alarm>
        rowKey='id'
        columns={columns}
        dataSource={tableQuery.data?.data}
        pagination={{ ...tableQuery.pagination, defaultPageSize: 0, showSizeChanger: false }}
        enablePagination={true}
        actions={actions}
        onChange={tableQuery.handleTableChange}
        onFilterChange={handleFilterChange}
        type={'compact'}
        showHeader={false}
        enableApiFilter={true}
        selectedFilters={selectedFilters}
      />
    </Loader>

  return <UI.Drawer
    width={765}
    title={$t({ defaultMessage: 'Alarms' })}
    visible={visible}
    destroyOnClose={true}
    onClose={() => {
      setVisible(false)
    }}
    children={alarmList}
  />
}
