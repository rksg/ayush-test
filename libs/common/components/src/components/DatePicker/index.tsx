import { useEffect, useState, useRef, useCallback, Component } from 'react'

import {
  DatePicker as AntDatePicker,
  DatePickerProps as AntDatePickerProps
} from 'antd'
import { useIntl } from 'react-intl'

import { ClockOutlined }                                                        from '@acx-ui/icons'
import { dateTimeFormats, defaultRanges, DateRange, dateRangeMap, resetRanges } from '@acx-ui/utils'

import { DatePickerFooter } from './DatePickerFooter'
import * as UI              from './styledComponents'

import type { RangePickerProps }    from 'antd/lib/date-picker/generatePicker'
import type { CommonPickerMethods } from 'antd/lib/date-picker/generatePicker/interface'
import type { Moment }              from 'moment-timezone'

export type DateRangeType = {
  startDate: Moment | null,
  endDate: Moment | null
}
type RangeValueType = [Moment | null, Moment | null] | null
type RangeBoundType = [Moment, Moment] | null
type RangesType = Record<
  string,
  Exclude<RangeBoundType, null> | (() => Exclude<RangeBoundType, null>)
>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RangeRef = Component<RangePickerProps<Moment>, unknown, any> & CommonPickerMethods | null
interface DatePickerProps {
  showTimePicker?: boolean;
  enableDates?: [Moment, Moment];
  rangeOptions?: DateRange[];
  selectedRange: DateRangeType;
  onDateChange?: Function;
  onDateApply: Function;
  selectionType: DateRange;
}
const AntRangePicker = AntDatePicker.RangePicker
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
  const { $t } = useIntl()

  const componentRef = useRef<HTMLDivElement | null>(null)
  const rangeRef = useRef<RangeRef>(null)

  const [range, setRange] = useState<DateRangeType>(selectedRange)

  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
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
        setIsCalendarOpen(false)
      }
      if (Object.values(DateRange).includes(target.innerText as DateRange)) {
        resetRanges()
        rangeRef?.current?.blur()
        setIsCalendarOpen(false)
        onDateApply({
          range: target.innerText as DateRange // TODO this will fail when translated
        })
      }
    }
    document.addEventListener('click', handleClickForDatePicker)
    if (didMountRef.current) {
      onDateChange?.(range)
    }
    didMountRef.current = true
    return () => {
      document.removeEventListener('click', handleClickForDatePicker)
    }
  }, [range, onDateChange, onDateApply])

  const rangesWithi18n = Object.keys(defaultRanges(rangeOptions)).reduce((acc, rangeOption) => {
    return {
      ...acc,
      [$t(dateRangeMap[rangeOption as DateRange])]:
        defaultRanges(rangeOptions)[rangeOption as DateRange]
    }
  }, {})
  return (
    <UI.RangePickerWrapper
      ref={componentRef}
      rangeOptions={rangeOptions}
      selectionType={selectionType}
      isCalendarOpen={isCalendarOpen}
    >
      <AntRangePicker
        ref={rangeRef}
        ranges={rangesWithi18n as RangesType}
        placement='bottomRight'
        disabledDate={disabledDate}
        open={isCalendarOpen}
        onClick={() => setIsCalendarOpen(true)}
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
            setIsCalendarOpen={setIsCalendarOpen}
            onDateApply={onDateApply}
          />
        )}
        value={[range?.startDate, range?.endDate]}
        format={isCalendarOpen || selectionType === DateRange.custom
          ? (showTimePicker ? dateTimeFormat : dateFormat)
          : `[${selectionType}]`
        }
        allowClear={false}
      />
    </UI.RangePickerWrapper>
  )
}

export const DatePicker = (props: AntDatePickerProps) => (
  <UI.Wrapper>
    <AntDatePicker
      {...props}
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
    />
  </UI.Wrapper>
)
