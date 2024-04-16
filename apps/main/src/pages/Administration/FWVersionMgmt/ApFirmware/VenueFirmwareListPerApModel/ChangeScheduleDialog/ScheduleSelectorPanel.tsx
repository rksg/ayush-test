import { useState } from 'react'

import { DatePicker, Radio, Space } from 'antd'
import dayjs                        from 'dayjs'
import moment                       from 'moment'
import { useIntl }                  from 'react-intl'

import { AVAILABLE_SLOTS } from '@acx-ui/rc/utils'

import * as UI from '../styledComponents'

import type { DatePickerProps, RadioChangeEvent } from 'antd'
import type { RangePickerProps }                  from 'antd/es/date-picker'

interface ScheduleSelectorPanelProps {
  initialDate?: string
  initialTime?: string
  updateDate: (date: string) => void
  updateTime: (time: string) => void
}

export default function ScheduleSelectorPanel (props: ScheduleSelectorPanelProps) {
  const { $t } = useIntl()
  const { initialDate = '', initialTime = '', updateDate, updateTime } = props
  const [ selectedDate, setSelectedDate ] = useState(initialDate)
  const [ selectedTime, setSelectedTime ] = useState(initialTime)
  const startDate = dayjs(Date.now()).endOf('day')
  const endDate = startDate.add(21, 'day')

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
  // Can not select days before today and today
    return current && (current < startDate || current > endDate)
  }

  const onDateChange: DatePickerProps['onChange'] = (date, dateString) => {
    setSelectedDate(dateString)
    updateDate(dateString)
  }

  const onTimeChange = (e: RadioChangeEvent) => {
    setSelectedTime(e.target.value)
    updateTime(e.target.value)
  }

  return (<>
    <UI.TitleDate>
      {$t({ defaultMessage: 'When do you want the update to run?' })}
    </UI.TitleDate>
    <UI.Title2Date>
      {// eslint-disable-next-line max-len
        $t({ defaultMessage: 'Selected time will apply to each venue according to own time-zone' })}
    </UI.Title2Date>
    <UI.DateContainer>
      <label>{$t({ defaultMessage: 'Update date:' })}</label>
      <DatePicker
        value={initialDate ? moment(initialDate) : null}
        showToday={false}
        disabledDate={disabledDate}
        onChange={onDateChange}
      />
    </UI.DateContainer>
    { selectedDate ?
      <UI.DateContainer>
        <label>{$t({ defaultMessage: 'Update time:' })}</label>
        <Radio.Group
          style={{ margin: 12 }}
          onChange={onTimeChange}
          value={selectedTime}>
          <Space direction={'vertical'}>
            { AVAILABLE_SLOTS.map(v =>
              <Radio value={v.value} key={v.value}>{v.label}</Radio>)}
          </Space>
        </Radio.Group>
      </UI.DateContainer>
      : null
    }
  </>)
}
