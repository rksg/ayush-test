import { storiesOf } from '@storybook/react'
import moment        from 'moment'

import { DateRange } from '@acx-ui/analytics/utils'

import { CalenderRangePicker } from '.'

storiesOf('CalenderRangePicker', module).add('Basic', () => (
  <div style = {{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <CalenderRangePicker/>
  </div>
))
storiesOf('CalenderRangePicker', module).add('with default Ranges', () => (
  <div style = {{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <CalenderRangePicker 
      showRanges
    />
  </div>
))
storiesOf('CalenderRangePicker', module).add('with custom ranges', () => (
  <div style = {{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <CalenderRangePicker rangeOptions= {[DateRange.today, DateRange.last7Days]}
      showRanges
    /></div>
))
storiesOf('CalenderRangePicker', module).add('with custom time picker and ranges ', () => (
  <div style = {{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <CalenderRangePicker
      showTimePicker
      showRanges
    />
  </div>
 
))

storiesOf('CalenderRangePicker', module).add('with restricted date selection', () => (
  <div style = {{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <CalenderRangePicker
      rangeOptions= {[DateRange.today, DateRange.last7Days]}
      showTimePicker
      enableDates={[moment().subtract(7, 'days').seconds(0),
        moment().seconds(0)]}
      showRanges
    />
  </div>
))
storiesOf('CalenderRangePicker', module).add('with user default selected date', () => (
  <div style = {{
    position: 'absolute',
    top: 100,
    left: 500
  }}>
    <CalenderRangePicker
      rangeOptions= {[DateRange.today, DateRange.last7Days]}
      showTimePicker
      enableDates={[moment().subtract(1, 'month').seconds(0),
        moment().seconds(0)]}
      showRanges
      selectedRange=
        {{ start: moment().subtract(7, 'days').seconds(0), 
          end: moment().seconds(0) }}
    />
  </div>
))
