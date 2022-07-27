import React, { useCallback } from 'react'

import { range as timepickerRange } from 'lodash'

import { CaretDownSolid }             from '@acx-ui/icons'
import { dateTimeFormats, DateRange } from '@acx-ui/utils'

import { Button } from '../Button'

import * as UI from './styledComponents'

import { DateRangeType } from '.'

import type { Moment } from 'moment'

interface DatePickerFooterProps {
  showTimePicker?: boolean;
  setRange: React.Dispatch<React.SetStateAction<DateRangeType>>;
  range: DateRangeType;
  setIsCalenderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValue: DateRangeType;
  onDateApply: Function;
  rangeOptions?: DateRange[];
  selectionType: DateRange;
}
type DisabledTimes = {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}
const { dateFormat, dateTimeFormat } = dateTimeFormats

const timePickerConfig = [
  { id: 1, range: 'startDate', value: 'hour', format: 'HH', offset: 6, hasColon: true },
  { id: 2, range: 'startDate', value: 'minutes', format: 'mm', offset: 0, hasHyphen: true },
  { id: 3, range: 'endDate', value: 'hour', format: 'HH', offset: 0, hasColon: true },
  { id: 4, range: 'endDate', value: 'minutes', format: 'mm', offset: 0 }
]

const getCustomisedDate = (date: Moment | null, showTimePicker?: boolean) =>
  showTimePicker ? date?.format(dateTimeFormat) : date?.format(dateFormat)

const defaultselectionForDisabledDates = {
  disabledHours: () => [],
  disabledMinutes: () => []
}
export const DatePickerFooter = ({
  showTimePicker,
  range,
  defaultValue,
  setRange,
  setIsCalenderOpen,
  onDateApply,
  rangeOptions,
  selectionType
}: DatePickerFooterProps) => {
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
    setIsCalenderOpen(false)
  }
  const onTimePickerSelect = (
    config: typeof timePickerConfig[number],
    time: Moment
  ) => {
    if (config.range === 'startDate' && time && time.isAfter(range.endDate)) {
      setRange({ startDate: time, endDate: time })
    } else {
      setRange({ ...range, [config.range]: time })
    }
  }
  const disabledDateTime = useCallback((): DisabledTimes => {
    if (
      range.startDate &&
      range.endDate &&
      range.startDate.isSame(range.endDate, 'day')
    ) {
      return {
        disabledHours: () => timepickerRange(0, range.startDate?.hour()),
        disabledMinutes: () => timepickerRange(0, range.startDate?.minute())
      }
    }
    return defaultselectionForDisabledDates
  }, [range])
  console.log(rangeOptions)
  console.log(selectionType)

  return <>
    {showTimePicker &&
    <UI.TimePickerRow
      rangeOptions={rangeOptions}
      selectionType={selectionType}>
      {timePickerConfig.map((config)=>
        <React.Fragment key={config.id}>
          <UI.TimePickerWrapper
            role='time-picker'
            showNow={false}
            format={config.format}
            placeholder=''
            suffixIcon={<CaretDownSolid />}
            allowClear={false}
            getPopupContainer={(node: HTMLElement) => node}
            onSelect={(time) => onTimePickerSelect(config, time)}
            value={range[config.range as keyof DateRangeType]}
            disabled={!range[config.range as keyof DateRangeType]}
            disabledTime={config.range === 'endDate'
              ? disabledDateTime
              : () => defaultselectionForDisabledDates}
          />
          {config.hasColon &&
          <UI.TimePickerColon>:
          </UI.TimePickerColon>}
          {config.hasHyphen &&
          <UI.TimePickerHyphen>-
          </UI.TimePickerHyphen>}
        </React.Fragment>
      )}
    </UI.TimePickerRow>}
    <UI.RangeApplyRow>
      <UI.SelectedRange role='display-date-range'>
        {`${getCustomisedDate(range?.startDate, showTimePicker) || ''}
        - ${getCustomisedDate(range?.endDate, showTimePicker) || ''}`}
      </UI.SelectedRange>
      <UI.Buttons>
        <Button onClick={() => onButtonClick('cancel')}
          size={'small'}>Cancel</Button>
        <Button type={'secondary'}
          size={'small'}
          onClick={() => onButtonClick('apply')}>Apply</Button>
      </UI.Buttons>
    </UI.RangeApplyRow>
  </>
}
