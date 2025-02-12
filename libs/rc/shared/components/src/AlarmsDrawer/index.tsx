/* eslint-disable react/jsx-no-comment-textnodes */
import { useEffect, useState } from 'react'


import { Select }           from 'antd'
import { PaginationConfig } from 'antd/lib/pagination'
import { SorterResult }     from 'antd/lib/table/interface'
import { useIntl }          from 'react-intl'

import {
  Loader,
  Tooltip,
  Button
} from '@acx-ui/components'
import { Features, useIsSplitOn } from '@acx-ui/feature-toggle'
import { formatter }              from '@acx-ui/formatter'
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
  CommonRbacUrlsInfo
} from '@acx-ui/rc/utils'
import { useParams, TenantLink }                          from '@acx-ui/react-router-dom'
import { store }                                          from '@acx-ui/store'
import { RolesEnum }                                      from '@acx-ui/types'
import { getUserProfile, hasAllowedOperations, hasRoles } from '@acx-ui/user'
import { getOpsApi }                                      from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface AlarmsType {
  setVisible: (visible: boolean) => void,
  visible?: boolean,
  serialNumber?: string
}

const defaultPayload: {
    url: string
    fields: string[]
    filters?: {
      severity?: string[],
      serialNumber?: string[],
      venueId?: string[]
    }
  } = {
    url: CommonUrlsInfo.getAlarmsList.url,
    filters: { severity: ['all'] },
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
      'minimumRequiredVersion'
    ]
  }

export function AlarmsDrawer (props: AlarmsType) {
  const params = useParams()
  const { $t } = useIntl()
  const { rbacOpsApiEnabled } = getUserProfile()
  const { visible, setVisible } = props
  const isFilterProductToggleEnabled = useIsSplitOn(Features.ALARM_WITH_PRODUCT_FILTER_TOGGLE)

  window.addEventListener('showAlarmDrawer',(function (e:CustomEvent){
    setVisible(true)
    setSeverity(e.detail.data.name)
    if (isFilterProductToggleEnabled) {
      setProductType(e.detail.data.product ?? 'all')
    }

    if(e.detail.data.venueId){
      setVenueId(e.detail.data.venueId)
    }else{
      setVenueId('')
    }

    if(e.detail.data.serialNumber){
      setSerialNumber(e.detail.data.serialNumber)
    }else{
      setSerialNumber('')
    }
  }) as EventListener)

  const [severity, setSeverity] = useState('all')
  const [productType, setProductType] = useState('all')
  const [venueId, setVenueId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')

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

  useEffect(()=>{
    const { payload, pagination: paginationValue } = tableQuery
    let filters = severity === 'all' ? {} : { severity: [severity] }
    if (isFilterProductToggleEnabled && productType !== 'all') {
      filters = { ...filters, ...{ product: [productType] } }
    }
    tableQuery.setPayload({
      ...payload,
      filters
    })

    if(serialNumber){
      filters = { ...filters, ...{ serialNumber: [serialNumber] } }
      tableQuery.setPayload({
        ...payload,
        filters
      })
    }

    if(venueId){
      filters = { ...filters, ...{ venueId: [venueId] } }
      tableQuery.setPayload({
        ...payload,
        filters
      })
    }

    if(tableQuery.data?.totalCount && tableQuery.data?.data.length === 0){
      const totalPage = Math.ceil(tableQuery.data.totalCount / paginationValue.pageSize)
      if(paginationValue.page >= totalPage){
        const pagination = {
          current: totalPage,
          pageSize: paginationValue.pageSize
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
      }
    }
  }, [tableQuery.data, severity, serialNumber, venueId, productType])

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

  const hasPermission = rbacOpsApiEnabled
    ? hasAllowedOperations([getOpsApi(CommonUrlsInfo.clearAlarm),
      getOpsApi(CommonRbacUrlsInfo.clearAlarmByVenue)
    ])
    : hasRoles([RolesEnum.PRIME_ADMIN, RolesEnum.ADMINISTRATOR])

  const alarmList = <>
    <UI.FilterRow>
      <Select value={severity}
        size='small'
        onChange={(val)=>{
          setSeverity(val)
        }}
        dropdownMatchSelectWidth={false}>
        <Select.Option value={'all'}>
          { $t({ defaultMessage: 'All Severities' }) }
        </Select.Option>
        <Select.Option value={'Critical'}>
          { $t({ defaultMessage: 'Critical' }) }
        </Select.Option>
        <Select.Option value={'Major'}>
          { $t({ defaultMessage: 'Major' }) }
        </Select.Option>
      </Select>
      {isFilterProductToggleEnabled && <Select value={productType}
        size='small'
        onChange={(val)=>{
          setProductType(val)
        }}
        dropdownMatchSelectWidth={false}>
        <Select.Option value={'all'}>
          { $t({ defaultMessage: 'Products' }) }
        </Select.Option>
        <Select.Option value={'WIFI'}>
          { $t({ defaultMessage: 'Wi-Fi' }) }
        </Select.Option>
        <Select.Option value={'SWITCH'}>
          { $t({ defaultMessage: 'Switch' }) }
        </Select.Option>
        <Select.Option value={'EDGE'}>
          { $t({ defaultMessage: 'RUCKUS Edge' }) }
        </Select.Option>
      </Select>}

      <Button type='link'
        disabled={!hasPermission
          || tableQuery.data?.totalCount === 0
          || tableQuery.isFetching
          || isAlarmCleaning || isAlarmByVenueCleaning
        }
        size='small'
        style={{ fontWeight: 'var(--acx-body-font-weight-bold)' }}
        onClick={async ()=>{
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
        }}>
        {$t({ defaultMessage: 'Clear all alarms' })}
      </Button>
    </UI.FilterRow>
    <Loader states={[
      tableQuery,{ isLoading: false,
        isFetching: isAlarmCleaning || isAlarmByVenueCleaning }
    ]}>
      <UI.ListTable
        itemLayout='horizontal'
        pagination={{
          ...tableQuery.pagination as PaginationConfig,
          showSizeChanger: false,
          onChange: (page, pageSize) => {
            const pagination = {
              current: page,
              pageSize
            }
            const sorter = {
              field: 'startTime',
              order: 'descend'
            } as SorterResult<Alarm>
            const extra = {
              currentDataSource: [] as Alarm[],
              action: 'paginate' as const
            }
            return tableQuery?.handleTableChange?.(pagination, {}, sorter, extra)
          }
        }}
        dataSource={tableQuery.data?.data}
        renderItem={(item) => {
          const alarm = item as Alarm
          return (
            <UI.ListItem actions={[
              <Tooltip placement='topLeft'
                title={$t({ defaultMessage: 'Clear this alarm' })}
                arrowPointAtCenter>
                <UI.ClearButton
                  ghost={true}
                  disabled={!hasPermission}
                  icon={<UI.AcknowledgeCircle/>}
                  onClick={async ()=>{
                    await clearAlarm({ params: { ...params, alarmId: alarm.id } })
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
                avatar={getIconBySeverity(alarm.severity as EventSeverityEnum)}
                title={alarm.message}
                description={
                  <UI.SpaceBetween>
                    {getDeviceLink(alarm)}
                    <UI.ListTime>{formatter('calendarFormat')(alarm.startTime)}</UI.ListTime>
                  </UI.SpaceBetween>
                }
              />
            </UI.ListItem>
          )}}
      />
    </Loader>
  </>

  return <UI.Drawer
    width={isFilterProductToggleEnabled ? 415 : 400}
    title={$t({ defaultMessage: 'Alarms' })}
    visible={visible}
    onClose={() => {
      setVisible(false)
      setVenueId('')
    }}
    children={alarmList}
  />
}
