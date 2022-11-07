import { List, Space } from 'antd'

import { Tooltip }                                 from '@acx-ui/components'
import { Alarm, EventSeverityEnum, EventTypeEnum } from '@acx-ui/rc/utils'
import { formatter }                               from '@acx-ui/utils'

import * as UI from './styledComponents'

export interface AlarmListProps {
  data: Alarm[],
  width: number,
  height: number,
  onNavigate: (alarm: Alarm) => void
}

export function AlarmList ({ data, width, height, onNavigate }: AlarmListProps) {
  return <UI.AlarmListWrapper style={{
    height,
    width
  }}>
    <List
      dataSource={data}
      renderItem={(alarm: Alarm) => (
        <List.Item>
          <Space style={{ width }}>
            { alarm.severity === EventSeverityEnum.CRITICAL
              ? <UI.CriticalAlarmIcon />
              : <UI.MajorAlarmIcon /> }
            <Tooltip title={alarm.message}>
              <UI.MesssageWrapper style={{ width: width - 10 }}>
                {alarm.message}
              </UI.MesssageWrapper>
            </Tooltip>
          </Space>
          <UI.SubTextContainer>
            {
              alarm.entityType === EventTypeEnum.SWITCH && !alarm.isSwitchExists
                ? <UI.NoLink>{alarm.switchName}</UI.NoLink>
                : <UI.Link onClick={() => onNavigate(alarm)}>
                  {alarm.apName || alarm.switchName}
                </UI.Link>
            }
            <UI.TimeStamp>
              {formatter('calendarFormat')(alarm.startTime!)}
            </UI.TimeStamp>
          </UI.SubTextContainer>
        </List.Item>
      )}
    />
  </UI.AlarmListWrapper>
}
