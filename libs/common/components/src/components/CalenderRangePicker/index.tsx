
import  { useState } from 'react'

import { TimePicker, Row, Col } from 'antd'
import { DatePicker }           from 'antd'
import moment                   from 'moment'

import { defaultRanges } from '@acx-ui/analytics/utils'
import { DateRange }     from '@acx-ui/analytics/utils'
import { ArrowDown }     from '@acx-ui/icons'

import { Button } from '../Button'

import * as UI from './styledComponents'

import type { Moment } from 'moment'


const styles = {
  timePicker: {
    width: '50px',
    height: '24px',
    padding: '4px',
    background: 'white'
  },
  timePickerCol: { marginLeft: 12, marginRight: 12 },
  button: { height: '24px',width: '56px' },
  rangePicker: { width: '100%' }
}

type DateRangeType = { 'start': moment.Moment | null, 'end' : moment.Moment | null}
type RangeValue = [Moment | null, Moment | null] | null
interface CalenderRangePickerProps {
  showTimePicker?: boolean;
  enableDates?: [Moment, Moment];
  rangeOptions?: [DateRange,DateRange];
  showRanges?: boolean;
  selectedRange? : DateRangeType
};
interface CalenderFooterProps {
  showTimePicker?: boolean;
  setRange: React.Dispatch<React.SetStateAction<DateRangeType>>;
  range: DateRangeType;
  setIscalenderOpen: React.Dispatch<React.SetStateAction<boolean>>;
};
const { RangePicker } = DatePicker
const timePickerConfig = [
  { id: 1, range: 'start', value: 'hour', format: 'HH', offset: 6, hasSemiColon: true },
  { id: 2, range: 'start', value: 'minutes', format: 'mm', offset: 0, hasHyphen: true },
  { id: 3, range: 'end', value: 'hour', format: 'HH', offset: 0, hasSemiColon: true },
  { id: 4, range: 'end', value: 'minutes', format: 'mm', offset: 0 }
]

const CalenderFooter: React.FC<CalenderFooterProps> = 
({ showTimePicker, range, setRange, setIscalenderOpen }) => {

  const onButtonClick = (type: string) =>{
    if(type === 'cancel')
      setRange({ start: moment().subtract(6, 'days').seconds(0),
        end: moment().seconds(0) })
    setIscalenderOpen(false)
  }
  const onTimePickerSelect = (config : typeof timePickerConfig[number], time: Moment) => 
    setRange({ ...range, [config.range]:
    (range[config.range as keyof DateRangeType] as Moment)
      .set(config.value as moment.unitOfTime.All, 
        time.get(config.value as moment.unitOfTime.All)) })
  const getCustomisedDate = (date: Moment | null, showTimePicker?: boolean ) => 
    showTimePicker ? date?.format('DD/MM/YYYY HH:mm') : date?.format('DD/MM/YYYY')
  
  return <>
    {showTimePicker &&
    <Row >
      {timePickerConfig.map((config)=>
        <>
          <Col key = {config.id}
            span={2}
            offset={config.offset} 
          >
            <TimePicker
              showNow={false}
              format={config.format}
              popupClassName='acx-calender'
              placeholder = ''
              suffixIcon= {<ArrowDown/>}
              allowClear = {false}
              style = {styles.timePicker}
              getPopupContainer={(node: HTMLElement) => 
                node.parentElement || node
              }
              onSelect={(time) => onTimePickerSelect(config, time)}
              value={range[config.range as keyof DateRangeType]}
            /> 
          </Col>
          {config.hasSemiColon && 
          <Col style ={styles.timePickerCol}> : </Col>}
          {config.hasHyphen && 
          <Col style ={styles.timePickerCol}> - </Col>} 
        </>
      )}
    </Row>}
    <Row className='calender-range-apply-row'>
      <Col span={showTimePicker ? 12 : 10} offset={showTimePicker ? 6 : 8}>
        {`${getCustomisedDate(range?.start, showTimePicker)}
        - ${getCustomisedDate(range?.end, showTimePicker)}`}</Col>
      <Col span={3} style = {{ lineHeight: 'normal' }}><Button onClick={()=>onButtonClick('cancel')}
        style = {styles.button}>Cancel</Button></Col>
      <Col span={3} style = {{ lineHeight: 'normal' }}><Button type = {'primary'}
        style = {styles.button}
        onClick={()=>onButtonClick('apply')}>Apply</Button></Col>
    </Row>
  </>
}

export const CalenderRangePicker: React.FC<CalenderRangePickerProps> = 
({ showTimePicker, enableDates, rangeOptions , showRanges,selectedRange, ...props }) => {

  const defaultSelection = 
  { start: moment().subtract(1, 'days').seconds(0),end: moment().seconds(0) }
  const [range, setRange] = useState<DateRangeType>(
    selectedRange? selectedRange:defaultSelection)
  const [isCalenderOpen, setIscalenderOpen] = useState<boolean>(false)
  const disabledDate = (current: Moment) => {
    if (!enableDates) {
      return false
    }
    return enableDates[0] >= current ||
    enableDates[1] < current
  }
  return ( 
    <UI.Wrapper>
      <RangePicker   
        style={styles.rangePicker}
        ranges={showRanges && defaultRanges(rangeOptions)}
        placement = 'bottomRight'
        disabledDate={disabledDate}
        className = 'acx-range-picker'
        dropdownClassName='acx-range-picker-popup'
        open = {isCalenderOpen}
        onClick = {() => setIscalenderOpen (true)}
        getPopupContainer={(triggerNode: HTMLElement) => 
          triggerNode.parentElement || triggerNode
        }
        onCalendarChange={(values: RangeValue) => {
          setRange({ start: values?.at(0) || null ,end: values?.at(1) || null })
        }}
        renderExtraFooter={() => 
          <CalenderFooter 
            showTimePicker = {showTimePicker} 
            range = {range}
            setRange = {setRange}
            setIscalenderOpen = {setIscalenderOpen}/>}
        {...props}
      />
    </UI.Wrapper>
  )
}
