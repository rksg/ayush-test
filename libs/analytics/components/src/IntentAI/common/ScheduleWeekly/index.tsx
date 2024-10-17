import { FormInstance } from 'antd'

import {
  ScheduleCard
} from '@acx-ui/components'
import { Scheduler } from '@acx-ui/types'
interface ScheduleWeeklyProps {
  excludedHours?: Scheduler
  form: FormInstance
  readonly: boolean
}

export const parseExcludedHours = (hours?:Scheduler):Record<string, number[]> | undefined => {
  if (hours) {
    const result: Record<string, number[]> = {}
    Object.keys(hours).forEach(hour => {
      result[hour] = hours[hour].map(h => parseInt(h, 10))
    })
    return result
  }
  return hours
}

export const buildExcludedHours = (hours?:Record<string, number[]>):Scheduler | undefined => {
  if (hours) {
    const result: Scheduler = {}
    Object.keys(hours).forEach(hour => {
      result[hour] = hours[hour].map(h => `${h}`)
    })
    return result
  }
  return hours
}

export const ScheduleWeekly = (props:ScheduleWeeklyProps) => {
  const { excludedHours, form, readonly } = props

  return (
    <ScheduleCard
      type='CUSTOM'
      scheduler={excludedHours}
      form={form}
      fieldNamePath={['preferences', 'excludedHours']}
      disabled={false}
      loading={false}
      intervalUnit={60}
      isShowTips={false}
      prefix={false}
      timelineLabelTop={false}
      isShowTimezone={false}
      localTimeZone
      readonly={readonly}
    />
  )
}