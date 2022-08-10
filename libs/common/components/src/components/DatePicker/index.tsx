import { useEffect, useState, useRef, useCallback } from 'react'

import { DatePicker as AntdDatePicker } from 'antd'
import moment                           from 'moment'

import { ClockOutlined }                             from '@acx-ui/icons'
import { dateTimeFormats, defaultRanges, DateRange } from '@acx-ui/utils'

import { DatePickerFooter } from './DatePickerFooter'
import * as UI              from './styledComponents'

import type { Moment } from 'moment'

export type DateRangeType = {
  startDate: moment.Moment | null,
  endDate: moment.Moment | null
}
type RangeValueType = [Moment | null, Moment | null] | null
type RangeBoundType = [Moment, Moment] | null
type RangesType = Record<
  string,
  Exclude<RangeBoundType, null> | (() => Exclude<RangeBoundType, null>)
>
interface DatePickerProps {
  showTimePicker?: boolean;
  enableDates?: [Moment, Moment];
  rangeOptions?: DateRange[];
  selectedRange: DateRangeType;
  onDateChange?: Function;
  onDateApply: Function;
  selectionType: DateRange;
}
const AntdRangePicker = AntdDatePicker.RangePicker
const { dateFormat, dateTimeFormat } = dateTimeFormats

export const RangePicker = ({
  showTimePicker,
  enableDates,
  rangeOptions,
  selectedRange,
  onDateChange,
  onDateApply,
  selectionType
}: DatePickerProps) => {
  const didMountRef = useRef(false)

  const componentRef = useRef<HTMLDivElement | null>(null)

  const [range, setRange] = useState<DateRangeType>(selectedRange)

  const [isCalenderOpen, setIscalenderOpen] = useState<boolean>(false)
  const disabledDate = useCallback(
    (current: Moment) => {
      if (!enableDates) {
        return false
      }
      return enableDates[0] >= current || enableDates[1] < current.seconds(0)
    },
    [enableDates]
  )
  useEffect(() => {
    const handleClickForDatePicker = (event: MouseEvent) => {
      const target = event.target as HTMLInputElement
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIscalenderOpen(false)
      }
      if (Object.values(DateRange).includes(target.innerText as DateRange)) {
        onDateApply({
          range: target.innerText as DateRange
        })
        setIscalenderOpen(false)
      }
    }
    document.addEventListener('click', handleClickForDatePicker)
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    onDateChange?.(range)
    return () => {
      document.removeEventListener('click', handleClickForDatePicker)
    }
  }, [range, onDateChange, onDateApply])
  return (
    <UI.Wrapper ref={componentRef} rangeOptions={rangeOptions} selectionType={selectionType}>
      <AntdRangePicker
        ranges={defaultRanges(rangeOptions) as RangesType}
        placement='bottomRight'
        disabledDate={disabledDate}
        open={isCalenderOpen}
        onClick={() => setIscalenderOpen(true)}
        getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
        suffixIcon={<ClockOutlined />}
        onCalendarChange={(values: RangeValueType) =>
          setRange({ startDate: values?.[0] || null, endDate: values?.[1] || null })
        }
        mode={['date', 'date']}
        renderExtraFooter={() => (
          <DatePickerFooter
            showTimePicker={showTimePicker}
            range={range}
            setRange={setRange}
            defaultValue={selectedRange}
            setIsCalenderOpen={setIscalenderOpen}
            onDateApply={onDateApply}
          />
        )}
        value={[range?.startDate, range?.endDate]}
        format={showTimePicker ? dateTimeFormat : dateFormat}
        allowClear={false}
      />
    </UI.Wrapper>
  )
}
