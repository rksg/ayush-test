import moment from 'moment'

import {
  RangePicker,
  PageHeader } from '@acx-ui/components'
import { VenueFilter }                     from '@acx-ui/main/components'
import { useDateFilter, dateRangeForLast } from '@acx-ui/utils'

export function ReportHeader (props: { name: string, footer?: React.ReactNode }) {
  const name = props.name
  const { startDate, endDate, setDateFilter, range } = useDateFilter()

  return (
    <PageHeader
      title={name}
      breadcrumb={[
        { text: 'Report', link: '/reports' }
      ]}
      extra={[
        <VenueFilter key='hierarchy-filter'/>,
        <RangePicker
          key='range-picker'
          selectedRange={{ startDate: moment(startDate), endDate: moment(endDate) }}
          enableDates={dateRangeForLast(3,'months')}
          onDateApply={setDateFilter as CallableFunction}
          showTimePicker
          selectionType={range}
        />
      ]}
      footer={props.footer && props.footer}
    />
  )
}
