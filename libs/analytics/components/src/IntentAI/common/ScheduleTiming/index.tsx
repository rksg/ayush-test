import { useCallback, useEffect } from 'react'

import { Form }                      from 'antd'
import _                             from 'lodash'
import moment, { Moment }            from 'moment-timezone'
import { FormattedMessage, useIntl } from 'react-intl'

import { DatePicker, showToast, StepsForm, TimeDropdownPlain } from '@acx-ui/components'
import { DateFormatEnum, formatter }                           from '@acx-ui/formatter'
import { getIntl }                                             from '@acx-ui/utils'

import { useIntentContext }     from '../../IntentContext'
import { Statuses }             from '../../states'
import { getFutureTime }        from '../../useIntentAIActions'
import { SettingsType }         from '../../useIntentTransition'
import { richTextFormatValues } from '../richTextFormatValues'

const fieldName = 'settings'
const dateName = [fieldName, 'date']
const timeName = [fieldName, 'time']

interface FormValues { status: Statuses, settings: SettingsType, preferences?: unknown }

export function ScheduleTiming ({ disabled = false }: { disabled?: boolean }) {
  const { intent } = useIntentContext()
  const showDate = isDateVisible(intent.status)
  const form = Form.useFormInstance<FormValues>()

  useEffect(() => {
    if (disabled) {
      form.setFieldValue(dateName, undefined)
      form.setFieldValue(timeName, undefined)
      return
    }

    // Handles cleared field when fields were previously disabled
    if (form.getFieldValue(dateName) == null) {
      form.resetFields([dateName, timeName])
    }
  }, [disabled, form])

  const summary = showDate ? <FormattedMessage
    values={richTextFormatValues}
    /* eslint-disable max-len */
    defaultMessage={`
      <p>
        Choose a start date for IntentAI to begin autonomously managing your network settings and configurations.
      </p>
      <p>
        Additionally, select the time of day when these changes should occur. This time will be used daily by IntentAI to implement any necessary adjustments.
      </p>
      <p>
        It is advisable to select a time during low network usage to minimize disruptions.
      </p>
    `}
    /* eslint-enable */
  /> : <FormattedMessage
    values={richTextFormatValues}
    /* eslint-disable max-len */
    defaultMessage={`
      <p>
        Select the time of day when IntentAI changes should occur. This time will be used daily by IntentAI to implement any necessary adjustments.
      </p>
      <p>
        It is advisable to select a time during low network usage to minimize disruptions.
      </p>
    `}
    /* eslint-enable */
  />

  return <>
    {summary}
    {isDateVisible(intent.status) && <ScheduleDate disabled={disabled} />}
    <ScheduleTime disabled={disabled}/>
  </>
}

function ScheduleDate ({ disabled = false }: { disabled?: boolean }) {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  return <Form.Item
    name={dateName}
    label={<FormattedMessage defaultMessage='Date' />}
    rules={[{ required: !disabled, message: $t({ defaultMessage: 'Please select date' }) }]}
    children={
      <DatePicker
        disabled={disabled}
        style={{ width: '100%' }}
        picker='date'
        showTime={false}
        showToday={false}
        disabledDate={(date) => date.isBefore(moment().startOf('day'))}
        onChange={() => form.setFieldValue(timeName, undefined)}
      />
    }
  />
}

function ScheduleTime ({ disabled = false }: { disabled?: boolean }) {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const showDate = isDateVisible(intent.status)

  const label = <FormattedMessage defaultMessage='Time' />

  const form = Form.useFormInstance<FormValues>()
  const date = (Form.useWatch(dateName) ?? form.getFieldValue(dateName)) as Moment | undefined

  const getDisabledTime = useCallback((selected?: Moment) => {
    const now = moment()
    const isSameDay = selected?.clone().startOf('day').isSame(now.clone().startOf('day'))

    if (!isSameDay || !showDate) return 0

    const buffer = 15 * 60 // 15 minutes
    let duration = moment.duration(now.clone().add(15, 'minutes').format('HH:mm:ss'))
    duration = moment.duration(Math.ceil(duration.asSeconds() / buffer) * buffer, 'seconds')

    return duration.asHours()
  }, [showDate])

  return <Form.Item
    validateFirst
    // key required to force re-render when date changed
    key={date?.toISOString() ?? 'timedropdown'}
    name={timeName}
    label={label}
    rules={[
      { required: !disabled, message: $t({ defaultMessage: 'Please select time' }) },
      {
        validator (_, time) {
          if(disabled) return Promise.resolve(true)
          let values = form.getFieldsValue(['status', fieldName])
          values = { ...values, settings: { ...values.settings, time } }

          const isValid = isScheduleAtValid(values)
          if (isValid) return Promise.resolve(true)
          return Promise.reject(getSchduleIsFutureErrorMessage())
        }
      }
    ]}
    children={
      <TimeDropdownPlain
        disabled={disabled}
        placeholder={$t({ defaultMessage: 'Select time' })}
        disabledDateTime={{ disabledStrictlyBefore: getDisabledTime(date) }}
      />
    } />
}

const formats = {
  datetime: formatter(DateFormatEnum.DateTimeFormat),
  date: formatter(DateFormatEnum.DateFormat),
  time: formatter(DateFormatEnum.OnlyTime)
}

ScheduleTiming.FieldSummary = function FieldSummary (): JSX.Element {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const showDate = isDateVisible(intent.status)
  const label = showDate
    ? $t({ defaultMessage: 'Date & Time' })
    : $t({ defaultMessage: 'Time' })

  return <Form.Item name={fieldName} label={label}>
    <StepsForm.FieldSummary<SettingsType>
      convert={(settings) => {
        const value = getScheduledAt({
          status: intent.status,
          settings: settings!
        })
        const values = {
          date: formats.date(value),
          time: formats.time(value)
        }
        // eslint-disable-next-line max-len
        const dateTimeText = $t({ defaultMessage: 'The Intent will be scheduled to activate on {date}. Once active, any identified configuration changes will be applied daily at {time}.' }, values)
        // eslint-disable-next-line max-len
        const timeText = $t({ defaultMessage: 'Any identified configuration changes will be applied daily at {time}.' }, values)
        return showDate ? dateTimeText : timeText
      }}
    />
  </Form.Item>
}

function isDateVisible (status: Statuses) {
  return [
    Statuses.new,
    Statuses.scheduled
  ].includes(status)
}

export function getScheduledAt (values: FormValues) {
  const duration = moment.duration(values.settings.time, 'hours')
  const scheduledAt = values.settings.date.clone().set({
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: 0,
    milliseconds: 0
  })

  // when intent status matches isDateVisible implementation
  if (isDateVisible(values.status)) return scheduledAt

  const now = moment().seconds(0).milliseconds(0)
  const bufferedNow = getFutureTime(now.clone())

  // scheduled in future
  if (!bufferedNow.isAfter(scheduledAt)) return scheduledAt

  return now.clone().add(1, 'day').set({
    hours: duration.hours(),
    minutes: duration.minutes(),
    seconds: 0,
    milliseconds: 0
  })
}

function isScheduleAtValid (values: FormValues) {
  const showDate = isDateVisible(values.status)
  // logic to move date to next day if scheduledAt <= current in `getScheduledAt`
  if (!showDate) return true

  // no need to validate if intent
  if(_.get(values, 'preferences.enable') === false) return true

  const scheduledAt = getScheduledAt(values)
  const current = getFutureTime(moment().seconds(0).milliseconds(0))
  return scheduledAt.isSameOrAfter(current)
}

export function validateScheduleTiming (values: FormValues): boolean {
  const isValid = isScheduleAtValid(values)
  if (isValid) return true

  const content = getSchduleIsFutureErrorMessage()
  showToast({ type: 'error', content })

  return false
}

function getSchduleIsFutureErrorMessage () {
  const { $t } = getIntl()
  const current = getFutureTime(moment().seconds(0).milliseconds(0))
  return $t(
    { defaultMessage: 'Scheduled time cannot be before {futureTime}' },
    { futureTime: formats.datetime(current) }
  )
}
