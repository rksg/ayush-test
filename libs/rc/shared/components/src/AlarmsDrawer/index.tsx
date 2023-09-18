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
import { formatter } from '@acx-ui/formatter'
import {
  useAlarmsListQuery,
  useClearAlarmMutation,
  useClearAllAlarmMutation,
  useGetAlarmCountQuery,
  eventAlarmApi,
  networkApi
}  from '@acx-ui/rc/services'
import { Alarm, CommonUrlsInfo, useTableQuery, EventSeverityEnum, EventTypeEnum } from '@acx-ui/rc/utils'
import { useParams, TenantLink }                                                  from '@acx-ui/react-router-dom'
import { store }                                                                  from '@acx-ui/store'

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
      serialNumber?: string[]
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
      'switchMacAddress'
    ]
  }

export function AlarmsDrawer (props: AlarmsType) {
  const params = useParams()
  const { data } = useGetAlarmCountQuery({ params })
  const { $t } = useIntl()
  const { visible, setVisible, serialNumber } = props

  window.addEventListener('showAlarmDrawer',(function (e:CustomEvent){
    setVisible(true)
    setSeverity(e.detail.data.name)
  }) as EventListener)

  const [severity, setSeverity] = useState('all')

  const [
    clearAlarm,
    { isLoading: isAlarmCleaning }
  ] = useClearAlarmMutation()

  const [
    clearAllAlarm,
    { isLoading: isAllAlarmCleaning }
  ] = useClearAllAlarmMutation()

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

  useEffect(()=>{
    const { payload } = tableQuery
    let filters = severity === 'all' ? {} : { severity: [severity] }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableQuery.data, severity, data, serialNumber])

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
        return <TenantLink
          to={`/devices/switch/${switchId}/${alarm.serialNumber}/details/timeline`}>
          {alarm.switchName}
        </TenantLink>
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

  const alarmList = <>
    <UI.FilterRow>
      <Select value={severity}
        size='small'
        onChange={(val)=>{
          setSeverity(val)
        }}>
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
      <Button type='link'
        disabled={tableQuery.data?.totalCount===0}
        size='small'
        style={{ fontWeight: 'var(--acx-body-font-weight-bold)' }}
        onClick={async ()=>{
          await clearAllAlarm({ params: { ...params } })
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
      tableQuery,{ isLoading: false, isFetching: isAlarmCleaning||isAllAlarmCleaning }
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
    width={400}
    title={$t({ defaultMessage: 'Alarms' })}
    visible={visible}
    onClose={() => {
      setVisible(false)
    }}
    children={alarmList}
  />
}
