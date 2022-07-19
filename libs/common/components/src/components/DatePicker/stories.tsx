import React from 'react'

import { storiesOf } from '@storybook/react'
import moment        from 'moment'

import { DatePicker, DateRange } from '.'

function Wrapper (props: { children: React.ReactNode }) {
  return <div
    {...props}
    style={{ position: 'absolute', top: 100, left: 500 }}
  />
}

storiesOf('DatePicker', module).add('Basic', () => (
  <Wrapper>
    <DatePicker
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))
storiesOf('DatePicker', module).add('with default Ranges', () => (
  <Wrapper>
    <DatePicker
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      rangeOptions
      onDateApply={() => {}}
    />
  </Wrapper>
))
storiesOf('DatePicker', module).add('with custom ranges', () => (
  <Wrapper>
    <DatePicker
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      rangeOptions={[DateRange.today, DateRange.last7Days]}
      onDateApply={() => {}}/>
  </Wrapper>
))
storiesOf('DatePicker', module).add('with custom time picker and ranges ', () => (
  <Wrapper>
    <DatePicker
      showTimePicker
      rangeOptions
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))

storiesOf('DatePicker', module).add('with restricted date selection', () => (
  <Wrapper>
    <DatePicker
      rangeOptions={[DateRange.today, DateRange.last7Days]}
      showTimePicker
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
    <DatePicker
      rangeOptions={[DateRange.today, DateRange.last7Days, DateRange.lastMonth]}
      showTimePicker
      enableDates={[moment().subtract(1, 'month').seconds(0),
        moment().seconds(0)]}
      selectedRange={{ startDate: moment().subtract(7, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={() => {}}
    />
  </Wrapper>
))
