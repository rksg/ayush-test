import { useMemo, useEffect, useState, useRef, useCallback, Component, MutableRefObject, ReactNode, RefObject } from 'react'


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

import { Tooltip } from '../Tooltip'

import { DatePickerFooter, DateTimePickerFooter } from './DatePickerFooter'
import * as UI                                    from './styledComponents'

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

interface DateTimePickerProps {
  applyFooterMsg?: string;
  disabled?: boolean;
  icon?: ReactNode;
  initialDate: MutableRefObject<Moment>;
  onApply: (value: Moment) => void;
  title?: string;
  disabledDateTime?: {
    disabledDate?: (value: Moment) => boolean,
    disabledHours?: (value: Moment) => number[],
    disabledMinutes?: (value: Moment) => number[],
  }
}

let currentDateTimePicker: {
  ref: RefObject<HTMLDivElement>,
  onCancel: CallableFunction
} = {
  ref: { current: null },
  onCancel: () => {}
}

export const DateTimePicker = ({
  applyFooterMsg,
  disabled,
  icon,
  initialDate,
  onApply,
  title,
  disabledDateTime
}: DateTimePickerProps) => {
  const { disabledDate, disabledHours, disabledMinutes } = disabledDateTime || {}
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const selectRef = useRef(false)
  const [date, setDate] = useState(() => initialDate.current)
  const [open, setOpen] = useState(false)
  const onChange = (val: boolean) => { selectRef.current = val }
  const onOpenChange = (val: boolean) => {
    if (selectRef.current) {
      return setOpen(true)
    }
    setOpen(val)
  }
  const onApplyHandler = () => {
    onApply(date)
    setOpen(false)
    onChange(false)
  }
  const onCancel = useCallback(() => {
    setOpen(false)
    onChange(false)
  }, [])

  useEffect(() => {
    if (open && wrapperRef.current) {
      if (!currentDateTimePicker.ref.current) {
        currentDateTimePicker.ref = wrapperRef
        currentDateTimePicker.onCancel = onCancel
        return
      }

      if (!currentDateTimePicker.ref.current.isSameNode(wrapperRef.current)) {
        currentDateTimePicker.onCancel()
        currentDateTimePicker.ref = wrapperRef
        currentDateTimePicker.onCancel = onCancel
      }
    }
  }, [onCancel, open])

  return <Tooltip placement='right' title={title}>
    <UI.HiddenDateInput ref={wrapperRef}>
      <AntDatePicker
        className='datepicker'
        dropdownClassName='datepicker-popover'
        picker='date'
        disabled={disabled}
        value={date}
        open={open}
        onOpenChange={onOpenChange}
        onClick={() => setOpen(true)}
        showTime={false}
        showNow={false}
        showToday={false}
        placement='topLeft'
        bordered={false}
        allowClear={false}
        suffixIcon={icon ? icon : <ClockOutlined />}
        disabledDate={disabledDate}
        getPopupContainer={(node) => node}
        onChange={(value) => {
          selectRef.current = true
          setDate(value!)
        }}
        renderExtraFooter={() =>
          <DateTimePickerFooter
            value={date}
            setValue={setDate}
            applyFooterMsg={applyFooterMsg}
            onApply={onApplyHandler}
            onCancel={onCancel}
            disabledHours={disabledHours}
            disabledMinutes={disabledMinutes}
            onChange={onChange}
          />
        }
      />
    </UI.HiddenDateInput>
  </Tooltip>
}