import { useContext } from 'react'

import moment from 'moment'

import { NetworkFilter } from '@acx-ui/analytics/components'
import {
  RangePicker,
  PageHeader } from '@acx-ui/components'
import { useDateFilter, dateRangeForLast } from '@acx-ui/utils'

import { NetworkFilterWithBandContext } from '../../Routes'

export function ReportHeader (props: { name: string, footer?: React.ReactNode }) {
  const name = props.name
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { setFilterData } = useContext(NetworkFilterWithBandContext)

  return (
    <PageHeader
      title={name}
      breadcrumb={[
        { text: 'Report', link: '/reports' }
      ]}
      extra={[
        <NetworkFilter
          key='network-filter'
          shouldQuerySwitch={false}
          showBand={true}
          replaceWithId={true}
          onApplyWithBand={setFilterData}
        />,
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
