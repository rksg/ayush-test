
import  { useEffect, useState, useRef, useCallback } from 'react'

import { DatePicker as AntdDatePicker } from 'antd'
import { pick }                         from 'lodash'
import moment                           from 'moment'

import { ClockOutlined }   from '@acx-ui/icons'
import { dateTimeFormats } from '@acx-ui/utils'

import { DatePickerFooter } from './DatePickerFooter'
import * as UI              from './styledComponents'

import type { Moment } from 'moment'


export enum DateRange {
  today = 'Today',
  last1Hour = 'Last 1 Hour',
  last24Hours = 'Last 24 Hours',
  last7Days = 'Last 7 Days',
  lastMonth = 'Last Month',
  custom = 'Custom'
}
export type DateRangeType = { startDate: moment.Moment | null, endDate : moment.Moment | null }
type RangeValueType = [Moment | null, Moment | null] | null
type RangeBoundType= [Moment, Moment] | null
type RangesType = Record<string, Exclude<RangeBoundType, null>
  | (() => Exclude<RangeBoundType, null>)>
interface DatePickerProps {
  showTimePicker?: boolean;
  enableDates?: [Moment, Moment];
  rangeOptions?: DateRange[];
  selectedRange: DateRangeType;
  onDateChange?: Function;
  onDateApply: Function
};

const AntdRangePicker = AntdDatePicker.RangePicker
const { dateFormat, dateTimeFormat } = dateTimeFormats

const defaultRanges = (subRange?: DateRange[]) => {
  const defaultRange: Partial<{ [key in DateRange]: moment.Moment[] }> = {
    [DateRange.last1Hour]: [
      moment().subtract(1, 'hours').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.today]: [moment().startOf('day').seconds(0), moment().seconds(0)],
    [DateRange.last24Hours]: [
      moment().subtract(1, 'days').seconds(0),
      moment().seconds(0)
    ],
    [DateRange.last7Days]: [moment().subtract(7, 'days').seconds(0), moment().seconds(0)],
    [DateRange.lastMonth]: [
      moment().subtract(1, 'month').seconds(0),
      moment().seconds(0)
    ]
  }
  if (subRange) {
    return pick(defaultRange, subRange)
  }
  return defaultRange
}

export const RangePicker = ({ showTimePicker, enableDates, rangeOptions,
  selectedRange, onDateChange,onDateApply }: DatePickerProps) => {

  const didMountRef = useRef(false)
  const componentRef = useRef<HTMLDivElement | null>(null)

  const [range, setRange] = useState<DateRangeType>(selectedRange)
  const [isCalenderOpen, setIscalenderOpen] = useState<boolean>(false)
  const disabledDate = useCallback((current: Moment) => {
    if (!enableDates) {
      return false
    }
    return enableDates[0] >= current ||
    enableDates[1] < current.seconds(0)
  }, [enableDates])
  useEffect(()=>{
    const handleClickForDatePicker = (event : MouseEvent) => {
      const target = event.target as HTMLInputElement
      if ((componentRef.current && !componentRef.current.contains(event.target as Node))
        || Object.values(DateRange).includes(target.innerText as DateRange)
      ) {
        onDateApply(range)
        setIscalenderOpen(false)
      }
    }
    document.addEventListener('click', handleClickForDatePicker, true)
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    onDateChange?.(range)
    return () => {
      document.removeEventListener('click', handleClickForDatePicker, true)
    }
  }, [range, onDateChange, setIscalenderOpen, onDateApply])


  return (
    <UI.Wrapper ref={componentRef}>
      <AntdRangePicker
        ranges={defaultRanges(rangeOptions) as RangesType}
        placement='bottomRight'
        disabledDate={disabledDate}
        open={isCalenderOpen}
        onClick={() => setIscalenderOpen (true)}
        getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
        suffixIcon={<ClockOutlined/>}
        onCalendarChange={(values: RangeValueType) => values == null
          ? setRange({ startDate: null, endDate: null })
          : setRange({ startDate: values[0], endDate: values[1] })
        }
        mode={['date', 'date']}
        renderExtraFooter={() =>
          <DatePickerFooter
            showTimePicker={showTimePicker}
            range={range}
            setRange={setRange}
            defaultValue={selectedRange}
            setIsCalenderOpen={setIscalenderOpen}
            onDateApply={onDateApply}/>}
        value={[range?.startDate, range?.endDate]}
        format={
          showTimePicker
            ? dateTimeFormat
            : dateFormat
        }
        allowClear={false}
      />
    </UI.Wrapper>
  )
}

