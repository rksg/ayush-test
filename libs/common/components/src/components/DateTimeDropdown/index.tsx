import { DatePicker, DatePickerProps, Form } from 'antd'
import { NamePath }                          from 'antd/lib/form/interface'
import { castArray }                         from 'lodash'
import moment, { Moment }                    from 'moment-timezone'
import { useIntl }                           from 'react-intl'

import { TimeDropdownPlain } from '../TimeDropdown'

export interface DateTimeDropdownProps {
  name: NamePath
  dateLabel: React.ReactNode
  timeLabel: React.ReactNode
  disabledDate?: DatePickerProps['disabledDate']
}

export const DateTimeDropdown = ({
  name,
  dateLabel,
  timeLabel,
  disabledDate
} : DateTimeDropdownProps) => {
  const { $t } = useIntl()
  const dateName = [...castArray(name), 'date']
  const timeName = [...castArray(name), 'time']
  const form = Form.useFormInstance()
  const date = (Form.useWatch(dateName) ?? form.getFieldValue(dateName)) as Moment | undefined

  return (<>
    <Form.Item
      name={dateName}
      label={dateLabel}
      rules={[{ required: true, message: $t({ defaultMessage: 'Please select date' }) }]}
      children={
        <DatePicker
          data-testid='selectDate'
          style={{ width: '100%' }}
          picker='date'
          showTime={false}
          showToday={false}
          disabledDate={disabledDate}
          onChange={() => form.setFieldValue(timeName, undefined)}
        />
      }
    />

    <Form.Item
      // key required to force re-render when date changed
      key={date?.toISOString() ?? 'timedropdown'}
      name={timeName}
      label={timeLabel}
      rules={[{ required: true, message: $t({ defaultMessage: 'Please select time' }) }]}
      children={
        <TimeDropdownPlain
          placeholder={$t({ defaultMessage: 'Select time' })}
          disabledDateTime={{ disabledStrictlyBefore: getDisabledTime(date) }}
        />
      } />
  </>)
}

function roundUpTimeToNearest15Minutes (timeStr: string) {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const totalMinutes = hours * 60 + minutes
  const roundedMinutes = Math.ceil(totalMinutes / 15) * 15
  const roundedHours = Math.floor(roundedMinutes / 60)
  const roundedMinutesInHour = roundedMinutes % 60
  const decimalHour = roundedHours + roundedMinutesInHour / 60
  return decimalHour
}

function getDisabledTime (dateSelected?: Moment) {
  return (!dateSelected?.startOf('day').isSame(moment().startOf('day')))
    ? 0
    : roundUpTimeToNearest15Minutes(moment().format('HH:mm:ss'))
}
