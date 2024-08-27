import { useCallback } from 'react'

import { Form }                      from 'antd'
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

interface FormValues { status: Statuses, settings: SettingsType }

export function ScheduleTiming () {
  const { intent } = useIntentContext()
  const showDate = isDateVisible(intent.status as Statuses)

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
    {isDateVisible(intent.status as Statuses) && <ScheduleDate />}
    <ScheduleTime />
  </>
}

function ScheduleDate () {
  const { $t } = useIntl()
  const form = Form.useFormInstance()

  return <Form.Item
    name={dateName}
    label={<FormattedMessage defaultMessage='Start Date' />}
    rules={[{ required: true, message: $t({ defaultMessage: 'Please select date' }) }]}
    children={
      <DatePicker
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

function ScheduleTime () {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const showDate = isDateVisible(intent.status as Statuses)

  const label = showDate
    ? <FormattedMessage defaultMessage='Start Time' />
    : <FormattedMessage defaultMessage='Schedule Time' />

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
      { required: true, message: $t({ defaultMessage: 'Please select time' }) },
      {
        validator (_, time) {
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
        placeholder={$t({ defaultMessage: 'Select time' })}
        disabledDateTime={{ disabledStrictlyBefore: getDisabledTime(date) }}
      />
    } />
}

const formats = {
  datetime: formatter(DateFormatEnum.DateTimeFormat),
  time: formatter(DateFormatEnum.OnlyTime)
}

ScheduleTiming.FieldSummary = function FieldSummary (): JSX.Element {
  const { $t } = useIntl()
  const { intent } = useIntentContext()
  const showDate = isDateVisible(intent.status as Statuses)
  const format = showDate ? formats.datetime : formats.time
  const label = showDate
    ? $t({ defaultMessage: 'Start Date & Time' })
    : $t({ defaultMessage: 'Schedule Time' })

  return <Form.Item name={fieldName} label={label}>
    <StepsForm.FieldSummary<SettingsType>
      convert={(settings) => format(getScheduledAt({
        status: intent.status as Statuses,
        settings: settings!
      }))}
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
  // TODO:
  // remove once switch to Intent resolver
  // required due to Recommendation resolver doesn't return scheudledAt by default
  values.settings.date ??= moment().clone().startOf('day')

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

  const scheduledAt = getScheduledAt(values)
  const current = getFutureTime(moment().seconds(0).milliseconds(0))
  return scheduledAt.isSameOrAfter(current)
}

export function validateScheduleTiming (values: FormValues): Promise<boolean> {
  const isValid = isScheduleAtValid(values)
  if (isValid) return Promise.resolve(true)

  const content = getSchduleIsFutureErrorMessage()
  showToast({ type: 'error', content })

  return Promise.reject({
    values,
    errorFields: [{
      name: fieldName,
      errors: [content]
    }],
    outOfDate: true
  })
}

function getSchduleIsFutureErrorMessage () {
  const { $t } = getIntl()
  const current = getFutureTime(moment().seconds(0).milliseconds(0))
  return $t(
    { defaultMessage: 'Scheduled time cannot be before {futureTime}' },
    { futureTime: formats.datetime(current) }
  )
}
