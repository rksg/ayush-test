
import  { useEffect, useState, useRef, useCallback } from 'react'

import { DatePicker as antdDatePicker } from 'antd'
import { pick }                         from 'lodash'
import moment                           from 'moment'

import { ClockOutlined } from '@acx-ui/icons'

import { DatePickerFooter } from './DatePickerFooter'
import * as UI              from './styledComponents'

import type { Moment  } from 'moment'


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
  rangeOptions?: [DateRange,DateRange] | boolean;
  selectedRange: DateRangeType;
  onDateChange?:Function;
  onDateApply:Function
};

export const dateFormat = 'DD/MM/YYYY'
export const dateWithTimeFormat= 'DD/MM/YYYY HH:mm'

const { RangePicker } = antdDatePicker

const defaultRanges = (subRange?: DateRange[] | boolean) => {
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
  if (subRange && typeof subRange !== 'boolean') {
    return pick(defaultRange, subRange)
  }
  return defaultRange
}

export const DatePicker = ({ showTimePicker, enableDates, rangeOptions,
  selectedRange, onDateChange,onDateApply }:DatePickerProps) => {

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
  },[enableDates])
  useEffect(()=>{
    const handleClickForDatePicker = (event : MouseEvent) => {
      const target = event.target as HTMLInputElement
      if ((componentRef.current && !componentRef.current.contains(event.target as Node)) 
      || Object.values(DateRange).includes(target.innerText as DateRange)
      ){
        onDateApply({ 
          startDate: range.startDate?.format(),
          endDate: range.endDate?.format() })
        setIscalenderOpen(false) 
      }
    }
    document.addEventListener('click', handleClickForDatePicker, true)
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if( typeof onDateChange === 'function')
      onDateChange(range)
    return () => {
      document.removeEventListener('click', handleClickForDatePicker, true)
    }
    
  }
  ,[range, onDateChange,setIscalenderOpen,onDateApply])


  return ( 
    <UI.Wrapper ref={componentRef} hasTimePicker={showTimePicker}>
      <RangePicker 
        ranges={
          rangeOptions
            ? defaultRanges(rangeOptions) as RangesType
            : undefined}
        placement='bottomRight'
        disabledDate={disabledDate}
        className='acx-range-picker'
        dropdownClassName='acx-range-picker-popup'
        open={isCalenderOpen}
        onClick={() => setIscalenderOpen (true)}
        getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
        suffixIcon={<ClockOutlined/>}
        onCalendarChange={(values: RangeValueType) =>
          setRange({
            startDate: values
              ? values[0]
              : null ,
            endDate: values
              ? values[1]
              : null })
        }
        mode={['date', 'date']}
        renderExtraFooter={() => 
          <DatePickerFooter 
            showTimePicker={showTimePicker} 
            range={range}
            setRange={setRange}
            defaultValue={selectedRange}
            setIscalenderOpen={setIscalenderOpen}
            onDateApply={onDateApply}/>}
        value={[range?.startDate, range?.endDate]}
        format={
          showTimePicker
            ? dateWithTimeFormat
            : dateFormat
        }
        allowClear={false}
      />
    </UI.Wrapper>
  )
}

