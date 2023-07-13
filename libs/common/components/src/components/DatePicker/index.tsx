import { useMemo, useEffect, useState, useRef, useCallback, Component, MutableRefObject, ReactNode } from 'react'


import {
  DatePicker as AntDatePicker,
  DatePickerProps as AntDatePickerProps,
  Divider
} from 'antd'
import _           from 'lodash'
import moment      from 'moment-timezone'
import { useIntl } from 'react-intl'

import {  DateFormatEnum, formatter }    from '@acx-ui/formatter'
import { CaretDownSolid, ClockOutlined } from '@acx-ui/icons'
import {
  defaultRanges,
  DateRange,
  dateRangeMap,
  resetRanges,
  getJwtTokenPayload,
  AccountTier,
  dateRangeForLast
} from '@acx-ui/utils'

import { Button }  from '../Button'
import { Tooltip } from '../Tooltip'

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
      getPopupContainer={props.getPopupContainer || ((triggerNode: HTMLElement) => triggerNode)}
    />
  </UI.Wrapper>
)


interface DateTimePickerFooterProps {
  onApply: CallableFunction;
  onCancel: CallableFunction;
  applyFooterMsg?: string;
  value: Moment;
  setValue: CallableFunction;
  initialDate: Moment;
}

const DateTimePickerFooter = ({
  applyFooterMsg,
  onApply,
  onCancel,
  value,
  setValue,
  initialDate
}: DateTimePickerFooterProps) => {
  const [open, setOpen] = useState({ hour: false, minute: false })

  const disabledHours = useCallback(() => {
    const hours = []
    const previousHour = (initialDate.hours() - 1) % 24
    for (let i = previousHour; i >= 0; i--) {
      hours.push(i)
    }
    return initialDate.isSame(value, 'dates') ? hours : []
  }, [initialDate, value])

  const disabledMinutes = useCallback(() => {
    const minutes = []
    const pastMinute = (initialDate.minutes() - 15) % 60
    for (let i = pastMinute; i >= 0; i = i - 15) {
      minutes.push(i)
    }
    return initialDate.isSame(value, 'dates') ? minutes : []
  }, [initialDate, value])

  return <UI.FooterWrapper>
    <UI.TimePickerRow>
      <UI.TimePickerWrapper
        role='time-picker'
        size='small'
        inputReadOnly
        hourStep={1}
        value={value}
        open={open.hour}
        onOpenChange={(val) => setOpen(open => ({ ...open, hour: val }))}
        onClick={() => setOpen(open => ({ ...open, hour: true }))}
        showNow={false}
        format={'HH'}
        placeholder={String(value.hours())}
        suffixIcon={<CaretDownSolid />}
        allowClear={false}
        disabledTime={() => ({ disabledHours })}
        getPopupContainer={(node: HTMLElement) => node}
        onSelect={(time) => {
          setOpen(open => ({ ...open, hour: false }))
          setValue(time)
        }}
      />
      <UI.TimePickerColon>:</UI.TimePickerColon>
      <UI.TimePickerWrapper
        role='time-picker'
        size='small'
        inputReadOnly
        value={value}
        open={open.minute}
        onOpenChange={val => setOpen(open => ({ ...open, minute: val }))}
        onClick={() => setOpen(open => ({ ...open, minute: true }))}
        showNow={false}
        format={'mm'}
        minuteStep={15}
        placeholder={String(value.minutes())}
        suffixIcon={<CaretDownSolid />}
        allowClear={false}
        disabledTime={() => ({ disabledMinutes })}
        getPopupContainer={(node: HTMLElement) => node}
        onSelect={(time) => {
          setOpen(open => ({ ...open, minute: true }))
          setValue(time)
        }}
      />
    </UI.TimePickerRow>
    {applyFooterMsg
      ? <>
        <Divider />
        <UI.ApplyMsgWrapper>{applyFooterMsg}</UI.ApplyMsgWrapper>
        <Divider />
      </>
      : <Divider />}
    <Button type='secondary' size='small' onClick={() => onApply()} >Apply</Button>
    <Button type='default' size='small' onClick={() => onCancel()}>Cancel</Button>
  </UI.FooterWrapper>
}

interface DateTimePickerProps {
  applyFooterMsg?: string;
  disabled?: boolean;
  icon?: ReactNode;
  initialDate: MutableRefObject<Moment>;
  onApply: CallableFunction;
  title?: string
}

export const DateTimePicker = ({
  applyFooterMsg,
  disabled,
  icon,
  initialDate,
  onApply,
  title
}: DateTimePickerProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const selectRef = useRef(false)
  const [date, setDate] = useState(() => initialDate.current)
  const [open, setOpen] = useState(false)
  const onOpenHandler = (val: boolean) => {
    if (selectRef.current) {
      selectRef.current = false
      return setOpen(true)
    }
    setOpen(val)
  }
  const onApplyHandler = () => {
    onApply(date, 'current date')
    setOpen(false)
  }
  const disabledDate = useCallback((value: Moment) =>
    value.isBefore(initialDate.current)
    || value.isAfter(moment(initialDate.current).add(1, 'months')),
  [initialDate])

  return <Tooltip placement='top' title={title}>
    <UI.HiddenDateInput ref={wrapperRef}>
      <AntDatePicker
        className='datepicker'
        dropdownClassName='datepicker-popover'
        picker='date'
        disabled={disabled}
        value={date}
        open={open}
        onOpenChange={onOpenHandler}
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
        onSelect={(value) => {
          selectRef.current = true
          setDate(value!)
        }}
        renderExtraFooter={() =>
          <DateTimePickerFooter
            value={date}
            initialDate={initialDate.current}
            setValue={setDate}
            applyFooterMsg={applyFooterMsg}
            onApply={onApplyHandler}
            onCancel={() => setOpen(false)}
          />
        }
      />
    </UI.HiddenDateInput>
  </Tooltip>
}