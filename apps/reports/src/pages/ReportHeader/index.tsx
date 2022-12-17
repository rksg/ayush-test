import { useContext, useEffect } from 'react'

import moment from 'moment'

import { NetworkFilter } from '@acx-ui/analytics/components'
import {
  RangePicker,
  PageHeader,
  Band } from '@acx-ui/components'
import { useDateFilter, dateRangeForLast } from '@acx-ui/utils'

import { NetworkFilterWithBandContext } from '../../Routes'

export type FilterMode = 'ap' | 'switch' | 'both'

export function ReportHeader (props: {
  name: string,
  mode?:FilterMode,
  shouldHideBand?: boolean,
  footer?: React.ReactNode }) {
  const { name, mode = 'both', shouldHideBand=false } = props
  const shouldQuerySwitch = ['switch','both'].includes(mode)
  const showBand = !shouldHideBand && ['ap','both'].includes(mode)
  const { startDate, endDate, setDateFilter, range } = useDateFilter()
  const { filterData, setFilterData } = useContext(NetworkFilterWithBandContext)
  const { value: raw, bands } = filterData

  useEffect(()=>{
    // Reset only any those dependency changes
    setFilterData({})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, showBand, shouldQuerySwitch])

  return (
    <PageHeader
      title={name}
      breadcrumb={[
        { text: 'Report', link: '/reports' }
      ]}
      extra={[
        <NetworkFilter
          key='reports-network-filter'
          shouldQuerySwitch={shouldQuerySwitch}
          showBand={showBand}
          multiple={true}
          replaceWithId={true}
          filterMode={mode}
          defaultValue={raw}
          defaultBand={bands as Band[]}
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
