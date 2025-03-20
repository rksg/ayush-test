/* eslint-disable max-len */
import { useEffect, useState, useRef } from 'react'

import {
  useSelectionContainer
} from '@air/react-drag-to-select'
import { TypedLazyQueryTrigger } from '@reduxjs/toolkit/query/react'
import {
  ModalProps as AntdModalProps,
  Checkbox,
  Col,
  Form,
  Card,
  Row,
  Spin,
  Tooltip,
  FormInstance
} from 'antd'
import _           from 'lodash'
import moment      from 'moment'
import { useIntl } from 'react-intl'

import { ITimeZone, NetworkVenueScheduler, Scheduler }   from '@acx-ui/types'
import { getVenueTimeZone, transformTimezoneDifference } from '@acx-ui/utils'

import { Button }            from '../Button'
import { ScheduleTipsModal } from '../ScheduleTipsModal'

import * as UI      from './styledComponents'
import {
  dayIndex,
  genTimeTicks,
  shouldStartSelecting,
  onSelectionChange,
  onSelectionEnd
} from './utils'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { CheckboxValueType }   from 'antd/es/checkbox/Group'

interface ScheduleCardProps extends AntdModalProps {
  scheduler?: Scheduler
  type: 'ALWAYS_ON' | 'ALWAYS_OFF' | 'CUSTOM' | string
  venue?: {
    latitude: string,
    longitude: string,
    name?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyQuery?: TypedLazyQueryTrigger<any, any, any>
  localTimeZone?: boolean
  form: FormInstance
  fieldNamePath: string[]
  disabled: boolean
  readonly?: boolean
  timelineLabelTop?: boolean
  intervalUnit: 15 | 60
  loading: boolean
  title?: string
  isShowTips?: boolean
  isShowTimezone?: boolean
  prefix?: boolean
}

interface Schedule {
  key: string,
  value: string[]
}

interface ScheduleTimeTickProps {
  top: boolean
  showBorder: boolean
  index: number
  length: number
  timeTicks: string[]
  intervalUnit: 15 | 60
  intervalsCount: number
}

const ScheduleTimeTick: React.FC<ScheduleTimeTickProps> =
({ top, showBorder, index, length, timeTicks, intervalUnit, intervalsCount }) => {
  const timetickJSX = (<div style={{ width: '100%', height: '25px', marginLeft: '-30px' }}>
    {timeTicks.map((item: string, i: number) => {
      return (
        <UI.Timetick intervalunit={intervalUnit} key={`timetick_${i}`}>{item}</UI.Timetick>
      )
    })}
  </div>)
  const timetickborderJSX = ( <div style={{ width: '980px', height: '5px' }}>
    { Array((intervalsCount/2 + 1)).fill(0).map((_: number, i: number) => {
      return (<UI.Timetickborder intervalunit={intervalUnit} key={`timetick_div_${i}`} />)
    }) }
  </div>)

  if (top && index === 0) {
    return (<>{timetickJSX}{showBorder && timetickborderJSX}</>)
  } else if (!top && index === length - 1) {
    return (<>{showBorder && timetickborderJSX}{timetickJSX}</>)
  }
  return null
}

export const parseNetworkVenueScheduler = (scheduler: NetworkVenueScheduler) => {
  const updatedScheduler = { } as Scheduler
  Object.entries(_.omit(scheduler, 'type')).forEach(([key, value]) => {
    const selectedList = [] as string[]
    value.split('').forEach((item: string, i: number) => {
      if(item === '1'){
        selectedList.push(`${key}_${i}`)
      }
    })
    updatedScheduler[key] = selectedList as string[]
  })
  return updatedScheduler
}

export function ScheduleCard (props: ScheduleCardProps) {
  const { $t } = useIntl()
  const { scheduler, venue, disabled, readonly=false, form, fieldNamePath, lazyQuery: getTimezone,
    localTimeZone=false, isShowTips=true, isShowTimezone=true, timelineLabelTop= true,
    intervalUnit, prefix=true } = props
  const editabled = !disabled && !readonly

  const [scheduleList, setScheduleList] = useState<Schedule[]>([])
  const [checkedList, setCheckedList] = useState<CheckboxValueType[][]>([])
  const [indeterminate, setIndeterminate] = useState<boolean[]>([])
  const [checkAll, setCheckAll] = useState<boolean[]>([])
  const [timeTicks, setTimeTicks] = useState<string[]>([])
  const [timezone, setTimezone] = useState<ITimeZone>({
    dstOffset: 0,
    rawOffset: 0,
    timeZoneId: '',
    timeZoneName: ''
  })
  const [isModalOpen, setIsModalOpen] = useState(false)
  const selectedItems = useRef<string[]>([])
  const intervalsCount = 24 * 60 / intervalUnit
  const arrCheckedList = [...checkedList]
  const arrCheckAll = [...checkAll]
  const arrIndeterminate = [...indeterminate]

  const initialValues = (scheduler: Scheduler) => {
    if (props.type === 'ALWAYS_ON') {
      for (let daykey in dayIndex) {
        form.setFieldValue(fieldNamePath.concat(daykey),
          Array.from({ length: intervalsCount }, (_, i) => (prefix?`${daykey}_${i}`:`${i}`))
        )
        arrCheckAll[dayIndex[daykey]] = true
        setCheckAll(arrCheckAll)
      }
    } else if (scheduler){
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(scheduler).forEach(([key, value]) => {
        form.setFieldValue(fieldNamePath.concat(key), value)

        const index = dayIndex[key]
        arrCheckedList[index] = value
        arrCheckAll[index] = value.length === intervalsCount
        arrIndeterminate[index] = !!value.length && value.length < intervalsCount
      })
      setCheckedList(arrCheckedList)
      setCheckAll(arrCheckAll)
      setIndeterminate(arrIndeterminate)
    }
  }

  const { DragSelection } = useSelectionContainer({
    shouldStartSelecting,
    onSelectionChange: (box) => onSelectionChange(box, disabled, selectedItems, intervalsCount),
    onSelectionEnd: () => {
      if (selectedItems.current.length === 0) return
      const [checkAllItems, indeterminateItems] = onSelectionEnd(fieldNamePath, prefix, selectedItems.current, intervalsCount, form, arrCheckAll, arrIndeterminate)
      setCheckAll(checkAllItems)
      setIndeterminate(indeterminateItems)
      selectedItems.current = []
    },
    isEnabled: true
  })

  useEffect(() => {
    const initTimeZone = async (venueLatitude: string, venueLongitude: string) => {
      const timeZone = getTimezone ?
        await getTimezone({ params: { lat: venueLatitude, lng: venueLongitude } }).unwrap() :
        getVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      setTimezone(timeZone)
    }

    const initLocalTimeZone = () => {
      setTimezone({
        dstOffset: 0,
        rawOffset: moment().utcOffset()*60,
        timeZoneId: '',
        timeZoneName: moment().zoneAbbr()
      })
    }

    if(venue || localTimeZone){
      setScheduleList(
        Object.keys(dayIndex).map((item: string) => {
          return {
            key: item,
            value: Array.from({ length: intervalsCount }, (_, i) => (prefix?`${item}_${i}`:`${i}`))
          }
        })
      )

      if (localTimeZone) {
        initLocalTimeZone()
      } else if (venue) {
        initTimeZone(venue.latitude.toString(), venue.longitude.toString())
      }
      _genTimeTicks()
    }
  }, [form, venue, localTimeZone, intervalsCount])

  useEffect(() => {
    if (disabled || !scheduler) {
      for (let daykey in dayIndex) {
        form.setFieldValue(fieldNamePath.concat(daykey),
          Array.from({ length: intervalsCount }, (_, i) => (prefix?`${daykey}_${i}`:`${i}`) )
        )
        arrCheckAll[dayIndex[daykey]] = true
        setCheckAll(arrCheckAll)
        arrIndeterminate[dayIndex[daykey]] = false
        setIndeterminate(arrIndeterminate)
      }
    } else {
      initialValues(scheduler as Scheduler)
    }
  }, [disabled])

  const convertToTimeFromSlotIndex = (index: number): string => {
    const unit = 60 / intervalUnit
    let hour = Math.floor(index / unit)
    const min = (index % unit) * intervalUnit
    const minString = (min === 0) ? '00' : min.toString()
    const latinAbbr = (hour < 12)? 'AM' : 'PM'
    if (hour === 0) { // 12 AM
      hour = 12
    } else if (hour > 12) {
      hour = hour - 12
    }
    return `${hour.toString()}:${minString} ${latinAbbr}`
  }
  const _genTimeTicks = () => {
    setTimeTicks(genTimeTicks(intervalUnit))
  }

  const onChange = (list: CheckboxValueType[], key:string) => {
    const index = dayIndex[key]
    const arrCheckedList = [...checkedList]
    arrCheckedList[index] = list
    setCheckedList(arrCheckedList)

    const arrCheckAll = [...checkAll]
    if (list.length === 0) {
      arrCheckAll[index] = false
      setCheckAll(arrCheckAll)
    } else if(list.length === intervalsCount){
      arrCheckAll[index] = true
      setCheckAll(arrCheckAll)
    }

    const arrIndeterminate = [...indeterminate]
    arrIndeterminate[index] = !!arrCheckedList[index].length && arrCheckedList[index].length < intervalsCount
    setIndeterminate(arrIndeterminate)
  }

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const index = dayIndex[e.target.value]
    if(e.target.checked){
      form.setFieldValue(fieldNamePath.concat(e.target.value),
        Array.from({ length: intervalsCount }, (_, i) => (prefix?`${e.target.value}_${i}`:`${i}`) ))
    }else{
      form.setFieldValue(fieldNamePath.concat(e.target.value), [])
    }
    const arrCheckAll = [...checkAll]
    arrCheckAll[index] = e.target.checked
    setCheckAll(arrCheckAll)

    const arrIndeterminate = [...indeterminate]
    arrIndeterminate[index] = false
    setIndeterminate(arrIndeterminate)
  }

  return (
    <>
      <Card type='inner'
        title={props.title && <>
          <span>{props.title}</span>
          {isShowTips &&
          (<Button type='link' onClick={() => setIsModalOpen(true)}>
            <UI.TipSpan>{$t({ defaultMessage: 'See tips' })}</UI.TipSpan>
          </Button>)}
        </>}
        extra={isShowTimezone && (<>
          {$t({ defaultMessage: '<VenueSingular></VenueSingular> time zone:' })} <b>
            {transformTimezoneDifference(timezone.dstOffset+timezone.rawOffset)} ({timezone.timeZoneName})
          </b>
        </>)}
        style={{
          pointerEvents: ( !editabled ? 'none' : 'auto' ),
          opacity: ( !editabled ? '0.5' : '1.0' ) ,
          minWidth: (intervalUnit === 15 ? '1165px' : '610px') }}
      >
        <Spin spinning={props.loading}>
          <div className='selectable-area'>
            {scheduleList && scheduleList.map((item, i) => (
              <Row key={`row2_${item.key}_${i}`} wrap={false}>
                <Col flex={intervalUnit === 15 ? '103px' : '60px'} key={`col2_${item.key}_${i}`}>
                  <Checkbox
                    data-testid={`checkbox_${item.key}`}
                    indeterminate={indeterminate[i]}
                    onChange={onCheckAllChange}
                    checked={checkAll[i]}
                    key={`checkbox_${item.key}`}
                    value={item.key}
                    style={{ marginTop: timelineLabelTop && i === 0 ? '35px': '5px', paddingRight: '5px' }}
                    disabled={!editabled}
                  />
                  <UI.DaySpan>{$t({ defaultMessage: '{day}' }, { day: item.key })}</UI.DaySpan>
                </Col>
                <Col flex='auto' key={`col2_${item.key}`}>
                  {timelineLabelTop && <ScheduleTimeTick
                    key={`scheduleTimeTick_${i}_top`}
                    top={timelineLabelTop}
                    showBorder={intervalUnit === 15}
                    index={i}
                    length={scheduleList.length}
                    timeTicks={timeTicks}
                    intervalUnit={intervalUnit}
                    intervalsCount={intervalsCount}
                  />}
                  <Form.Item
                    key={`checkboxGroup_form_${item.key}`}
                    name={fieldNamePath.concat(item.key)}
                    children={
                      <UI.CheckboxGroup
                        intervalunit={intervalUnit}
                        key={`checkboxGroup_${item.key}`}
                        value={checkedList[i]}
                        onChange={(list) => onChange(list, item.key)}
                        options={item.value.map((timeslot, i) => ({
                          label: <Tooltip
                            title={`${item.key}-${convertToTimeFromSlotIndex(i)}`}
                            className='channels'
                          >
                            <div
                              id={`${item.key}_${i}`}
                              data-testid={`${item.key}_${i}`}
                              style={{ width: intervalUnit === 15 ? '10px' : '40px', height: '32px' }}
                            ></div>
                          </Tooltip>,
                          value: timeslot
                        }))}
                        disabled={!editabled}
                      />
                    }
                  />
                  <DragSelection />
                  {!timelineLabelTop && <ScheduleTimeTick
                    key={`scheduleTimeTick_${i}_bottom`}
                    top={timelineLabelTop}
                    showBorder={intervalUnit === 15}
                    index={i}
                    length={scheduleList.length}
                    timeTicks={timeTicks}
                    intervalUnit={intervalUnit}
                    intervalsCount={intervalsCount}
                  />}
                  {localTimeZone && i === scheduleList.length -1 &&
                  <div style={{ width: '100%', height: '25px' }}>
                    <UI.LocalTimeZone key={'schedule_localtime'}>
                      {$t({ defaultMessage: 'Local time ({timeOffset})' },
                        { timeOffset: transformTimezoneDifference(timezone.dstOffset+timezone.rawOffset) })}
                    </UI.LocalTimeZone>
                  </div>}

                </Col>
              </Row>
            ))
            }
          </div>
        </Spin>
      </Card>
      {isModalOpen &&
      <ScheduleTipsModal isModalOpen={isModalOpen} onOK={() => setIsModalOpen(false)} />}
    </>
  )
}
