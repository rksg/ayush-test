import React from 'react'

import { storiesOf } from '@storybook/react'
import moment        from 'moment-timezone'

import { DateRange } from '@acx-ui/utils'

import { DatePicker, RangePicker } from '.'

function Wrapper (props: { children: React.ReactNode }) {
  return <div {...props} style={{ position: 'absolute', top: 100, left: 500 }} />
}

storiesOf('DatePicker', module).add('Basic', () => (
  <Wrapper>
    <DatePicker />
  </Wrapper>
))

storiesOf('DatePicker', module).add('RangePicker - default ranges', () => (
  <Wrapper>
    <RangePicker
      selectionType={DateRange.last24Hours}
      selectedRange={{
        startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0)
      }}
      onDateApply={() => {}}
    />
  </Wrapper>
))

storiesOf('DatePicker', module).add('RangePicker - custom ranges', () => (
  <Wrapper>
    <RangePicker
      selectionType={DateRange.last24Hours}
      selectedRange={{
        startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0)
      }}
      rangeOptions={[DateRange.last24Hours, DateRange.last7Days]}
      onDateApply={() => {}}
    />
  </Wrapper>
))

storiesOf('DatePicker', module).add('RangePicker - custom time picker and ranges ', () => (
  <Wrapper>
    <RangePicker
      selectionType={DateRange.last24Hours}
      showTimePicker
      selectedRange={{
        startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0)
      }}
      onDateApply={() => {}}
    />
  </Wrapper>
))

storiesOf('DatePicker', module).add('RangePicker - user default selected date', () => (
  <Wrapper>
    <RangePicker
      rangeOptions={[DateRange.last24Hours, DateRange.last7Days, DateRange.last30Days]}
      showTimePicker
      selectionType={DateRange.last7Days}
      selectedRange={{
        startDate: moment().subtract(7, 'days').seconds(0),
        endDate: moment().seconds(0)
      }}
      onDateApply={() => {}}
    />
  </Wrapper>
))
