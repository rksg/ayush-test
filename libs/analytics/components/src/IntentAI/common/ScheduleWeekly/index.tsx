import { FormInstance } from 'antd'

import {
  ScheduleCard
} from '@acx-ui/components'
import { Features, useIsSplitOn }  from '@acx-ui/feature-toggle'
import { useLazyGetTimezoneQuery } from '@acx-ui/rc/services'
import { Scheduler }               from '@acx-ui/types'

interface ScheduleWeeklyProps {
  excludedHours?: Scheduler,
  form: FormInstance,
  venue?: {
    latitude: string,
    longitude: string,
    name: string
  }
}

export const ScheduleWeekly = (props:ScheduleWeeklyProps) => {
  const { excludedHours, form, venue } = props
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const [getTimezone] = useLazyGetTimezoneQuery()

  return (<ScheduleCard
    type='CUSTOM'
    scheduler={excludedHours ?? undefined}
    venue={venue}
    lazyQuery={isMapEnabled? getTimezone: undefined}
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
  />)

}