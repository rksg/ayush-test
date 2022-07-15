import { storiesOf } from '@storybook/react'
import moment        from 'moment'

import { DatePicker,DateRange } from '.'

storiesOf('DatePicker', module).add('Basic', () => (
  <div style={{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <DatePicker 
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={()=>{}}
    />
  </div>
))
storiesOf('DatePicker', module).add('with default Ranges', () => (
  <div style={{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <DatePicker
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      rangeOptions
      onDateApply={()=>{}}
    />
  </div>
))
storiesOf('DatePicker', module).add('with custom ranges', () => (
  <div style={{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <DatePicker 
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      rangeOptions={[DateRange.today, DateRange.last7Days]}
      onDateApply={()=>{}}/>
  </div>
))
storiesOf('DatePicker', module).add('with custom time picker and ranges ', () => (
  <div style={{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <DatePicker
      showTimePicker
      rangeOptions
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={()=>{}}
    />
  </div>
))

storiesOf('DatePicker', module).add('with restricted date selection', () => (
  <div style={{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <DatePicker
      rangeOptions={[DateRange.today, DateRange.last7Days]}
      showTimePicker
      enableDates={[moment().subtract(7, 'days').seconds(0),
        moment().seconds(0)]}
      selectedRange={{ startDate: moment().subtract(1, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={()=>{}}
    />
  </div>
))
storiesOf('DatePicker', module).add('with user default selected date', () => (
  <div style={{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <DatePicker
      rangeOptions={[DateRange.today, DateRange.last7Days]}
      showTimePicker
      enableDates={[moment().subtract(1, 'month').seconds(0),
        moment().seconds(0)]}
      selectedRange={{ startDate: moment().subtract(7, 'days').seconds(0),
        endDate: moment().seconds(0) }}
      onDateApply={()=>{}}
    />
  </div>
))
