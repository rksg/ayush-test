import { useMemo, useEffect, useState, useRef, useCallback, Component, MutableRefObject, ReactNode, RefObject } from 'react'

import {
  DatePicker as AntDatePicker,
  DatePickerProps as AntDatePickerProps
} from 'antd'
import _           from 'lodash'
import { useIntl } from 'react-intl'

import { Features, useIsSplitOn }                         from '@acx-ui/feature-toggle'
import {  DateFormatEnum, formatter, userDateTimeFormat } from '@acx-ui/formatter'
import { ClockOutlined }                                  from '@acx-ui/icons'
import { getUserProfile, isCoreTier }                     from '@acx-ui/user'
import {
  defaultRanges,
  DateRange,
  dateRangeMap,
  resetRanges,
  dateRangeForLast,
  AccountTier,
  defaultCoreTierRanges
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
export type RangesType = Record<string, RangeBoundType | (() => RangeBoundType)>
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RangeRef = Component<RangePickerProps<Moment>, unknown, any> & CommonPickerMethods | null
interface DatePickerProps {
  showTimePicker?: boolean;
  rangeOptions?: DateRange[];
  selectedRange: DateRangeType;
  onDateApply: Function;
  selectionType: DateRange;
  showAllTime?: boolean;
  showLast8hours?: boolean;
  isReport?: boolean;
  maxMonthRange?: number;
  allowedMonthRange?: number;
}
const AntRangePicker = AntDatePicker.RangePicker

export const restrictDateToMonthsRange = (
  values: RangeValueType,
  range: string,
  maxMonthRange: number) => {
  let startDate = values?.[0] || null
  let endDate = values?.[1] || null
  if (endDate && startDate && endDate.diff(startDate, 'months', true) > maxMonthRange) {
    if (range === 'start') {
      endDate = startDate.clone().add(maxMonthRange, 'months')
    }
    if (range === 'end') {
      startDate = endDate.clone().subtract(maxMonthRange, 'months')
    }
  }
  return { startDate, endDate }
}

export const RangePicker = ({
  showTimePicker,
  rangeOptions,
  selectedRange,
  onDateApply,
  showAllTime,
  selectionType,
  isReport,
  showLast8hours,
  maxMonthRange,
  allowedMonthRange
}: DatePickerProps) => {
  const { $t } = useIntl()
  const { accountTier } = getUserProfile()
  const isCore = isCoreTier(accountTier)
  const { translatedRanges, translatedOptions } = useMemo(() => {
    const ranges = isCore ? defaultCoreTierRanges(rangeOptions) : defaultRanges(rangeOptions)
    const translatedRanges: RangesType = {}
    const translatedOptions: Record<string, DateRange> = {}
    for (const rangeOption in ranges) {
      const translated = $t(dateRangeMap[rangeOption as DateRange])
      translatedOptions[translated] = rangeOption as DateRange
      translatedRanges[translated] = ranges[rangeOption as DateRange] as RangeBoundType
    }
    return { translatedRanges, translatedOptions }
  }, [$t, rangeOptions])
  const [range, setRange] = useState<DateRangeType>(selectedRange)
  const showResetMsg = useIsSplitOn(Features.ACX_UI_DATE_RANGE_RESET_MSG)
  const componentRef = useRef<HTMLDivElement | null>(null)
  const rangeRef = useRef<RangeRef>(null)
  const [activeIndex, setActiveIndex] = useState<0|1>(0)
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false)
  const allowedDateRange = (showResetMsg && allowedMonthRange)
    ? dateRangeForLast(allowedMonthRange,'months')
    : (accountTier === AccountTier.GOLD
      ? dateRangeForLast(1, 'month')
      : dateRangeForLast(isReport ? 12 : 3, 'months'))


  const disabledDate = useCallback(
    (current: Moment) => (
      (activeIndex === 1 && current.isAfter(
        range.startDate?.clone().add(maxMonthRange || 3, 'months'))) ||
      !current.isBetween(allowedDateRange[0], allowedDateRange[1], null, '[]')
    ),
    [allowedDateRange, activeIndex]
  )

  useEffect(
    () => {
      if (showResetMsg && !isCalendarOpen) {
        setRange(selectedRange)
      } else if (!showResetMsg) {
        setRange(selectedRange)
      }
    },
    [selectedRange.startDate, selectedRange.endDate] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    const handleClickForDatePicker = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (target instanceof HTMLInputElement && target.placeholder === 'Start date') {
        setActiveIndex(0)
      } else if  (target instanceof HTMLInputElement && target.placeholder === 'End date') {
        setActiveIndex(1)
      }

      if (componentRef.current && !componentRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false)
        setActiveIndex(0)
      }
      const selectedRange = translatedOptions[target.innerText]
      if (selectedRange) {
        resetRanges()
        setActiveIndex(0)
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

  const allTimeKey = showAllTime ? '' : $t(dateRangeMap[DateRange.allTime])
  const last8HoursKey = showLast8hours ? '' : $t(dateRangeMap[DateRange.last8Hours])
  const rangeText = `[${$t(dateRangeMap[selectionType])}]`
  return (
    <UI.RangePickerWrapper
      ref={componentRef}
      rangeOptions={rangeOptions}
      selectionType={selectionType}
      isCalendarOpen={isCalendarOpen}
      rangeText={rangeText}
      showTimePicker={showTimePicker}
      timeRangesForSelection={_.omit(translatedRanges, [allTimeKey, last8HoursKey])}
    >
      <AntRangePicker
        ref={rangeRef}
        ranges={_.omit(translatedRanges, [allTimeKey, last8HoursKey])}
        placement='bottomRight'
        disabledDate={disabledDate}
        open={isCalendarOpen}
        activePickerIndex={activeIndex}
        onClick={() => {
          setIsCalendarOpen(true)
        }}
        getPopupContainer={(triggerNode: HTMLElement) => triggerNode}
        suffixIcon={<ClockOutlined />}
        onCalendarChange={(values: RangeValueType, _: string[], info: { range: string }) => {
          const { range } = info
          const restrictRange = restrictDateToMonthsRange(values, range, maxMonthRange || 3)
          setActiveIndex((range === 'start') ? 1 : 0)
          setRange(prevRange => ({
            ...prevRange,
            startDate: restrictRange.startDate || null,
            endDate: restrictRange.endDate || null
          }))
        }}
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
  extraFooter?: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
  initialDate: MutableRefObject<Moment>;
  onApply: (value: Moment) => void;
  title?: string;
  disabledDateTime?: {
    disabledDate?: (value: Moment) => boolean,
    disabledHours?: (value: Moment) => number[],
    disabledMinutes?: (value: Moment) => number[],
  },
  placement?: 'bottomLeft' | 'bottomRight' | 'topLeft' | 'topRight'
}

let currentDateTimePicker: {
  ref: RefObject<boolean>,
  onClose: CallableFunction
}

export function useClosePreviousDateTimePicker (onClose: CallableFunction, visible: boolean) {
  const wasVisible = useRef<boolean>(false)
  useEffect(() => {
    if (visible && !wasVisible.current && currentDateTimePicker?.ref !== wasVisible) {
      currentDateTimePicker?.onClose?.()
      currentDateTimePicker = { ref: wasVisible, onClose }
    }
    wasVisible.current = visible
  }, [onClose, wasVisible, visible])
}

export const DateTimePicker = ({
  extraFooter,
  disabled,
  icon,
  initialDate,
  onApply,
  title,
  disabledDateTime,
  placement
}: DateTimePickerProps) => {
  const { disabledDate, disabledHours, disabledMinutes } = disabledDateTime || {}
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [date, setDate] = useState(() => initialDate.current)
  const [open, setOpen] = useState(false)
  useClosePreviousDateTimePicker(() => setOpen(false), Boolean(open))
  return <Tooltip placement='top' title={title}>
    <UI.HiddenDateInputGlobalOverride />
    <UI.HiddenDateInput ref={wrapperRef}>
      <AntDatePicker
        className='hidden-date-input'
        dropdownClassName='hidden-date-input-popover'
        picker='date'
        disabled={disabled}
        value={date}
        open={open}
        onClick={() => setOpen(true)}
        showTime={false}
        showNow={false}
        showToday={false}
        placement={placement ?? 'topLeft'}
        bordered={false}
        allowClear={false}
        suffixIcon={icon ? icon : <ClockOutlined />}
        disabledDate={disabledDate}
        getPopupContainer={() => document.body}
        onChange={value => setDate(value!)}
        renderExtraFooter={() =>
          <DateTimePickerFooter
            value={date}
            setValue={setDate}
            extraFooter={extraFooter}
            onApply={() => {
              onApply(date)
              setOpen(false)
            }}
            onCancel={() => setOpen(false)}
            disabledHours={disabledHours}
            disabledMinutes={disabledMinutes}
          />
        }
      />
    </UI.HiddenDateInput>
  </Tooltip>
}

export function getDefaultEarliestStart (props?: { isReport?: boolean }) {
  const { accountTier } = getUserProfile()
  const allowedDateRange = (accountTier === AccountTier.GOLD
    ? dateRangeForLast(1,'month')
    : dateRangeForLast(props?.isReport ? 12 : 3, 'months')
  )
  return allowedDateRange[0].startOf('day')
}