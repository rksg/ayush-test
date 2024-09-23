/* eslint-disable max-len */
import { useEffect, useState, useMemo } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import { LazyQueryTrigger } from '@reduxjs/toolkit/dist/query/react/buildHooks'
import { QueryDefinition }  from '@reduxjs/toolkit/query'
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

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { CheckboxValueType }   from 'antd/es/checkbox/Group'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DefaultQueryDefinition<ResultType> = QueryDefinition<any, any, any, ResultType>

interface ScheduleCardProps extends AntdModalProps {
  scheduler?: Scheduler
  type: 'ALWAYS_ON' | 'ALWAYS_OFF' | 'CUSTOM' | string
  venue?: {
    latitude: string,
    longitude: string,
    name?: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyQuery?: LazyQueryTrigger<DefaultQueryDefinition<any>>
  localTimeZone?: boolean
  form: FormInstance
  fieldNamePath: string[]
  disabled: boolean
  timelineLabelTop?: boolean
  intervalUnit: 15 | 60 | number
  is12H?: boolean
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

interface indexDayType {
  [key: string]: number
}

const dayIndex: indexDayType = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6
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

const parseNonePrefixScheduler = (key:string, values: string[]) => {
  return values.map((item: string) => `${key}_${item}`)
}

export function ScheduleCard (props: ScheduleCardProps) {
  const { $t } = useIntl()
  const { scheduler, venue, disabled, form, fieldNamePath, lazyQuery: getTimezone, localTimeZone=false,
    isShowTips=true, isShowTimezone=true, timelineLabelTop= true, intervalUnit, is12H=true, prefix=true } = props

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
  const intervalsCount = 24 * 60 / intervalUnit

  const arrCheckedList = [...checkedList]
  const arrCheckAll = [...checkAll]
  const arrIndeterminate = [...indeterminate]

  const initialValues = (scheduler: Scheduler) => {
    if (props.type === 'ALWAYS_ON') {
      for (let daykey in dayIndex) {
        form.setFieldValue(fieldNamePath.concat(daykey), Array.from({ length: intervalsCount }, (_, i) => (prefix?`${daykey}_${i}`:`${i}`)))
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
          return { key: item, value: Array.from({ length: intervalsCount }, (_, i) => (prefix?`${item}_${i}`:`${i}`)) }
        })
      )

      if (localTimeZone) {
        initLocalTimeZone()
      } else if (venue) {
        initTimeZone(venue.latitude.toString(), venue.longitude.toString())
      }
      _genTimeTicks()
    }
  }, [form, venue, localTimeZone])

  useEffect(() => {
    if (disabled || !scheduler) {
      for (let daykey in dayIndex) {
        form.setFieldValue(fieldNamePath.concat(daykey), Array.from({ length: intervalsCount }, (_, i) => (prefix?`${daykey}_${i}`:`${i}`) ))
        arrCheckAll[dayIndex[daykey]] = true
        setCheckAll(arrCheckAll)
        arrIndeterminate[dayIndex[daykey]] = false
        setIndeterminate(arrIndeterminate)
      }
    } else {
      initialValues(scheduler as Scheduler)
    }
  }, [disabled, scheduler])

  const convertToTimeFromSlotIndex = (index: number): string => {
    const unit = 60 / intervalUnit
    let hour = Math.floor(index / unit)
    const min = (index % unit) * intervalUnit
    const minString = (min === 0) ? '00' : min.toString()
    if (is12H) {
      const latinAbbr = (hour < 12)? 'AM' : 'PM'
      if (hour === 0) { // 12 AM
        hour = 12
      } else if (hour > 12) {
        hour = hour - 12
      }
      return `${hour.toString()}:${minString} ${latinAbbr}`
    }
    return `${hour.toString()}:${minString}`
  }
  const _genTimeTicks = () => {
    const timeticks: string[] = []
    if (is12H) {
      timeticks.push('Midnight')
      for (let i = 1; i < 6; i++) {
        timeticks.push((i * 2) + ' AM')
      }
      timeticks.push('Noon')
      for (let i = 1; i < 6; i++) {
        timeticks.push((i * 2) + ' PM')
      }
      timeticks.push('Midnight')
      setTimeTicks(timeticks)
    } else {
      for (let i = 0; i <= 8; i++) {
        timeticks.push(`${i*3}`)
      }
      setTimeTicks(timeticks)
    }
  }

  const onChange = (list: CheckboxValueType[], key:string) => {
    let index = dayIndex[key]
    const arrCheckedList = [...checkedList]
    arrCheckedList[index] = list
    setCheckedList(arrCheckedList)

    const arrIndeterminate = [...indeterminate]
    arrIndeterminate[index] = !!arrCheckedList[index].length && arrCheckedList[index].length < intervalsCount
    setIndeterminate(arrIndeterminate)
  }

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const index = dayIndex[e.target.value]
    if(e.target.checked){
      form.setFieldValue(fieldNamePath.concat(e.target.value), Array.from({ length: intervalsCount }, (_, i) => (prefix?`${e.target.value}_${i}`:`${i}`) ))
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

  let selectedItems: string[] = []
  const memoUniqSchedule = useMemo(() =>
    (schedule: string[], selectedItems: string[], daykey: string) => {
      return _.uniq(_.xor(schedule, selectedItems.filter((item: string) => item.indexOf(daykey) > -1))) || []
    }, [])

  const { DragSelection } = useSelectionContainer({
    shouldStartSelecting: (target) => {
      if (target instanceof HTMLElement) {
        let el = target
        while (el.parentElement && !el.dataset.disableselect) {
          el = el.parentElement
        }
        return el.dataset.disableselect !== 'true'
      }
      return true
    },
    onSelectionChange: (box) => {
      selectedItems = []
      if(disabled){
        return
      }
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      for (let daykey in dayIndex) {
        // eslint-disable-next-line no-loop-func
        Array.from({ length: intervalsCount }, (_, i) => {
          const itemKey = `${daykey}_${i}`
          const item = document.getElementById(itemKey)
          if(item){
            const { left, top, width, height } = item.getBoundingClientRect()
            const boxItem = { left, top, width, height }
            if (boxesIntersect(scrollAwareBox, boxItem)) {
              selectedItems.push(itemKey)
            }
          }
          return null
        })
      }
    },
    onSelectionEnd: () => {
      selectedItems = _.uniq(selectedItems)
      for (let daykey in dayIndex) {
        const daySchedule = form.getFieldValue(fieldNamePath.concat(daykey)) ?? []
        // const schedule = daySchedule
        const schedule = prefix ? daySchedule : parseNonePrefixScheduler(daykey, daySchedule)
        if(selectedItems.filter((item: string) => item.indexOf(daykey) > -1)){
          let uniqSchedule = memoUniqSchedule(schedule, selectedItems, daykey)
          form.setFieldValue(fieldNamePath.concat(daykey), uniqSchedule.map((item: string) => prefix?item:`${item.split('_')[1]}`))
          if(uniqSchedule && uniqSchedule.length === intervalsCount){
            arrCheckAll[dayIndex[daykey]] = true
            arrIndeterminate[dayIndex[daykey]] = false
          }else if(uniqSchedule && uniqSchedule.length > 0 && uniqSchedule.length < intervalsCount){
            arrIndeterminate[dayIndex[daykey]] = true
          }else{
            arrCheckAll[dayIndex[daykey]] = false
            arrIndeterminate[dayIndex[daykey]] = false
          }
        }
      }
      setCheckAll(arrCheckAll)
      setIndeterminate(arrIndeterminate)
    },
    isEnabled: true
  })

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
        style={{ pointerEvents: ( disabled ? 'none' : 'auto' ), opacity: ( disabled ? '0.5' : '1.0' ) }}
      >
        <Spin spinning={props.loading}>
          <div className='selectable-area'>
            {scheduleList && scheduleList.map((item, i) => (
              <Row gutter={24} key={`row2_${item.key}_${i}`}>
                <Col span={intervalUnit === 15?2:4} key={`col2_${item.key}_${i}`}>
                  <Checkbox
                    data-testid={`checkbox_${item.key}`}
                    indeterminate={indeterminate[i]}
                    onChange={onCheckAllChange}
                    checked={checkAll[i]}
                    key={`checkbox_${item.key}`}
                    value={item.key}
                    style={{ marginTop: timelineLabelTop && i === 0 ? '35px': '5px', paddingRight: '5px' }}
                    disabled={disabled}
                  />
                  <UI.DaySpan>{$t({ defaultMessage: '{day}' }, { day: item.key })}</UI.DaySpan>
                </Col>
                <Col span={intervalUnit === 15?22:20} key={`col2_${item.key}`}>
                  { timelineLabelTop && i === 0 &&
                          <div style={{ width: '100%', height: '25px', marginLeft: intervalUnit === 15 ? '-30px' : '15px' }}>
                            {timeTicks.map((item: string, i: number) => {
                              return (
                                <UI.Timetick intervalunit={intervalUnit} key={`timetick_${i}`}>{item}</UI.Timetick>
                              )
                            })}
                          </div>
                  }
                  { i === 0 && intervalUnit ===15 &&
                          <div style={{ width: '980px', height: '5px' }}>
                            { Array((intervalsCount/2 + 1)).fill(0).map((_: number, i: number) => {
                              return (<UI.Timetickborder intervalunit={intervalUnit} key={`timetick_div_${i}`} />)
                            }) }
                          </div>}
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
                        disabled={disabled}
                      />
                    }
                  />
                  <DragSelection />
                  { !timelineLabelTop && i === scheduleList.length -1 &&
                          <div style={{ width: '100%', height: '25px', marginLeft: intervalUnit === 15 ? '-30px' : '0px' }}>
                            {timeTicks.map((item: string, i: number) => {
                              return (
                                <UI.Timetick intervalunit={intervalUnit} key={`timetick_${i}`}>{item}</UI.Timetick>
                              )
                            })}
                          </div>
                  }
                  {localTimeZone && i === scheduleList.length -1 &&
                  <div style={{ width: '100%', height: '25px' }}>
                    <UI.LocalTimeZone intervalunit={intervalUnit} key={'localtime'}>
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
