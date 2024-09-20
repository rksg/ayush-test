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
import { useIntl } from 'react-intl'

import { ITimeZone, Scheduler }                          from '@acx-ui/types'
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
  venue?: {
    latitude: string,
    longitude: string,
    name: string
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lazyQuery?: LazyQueryTrigger<DefaultQueryDefinition<any>>
  form: FormInstance
  fieldName: string
  disabled: boolean
  loading: boolean,
  title?: string
  isShowTips?: boolean
  isShowTimezone?: boolean
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

export function ScheduleCard (props: ScheduleCardProps) {
  const { $t } = useIntl()
  const { scheduler, venue, disabled, form, fieldName, lazyQuery: getTimezone } = props

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

  const arrCheckedList = [...checkedList]
  const arrCheckAll = [...checkAll]
  const arrIndeterminate = [...indeterminate]

  const initialValues = (scheduler: Scheduler) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: { [key: string]: any } = scheduler
    for (let key in map) {
      if(key === 'type'){
        if(map[key] === 'ALWAYS_ON'){
          for (let daykey in dayIndex) {
            form.setFieldValue([fieldName, daykey], Array.from({ length: 96 }, (_, i) => `${daykey}_${i}` ))
            arrCheckAll[dayIndex[daykey]] = true
            setCheckAll(arrCheckAll)
          }
        }
        continue
      } else {
        const list = map[key].split('').map((item: string, i: string) => `${key}_${i}`)
        const selectedList = map[key].split('').map(function (item: string, i: string) {
          if(item === '1'){
            return `${key}_${i}`
          }else{
            return false
          }
        }).filter(Boolean)
        form.setFieldValue([fieldName, key], selectedList)

        const index = dayIndex[key]
        arrCheckedList[index] = selectedList
        setCheckedList(arrCheckedList)

        arrCheckAll[index] = selectedList.length === 96
        setCheckAll(arrCheckAll)

        arrIndeterminate[index] = !!selectedList.length && selectedList.length < list.length
        setIndeterminate(arrIndeterminate)
      }
    }
  }

  useEffect(() => {
    const initTimeZone = async (venueLatitude: string, venueLongitude: string) => {
      const timeZone = getTimezone ?
        await getTimezone({ params: { lat: venueLatitude, lng: venueLongitude } }).unwrap() :
        getVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      setTimezone(timeZone)
    }

    if(scheduler){
      setScheduleList(
        Object.keys(dayIndex).map((item: string) => {
          return { key: item, value: Array.from({ length: 96 }, (_, i) => `${item}_${i}`) }
        })
      )

      venue && initTimeZone(venue.latitude.toString(), venue.longitude.toString())
      _genTimeTicks()
    }
  }, [form, scheduler])

  useEffect(() => {
    if (disabled) {
      for (let daykey in dayIndex) {
        form.setFieldValue([fieldName, daykey], Array.from({ length: 96 }, (_, i) => `${daykey}_${i}` ))
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
    let hour = Math.floor(index / 4)
    const min = (index % 4) * 15
    const latinAbbr = (hour < 12)? 'AM' : 'PM'

    if (hour === 0) { // 12 AM
      hour = 12
    } else if (hour > 12) {
      hour = hour - 12
    }

    const minString = (min === 0) ? '00' : min.toString()

    return `${hour.toString()}:${minString} ${latinAbbr}`
  }
  const _genTimeTicks = () => {
    const timeticks: string[] = []
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
  }

  const onChange = (list: CheckboxValueType[]) => {
    let index = dayIndex['mon']
    if(typeof list[0] === 'string'){
      index = dayIndex[list[0].split('_')[0]]
    }
    const arrCheckedList = [...checkedList]
    arrCheckedList[index] = list
    setCheckedList(arrCheckedList)

    const arrIndeterminate = [...indeterminate]
    arrIndeterminate[index] = !!arrCheckedList[index].length && arrCheckedList[index].length < scheduleList[index].value.length
    setIndeterminate(arrIndeterminate)
  }

  const onCheckAllChange = (e: CheckboxChangeEvent) => {
    const index = dayIndex[e.target.value]
    if(e.target.checked){
      form.setFieldValue([fieldName, e.target.value], Array.from({ length: 96 }, (_, i) => `${e.target.value}_${i}` ))
    }else{
      form.setFieldValue([fieldName, e.target.value], [])
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
        Array.from({ length: 96 }, (_, i) => {
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
        const schedule = form.getFieldValue([fieldName, daykey]) || []
        if(selectedItems.filter((item: string) => item.indexOf(daykey) > -1)){
          let uniqSchedule = memoUniqSchedule(schedule, selectedItems, daykey)

          form.setFieldValue([fieldName, daykey], uniqSchedule)
          if(uniqSchedule && uniqSchedule.length === 96){
            arrCheckAll[dayIndex[daykey]] = true
            setCheckAll(arrCheckAll)
            arrIndeterminate[dayIndex[daykey]] = false
            setIndeterminate(arrIndeterminate)
          }else if(uniqSchedule && uniqSchedule.length > 0 && uniqSchedule.length < 96){
            arrIndeterminate[dayIndex[daykey]] = true
            setIndeterminate(arrIndeterminate)
          }else{
            arrCheckAll[dayIndex[daykey]] = false
            setCheckAll(arrCheckAll)
            arrIndeterminate[dayIndex[daykey]] = false
            setIndeterminate(arrIndeterminate)
          }
        }
      }
    },
    isEnabled: true
  })

  return (
    <>
      <Card type='inner'
        title={props.title && <>
          <span>{props.title}</span>
          {props.isShowTips &&
          (<Button type='link' onClick={() => setIsModalOpen(true)}>
            <UI.TipSpan>{$t({ defaultMessage: 'See tips' })}</UI.TipSpan>
          </Button>)}
        </>}
        extra={props.isShowTimezone && (<>
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
                <Col span={2} key={`col2_${item.key}_${i}`}>
                  <Checkbox
                    data-testid={`checkbox_${item.key}`}
                    indeterminate={indeterminate[i]}
                    onChange={onCheckAllChange}
                    checked={checkAll[i]}
                    key={`checkbox_${item.key}`}
                    value={item.key}
                    style={{ marginTop: i === 0 ? '35px': '5px', paddingRight: '5px' }}
                    disabled={disabled}
                  />
                  <UI.DaySpan>{$t({ defaultMessage: '{day}' }, { day: item.key })}</UI.DaySpan>
                </Col>
                <Col span={22} key={`col2_${item.key}`}>
                  { i === 0 &&
                          <div style={{ width: '100%', height: '25px', marginLeft: '-30px' }}>
                            {timeTicks.map((item: string, i: number) => {
                              return (
                                <UI.Timetick key={`timetick_${i}`}>{item}</UI.Timetick>
                              )
                            })}
                          </div>
                  }
                  { i === 0 &&
                          <div style={{ width: '980px', height: '5px' }}>
                            { Array(49).fill(0).map((_: number, i: number) => {
                              return (<UI.Timetickborder key={`timetick_div_${i}`} />)
                            }) }
                          </div>
                  }
                  <Form.Item
                    key={`checkboxGroup_form_${item.key}`}
                    name={[fieldName, item.key]}
                    children={
                      <UI.CheckboxGroup
                        key={`checkboxGroup_${item.key}`}
                        value={checkedList[i]}
                        onChange={onChange}
                        options={item.value.map((timeslot, i) => ({
                          label: <Tooltip
                            title={`${item.key}-${convertToTimeFromSlotIndex(i)}`}
                            className='channels'
                          >
                            <div
                              id={`${item.key}_${i}`}
                              data-testid={`${item.key}_${i}`}
                              style={{ width: '10px', height: '32px' }}
                            ></div>
                          </Tooltip>,
                          value: timeslot
                        }))}
                        disabled={disabled}
                      />
                    }
                  />
                  <DragSelection />
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
