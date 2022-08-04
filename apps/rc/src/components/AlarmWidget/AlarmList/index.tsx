import { useEffect, useState } from 'react'

import { List, Space, Tooltip as AntTooltip } from 'antd'

import { Alarm, EventSeverityEnum, EventTypeEnum, useAlarmsListQuery } from '@acx-ui/rc/services'
import { CommonUrlsInfo, useTableQuery }                               from '@acx-ui/rc/utils'
import { formatter }                                                   from '@acx-ui/utils'

import * as UI from './styledComponents'

const defaultPayload = {
  url: CommonUrlsInfo.getAlarmsList.url,
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

const defaultArray: Alarm[] = []

export interface AlarmListProps {
  width: number,
  height: number,
  onNavigate: (alarm: Alarm) => void
}

export function AlarmList ({ width, height, onNavigate }: AlarmListProps) {
  const query = useTableQuery({
    useQuery: useAlarmsListQuery,
    defaultPayload,
    sorter: {
      sortField: 'startTime',
      sortOrder: 'DESC'
    }
  })
  const [alarmData, setAlarmData] = useState(defaultArray)
  useEffect(()=>{
    if (query.data?.data) {
      setAlarmData(query.data?.data)
    }
  }, [query.data])

  return <UI.AlarmListWrapper style={{
    height,
    width
  }}>
    <List
      dataSource={alarmData.slice(0, 5)} // Showing only top 5
      renderItem={(alarm: Alarm) => (
        <List.Item>
          <Space style={{ width }}>
            { alarm.severity === EventSeverityEnum.CRITICAL
              ? <UI.CriticalAlarmIcon />
              : <UI.MajorAlarmIcon /> }
            <AntTooltip title={alarm.message} placement='right'>
              <UI.MesssageWrapper style={{ width: width - 10 }}>
                {alarm.message}
              </UI.MesssageWrapper>
            </AntTooltip>
          </Space>
          <UI.SubTextContainer>
            {
              alarm.entityType === EventTypeEnum.SWITCH && !alarm.isSwitchExists
                ? <UI.NoLink>{alarm.switchName}</UI.NoLink>
                : <UI.Link onClick={() => onNavigate(alarm)}>
                  {alarm.apName || alarm.switchName || alarm.venueName}
                </UI.Link>
            }
            <UI.TimeStamp>{formatter('shortDateTimeFormat')(alarm.startTime)}</UI.TimeStamp>
          </UI.SubTextContainer>
        </List.Item>
      )}
    />
  </UI.AlarmListWrapper>
}
