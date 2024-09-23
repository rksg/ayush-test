import { FormInstance } from 'antd'

import {
  ScheduleCard
} from '@acx-ui/components'
import { Scheduler } from '@acx-ui/types'

interface ScheduleWeeklyProps {
  excludedHours?: Scheduler,
  form: FormInstance
}

export const ScheduleWeekly = (props:ScheduleWeeklyProps) => {
  const { excludedHours, form } = props

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
      is12H={false}
      prefix={false}
      timelineLabelTop={false}
      title=''
      localTimeZone
    />
  )
}