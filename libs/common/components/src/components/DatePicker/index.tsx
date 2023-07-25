import { useMemo, useEffect, useState, useRef, useCallback, Component } from 'react'

import {
  DatePicker as AntDatePicker,
  DatePickerProps as AntDatePickerProps
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import {  DateFormatEnum, formatter, userDateTimeFormat } from '@acx-ui/formatter'
import { ClockOutlined }                                  from '@acx-ui/icons'
import {
  defaultRanges,
  DateRange,
  dateRangeMap,
  resetRanges,
  getJwtTokenPayload,
  AccountTier,
  dateRangeForLast
} from '@acx-ui/utils'

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
type RangeBoundType = [Moment, Moment]
type RangesType = Record<string, RangeBoundType | (() => RangeBoundType)>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RangeRef = Component<RangePickerProps<Moment>, unknown, any> & CommonPickerMethods | null
interface DatePickerProps {
  showTimePicker?: boolean;
  rangeOptions?: DateRange[];
  selectedRange: DateRangeType;
  onDateApply: Function;
  selectionType: DateRange;
  showAllTime?: boolean;
}
const AntRangePicker = AntDatePicker.RangePicker

export const RangePicker = ({
  showTimePicker,
  rangeOptions,
  selectedRange,
  onDateApply,
  showAllTime,
  selectionType
}: DatePickerProps) => {
  const { $t } = useIntl()
  const { translatedRanges, translatedOptions } = useMemo(() => {
    const ranges = defaultRanges(rangeOptions)
    const translatedRanges: RangesType = {}
    const translatedOptions: Record<string, DateRange> = {}
    for (const rangeOption in ranges) {
      const translated = $t(dateRangeMap[rangeOption as DateRange])
      translatedOptions[translated] = rangeOption as DateRange
      translatedRanges[translated] = ranges[rangeOption as DateRange] as RangeBoundType
    }
    return { translatedRanges, translatedOptions }
  }, [$t, rangeOptions])
  const componentRef = useRef<HTMLDivElement | null>(null)
  const rangeRef = useRef<RangeRef>(null)
  const [range, setRange] = useState<DateRangeType>(selectedRange)
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const { acx_account_tier: accountTier } = getJwtTokenPayload()
  const allowedDateRange = accountTier === AccountTier.GOLD
    ? dateRangeForLast(1,'month')
    : dateRangeForLast(3,'months')
  const disabledDate = useCallback(
    (current: Moment) => {
      return allowedDateRange[0] >= current || allowedDateRange[1] < current.seconds(0)
    },
    [allowedDateRange]
  )

  useEffect(
    () => setRange(selectedRange),
    [selectedRange.startDate, selectedRange.endDate]
  )

  useEffect(() => {
    const handleClickForDatePicker = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
      }
      const selectedRange = translatedOptions[target.innerText]
      if (selectedRange) {
        resetRanges()
        rangeRef?.current?.blur()
        setIsCalendarOpen(false)
        onDateApply({ range: selectedRange })
      }
    }
    document.addEventListener('click', handleClickForDatePicker)
    return () => {
      document.removeEventListener('click', handleClickForDatePicker)
    }
  }, [range, onDateApply, translatedOptions])

  const allTimeKey = $t(dateRangeMap[DateRange.allTime])
  const rangeText = `[${$t(dateRangeMap[selectionType])}]`
  return (
    <UI.RangePickerWrapper
      ref={componentRef}
      rangeOptions={rangeOptions}
      selectionType={selectionType}
      isCalendarOpen={isCalendarOpen}
      rangeText={rangeText}
    >
      <AntRangePicker
        ref={rangeRef}
        ranges={showAllTime ? translatedRanges :
          _.omit(translatedRanges, allTimeKey)}
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
          ? formatter(showTimePicker ? DateFormatEnum.DateTimeFormat : DateFormatEnum.DateFormat)
          : rangeText
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
      format={userDateTimeFormat(DateFormatEnum.DateFormat)}
      getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
    />
  </UI.Wrapper>
)
