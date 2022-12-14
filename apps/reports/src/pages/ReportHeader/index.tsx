import { useContext } from 'react'

import moment from 'moment'

import { NetworkFilter } from '@acx-ui/analytics/components'
import {
  RangePicker,
  PageHeader } from '@acx-ui/components'
import { useDateFilter, dateRangeForLast } from '@acx-ui/utils'

import { NetworkFilterWithBandContext } from '../../Routes'

export type FilterMode = 'ap' | 'switch' | 'both'

export function ReportHeader (props: { name: string,
   mode?:FilterMode,
    footer?: React.ReactNode }) {
  const { name, mode = 'both' } = props
  const shouldQuerySwitch = mode === 'both' || mode === 'switch'
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
          shouldQuerySwitch={shouldQuerySwitch}
          showBand={mode === 'ap'}
          multiple={true}
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
