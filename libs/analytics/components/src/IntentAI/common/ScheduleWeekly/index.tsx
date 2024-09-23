import { FormInstance } from 'antd'

import {
  Loader,
  ScheduleCard
} from '@acx-ui/components'
import { Features, useIsSplitOn }                      from '@acx-ui/feature-toggle'
import { useLazyGetTimezoneQuery, useVenuesListQuery } from '@acx-ui/rc/services'
import { Scheduler }                                   from '@acx-ui/types'

interface ScheduleWeeklyProps {
  excludedHours?: Scheduler,
  form: FormInstance,
  venueName: string
}

export const ScheduleWeekly = (props:ScheduleWeeklyProps) => {
  const { excludedHours, form, venueName } = props
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const { venue, isLoading }
    = useVenuesListQuery({ payload: {
      fields: ['name', 'latitude', 'longitude'],
      pageSize: 1,
      sortField: 'name',
      sortOrder: 'ASC',
      filters: { name: [venueName] }
    } } ,
    {
      selectFromResult: ({ data, isLoading }) => ({
        venue: data?.data?.[0],
        isLoading
      })
    })
  const [getTimezone] = useLazyGetTimezoneQuery()

  return (
    <Loader states={[{ isLoading }]}>
      {venue && <ScheduleCard
        type='CUSTOM'
        scheduler={excludedHours}
        venue={venue}
        lazyQuery={isMapEnabled? getTimezone: undefined}
        form={form}
        fieldNamePath={['preferences', 'excludedHours']}
        disabled={false}
        loading={isLoading}
        intervalUnit={60}
        isShowTips={false}
        is12H={false}
        prefix={false}
        timelineLabelTop={false}
        title=''
      />}

    </Loader>)

}