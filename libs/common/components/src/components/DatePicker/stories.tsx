import React from 'react'

import { storiesOf } from '@storybook/react'
import moment        from 'moment'

import { DateRange } from '@acx-ui/utils'

import { RangePicker } from '.'

function Wrapper (props: { children: React.ReactNode }) {
  return <div
    {...props}
    style={{ position: 'absolute', top: 100, left: 500 }}
  />
}

storiesOf('DatePicker', module).add('with default Ranges', () => (
  <Wrapper>
    <RangePicker
      selectionType={DateRange.last24Hours}
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))
storiesOf('DatePicker', module).add('with custom ranges', () => (
  <Wrapper>
    <RangePicker
      selectionType={DateRange.last24Hours}
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
      onDateApply={() => {}}/>
  </Wrapper>
))
storiesOf('DatePicker', module).add('with custom time picker and ranges ', () => (
  <Wrapper>
    <RangePicker
      selectionType={DateRange.last24Hours}
      showTimePicker
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))

storiesOf('DatePicker', module).add('with restricted date selection', () => (
  <Wrapper>
    <RangePicker
      rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
      showTimePicker
      selectionType={DateRange.last24Hours}
      enableDates={[moment().subtract(7, 'days').seconds(0),
        moment().seconds(0)]}
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))
storiesOf('DatePicker', module).add('with user default selected date', () => (
  <Wrapper>
    <RangePicker
      rangeOptions={[DateRange.today, DateRange.last7Days, DateRange.lastMonth]}
      showTimePicker
      selectionType={DateRange.last7Days}
      enableDates={[moment().subtract(1, 'month').seconds(0),
        moment().seconds(0)]}
      selectedRange={{ startDate: moment().subtract(7, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))
