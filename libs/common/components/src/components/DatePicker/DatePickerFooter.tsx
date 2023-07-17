import React, { useCallback, useState } from 'react'

import { Divider }                  from 'antd'
import { range as timepickerRange } from 'lodash'
import { useIntl }                  from 'react-intl'

import { DateFormatEnum, formatter } from '@acx-ui/formatter'
import { CaretDownSolid }            from '@acx-ui/icons'
import { DateRange }                 from '@acx-ui/utils'

import { Button } from '../Button'

import * as UI from './styledComponents'

import { DateRangeType } from '.'

import type { Moment } from 'moment-timezone'

interface DatePickerFooterProps {
  showTimePicker?: boolean;
  setRange: React.Dispatch<React.SetStateAction<DateRangeType>>;
  range: DateRangeType;
  setIsCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValue: DateRangeType;
  onDateApply: Function;
}
type DisabledTimes = {
  disabledHours?: () => number[],
  disabledMinutes?: (hour: number) => number[],
  disabledSeconds?: (hour: number, minute: number) => number[]
}

const timePickerConfig = [
  { id: 1, range: 'startDate', value: 'hour', format: 'HH', offset: 6, hasColon: true },
  { id: 2, range: 'startDate', value: 'minutes', format: 'mm', offset: 0, hasHyphen: true },
  { id: 3, range: 'endDate', value: 'hour', format: 'HH', offset: 0, hasColon: true },
  { id: 4, range: 'endDate', value: 'minutes', format: 'mm', offset: 0 }
]

const getCustomisedDate = (date: Moment | null, showTimePicker?: boolean) =>
  formatter(showTimePicker?DateFormatEnum.DateTimeFormat: DateFormatEnum.DateFormat)(date)

const defaultselectionForDisabledDates = {
  disabledHours: () => [],
  disabledMinutes: () => []
}
export const DatePickerFooter = ({
  showTimePicker,
  range,
  defaultValue,
  setRange,
  setIsCalendarOpen,
  onDateApply
}: DatePickerFooterProps) => {
  const { $t } = useIntl()
  const initialTimePickerPanelState = timePickerConfig.reduce((acc, { id } ) => {
    return { ...acc, [id]: false }
  }, {})
  const [isTimeSelectorOpen, setIsTimeSelectorOpen] = useState<
    Record<number, boolean>
  >(initialTimePickerPanelState)
  const onButtonClick = (type: string) => {
    if (type === 'cancel') {
      setRange(defaultValue)
    } else {
      onDateApply({
        startDate: range.startDate?.format(),
        endDate: range.endDate?.format(),
        range: DateRange.custom
      })
    }
    setIsCalendarOpen(false)
    setIsTimeSelectorOpen(initialTimePickerPanelState)
  }
  const onTimePickerSelect = (config: typeof timePickerConfig[number], time: Moment) => {
    if (config.range === 'startDate' && time && time.isAfter(range.endDate)) {
      setRange({ startDate: time, endDate: time })
    } else {
      setRange({ ...range, [config.range]: time })
    }
    setIsTimeSelectorOpen({ ...isTimeSelectorOpen,[config.id]: !isTimeSelectorOpen[config.id] })
  }
  const disabledDateTime = useCallback((): DisabledTimes => {
    if (range.startDate && range.endDate && range.startDate.isSame(range.endDate, 'day')) {
      return {
        disabledHours: () => timepickerRange(0, range.startDate?.hour()),
        disabledMinutes: () => timepickerRange(0, range.startDate?.minute())
      }
    }
    return defaultselectionForDisabledDates
  }, [range])

  return (
    <>
      {showTimePicker && (
        <UI.TimePickerRow>
          {timePickerConfig.map((config) => (
            <React.Fragment key={config.id}>
              <UI.TimePickerWrapper
                role='time-picker'
                size='small'
                showNow={false}
                format={config.format}
                placeholder=''
                suffixIcon={<CaretDownSolid />}
                allowClear={false}
                open={isTimeSelectorOpen[config.id]}
                getPopupContainer={(node: HTMLElement) => node}
                onSelect={(time) => onTimePickerSelect(config, time)}
                value={range[config.range as keyof DateRangeType]}
                disabled={!range[config.range as keyof DateRangeType]}
                onOpenChange={() => setIsTimeSelectorOpen({
                  ...isTimeSelectorOpen,
                  [config.id]: !isTimeSelectorOpen[config.id]
                })}
                disabledTime={
                  config.range === 'endDate'
                    ? disabledDateTime
                    : () => defaultselectionForDisabledDates
                }
                inputReadOnly
              />
              {config.hasColon && <UI.TimePickerColon>:</UI.TimePickerColon>}
              {config.hasHyphen && <UI.TimePickerHyphen>-</UI.TimePickerHyphen>}
            </React.Fragment>
          ))}
        </UI.TimePickerRow>
      )}
      <UI.RangeApplyRow>
        <UI.SelectedRange role='display-date-range'>
          {`${getCustomisedDate(range?.startDate, showTimePicker) || ''}
        - ${getCustomisedDate(range?.endDate, showTimePicker) || ''}`}
        </UI.SelectedRange>
        <UI.Buttons>
          <Button onClick={() => onButtonClick('cancel')} size={'small'}>
            {$t({ defaultMessage: 'Cancel' })}
          </Button>
          <Button
            type={'secondary'}
            size={'small'}
            onClick={() => onButtonClick('apply')}
            disabled={
              range.startDate === null ||
              range.endDate === null ||
              range.startDate.isSame(range.endDate)
            }
          >
            {$t({ defaultMessage: 'Apply' })}
          </Button>
        </UI.Buttons>
      </UI.RangeApplyRow>
    </>
  )
}

interface DateTimePickerFooterProps {
  onApply: (value: Moment) => void;
  onCancel: () => void;
  applyFooterMsg?: string;
  value: Moment;
  setValue: (value: Moment) => void;
  initialDate: Moment;
}

export const DateTimePickerFooter = ({
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
    return initialDate.isSame(value, 'dates')
      ? hours
      : []
  }, [initialDate, value])

  const disabledMinutes = useCallback(() => {
    const minutes = []
    const pastMinute = (initialDate.minutes() - 15) % 60
    for (let i = pastMinute; i >= 0; i = i - 15) {
      minutes.push(i)
    }
    return initialDate.isSame(value, 'dates') && initialDate.isSame(value, 'hours')
      ? minutes
      : []
  }, [initialDate, value])

  return <UI.FooterWrapper>
    <UI.TimePickerRow>
      <UI.TimePickerWrapper
        key='hours'
        role='time-picker-hours'
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
        key='minutes'
        role='time-picker-minutes'
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
          setOpen(open => ({ ...open, minute: false }))
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
    <Button type='secondary' size='small' onClick={() => onApply(value)} >Apply</Button>
    <Button type='default' size='small' onClick={() => onCancel()}>Cancel</Button>
  </UI.FooterWrapper>
}
