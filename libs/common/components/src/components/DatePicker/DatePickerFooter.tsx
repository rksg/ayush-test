import  React,{ useCallback } from 'react'

import { TimePicker, Row, Col }     from 'antd'
import { range as timepickerRange } from 'lodash'

import { ArrowDown } from '@acx-ui/icons'

import { Button } from '../Button'

import { DateRangeType, dateFormat,dateWithTimeFormat } from '.'


import type { Moment  } from 'moment'
interface DatePickerFooterProps {
  showTimePicker?: boolean;
  setRange: React.Dispatch<React.SetStateAction<DateRangeType>>;
  range: DateRangeType;
  setIscalenderOpen: React.Dispatch<React.SetStateAction<boolean>>;
  defaultValue: DateRangeType,
  onDateApply:Function
};
 type DisabledTimes = {
  disabledHours?: () => number[];
  disabledMinutes?: (hour: number) => number[];
  disabledSeconds?: (hour: number, minute: number) => number[];
}
const styles = {
  timePicker: {
    width: '50px',
    height: '24px',
    padding: '4px'
  },
  row: { marginLeft: 24 },
  timePickerCol2: { marginLeft: 3, marginRight: 3 },
  timePickerCol3: { marginLeft: 17, marginRight: 17 },
  button: { height: '24px',width: '56px',fontSize: '12px' }
}
const timePickerConfig = [
  { id: 1, range: 'startDate', value: 'hour', format: 'HH', offset: 6, hasSemiColon: true },
  { id: 2, range: 'startDate', value: 'minutes', format: 'mm', offset: 0, hasHyphen: true },
  { id: 3, range: 'endDate', value: 'hour', format: 'HH', offset: 0, hasSemiColon: true },
  { id: 4, range: 'endDate', value: 'minutes', format: 'mm', offset: 0 }
]

const getCustomisedDate = (date: Moment | null, showTimePicker?: boolean ) =>
  showTimePicker ? date?.format(dateWithTimeFormat) : date?.format(dateFormat)


const defaultselectionForDisabledDates = {  
  disabledHours: () =>[],
  disabledMinutes: () => []
}
export const DatePickerFooter = ({ showTimePicker, range, defaultValue, 
  setRange, setIscalenderOpen, onDateApply }: DatePickerFooterProps) => {
    
  const onButtonClick = (type: string) =>{
    if(type === 'cancel')
      setRange(defaultValue)
    else   
      onDateApply(range)  
    setIscalenderOpen(false)
  }
  const onTimePickerSelect = (config : typeof timePickerConfig[number], time: Moment) => {
    if(config.range === 'startDate' && time && time.isAfter(range.endDate)){
      setRange({ startDate: time, endDate: time })
    }
    else {
      setRange({ ...range, [config.range]: time })
    }
  }
  const disabledDateTime = useCallback(() : DisabledTimes=>{
    if(range.startDate && range.endDate && range.startDate.isSame(range.endDate, 'day'))
    {
      return {  
        disabledHours: () =>timepickerRange(0, range.startDate?.hour()),
        disabledMinutes: () => timepickerRange(0, range.startDate?.minute())
      }
    }
    return defaultselectionForDisabledDates
  },[range])

  return <>
    {showTimePicker &&
    <Row style={styles.row}>
      {timePickerConfig.map((config)=>
        <React.Fragment key={config.id}>
          <Col 
            span={2.5}
            offset={config.offset}
          >
            <TimePicker
              role='time-picker'
              showNow={false}
              format={config.format}
              popupClassName='acx-calender'
              placeholder=''
              suffixIcon={<ArrowDown/>}
              allowClear={false}
              style={styles.timePicker}
              getPopupContainer={(node: HTMLElement) => node}
              onSelect={(time) => onTimePickerSelect(config, time)}
              value={range[config.range as keyof DateRangeType]}
              disabled={!range[config.range as keyof DateRangeType]}
              disabledTime={config.range === 'endDate' 
                ? disabledDateTime 
                : () => defaultselectionForDisabledDates} 
            />
          </Col>
          {config.hasSemiColon &&
          <Col style={styles.timePickerCol2}>:
          </Col>}
          {config.hasHyphen &&
          <Col style={styles.timePickerCol3}>-
          </Col>}
        </React.Fragment>
      )}
    </Row>}
    <Row className='calender-range-apply-row'>
      <Col role='display-date-range'
        span={showTimePicker ? 12 : 10}
        offset={showTimePicker ? 6 : 8}>
        {`${getCustomisedDate(range?.startDate, showTimePicker) || ''}
        - ${getCustomisedDate(range?.endDate, showTimePicker) || ''}`}
      </Col>
      <Col span={3} style={{ lineHeight: 'normal' }}>
        <Button onClick={()=>onButtonClick('cancel')}
          style={styles.button}>Cancel</Button>
      </Col>
      <Col span={3} style={{ lineHeight: 'normal' }}>
        <Button type={'primary'}
          style={styles.button}
          onClick={()=>onButtonClick('apply')}>Apply</Button>
      </Col>
    </Row>
  </>
}

