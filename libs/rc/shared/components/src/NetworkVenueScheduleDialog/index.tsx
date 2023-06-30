/* eslint-disable max-len */
import { useEffect, useState, useRef } from 'react'

import {
  Box,
  boxesIntersect,
  useSelectionContainer
} from '@air/react-drag-to-select'
import {
  ModalProps as AntdModalProps,
  Checkbox,
  Col,
  Form,
  Card,
  Row,
  Spin,
  Tooltip,
  Radio,
  RadioChangeEvent
} from 'antd'
import _                             from 'lodash'
import { FormattedMessage, useIntl } from 'react-intl'

import {
  Button,
  Modal
} from '@acx-ui/components'
import {
  NetworkVenue,
  fetchVenueTimeZone,
  transformTimezoneDifference,
  NetworkVenueScheduler,
  NetworkSaveData
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { CheckboxValueType }   from 'antd/es/checkbox/Group'

interface SchedulingModalProps extends AntdModalProps {
  networkVenue?: NetworkVenue
  venue?: {
    latitude: string,
    longitude: string,
    name: string
  }
  network?: { name: string } | null | NetworkSaveData
  formName: string
}

interface Timezone {
  dstOffset: number,
  rawOffset: number,
  status: string,
  timeZoneId: string,
  timeZoneName: string
}

interface schedule {
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

export function NetworkVenueScheduleDialog (props: SchedulingModalProps) {
  const { $t } = useIntl()

  const [scheduleList, setScheduleList] = useState<schedule[]>([])
  const [checkedList, setCheckedList] = useState<CheckboxValueType[][]>([])
  const [indeterminate, setIndeterminate] = useState<boolean[]>([])
  const [checkAll, setCheckAll] = useState<boolean[]>([])
  const [timeTicks, setTimeTicks] = useState<string[]>([])
  const [disabled, setDisabled] = useState<boolean>(true)
  const [timezone, setTimezone] = useState<Timezone>({
    dstOffset: 0,
    rawOffset: 0,
    status: '',
    timeZoneId: '',
    timeZoneName: ''
  })

  const { networkVenue, venue, network, formName } = props

  const [form] = Form.useForm()

  const open = !!props.visible

  // reset form fields when modal is closed
  const prevOpenRef = useRef(false)
  useEffect(() => {
    prevOpenRef.current = open
  }, [open])

  const prevOpen = prevOpenRef.current
  useEffect(() => {
    if (!open && prevOpen) {
      setLoading(false)
      form.resetFields()
    }
  }, [form, prevOpen, open])

  const arrCheckedList = [...checkedList]
  const arrCheckAll = [...checkAll]
  const arrIndeterminate = [...indeterminate]

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const initialValues = (scheduler: NetworkVenueScheduler) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: { [key: string]: any } = scheduler
    for (let key in map) {
      if(key === 'type'){
        if(map[key] === 'ALWAYS_ON'){
          for (let daykey in dayIndex) {
            form.setFieldValue(['scheduler', daykey], Array.from({ length: 96 }, (_, i) => `${daykey}_${i}` ))
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
        form.setFieldValue(['scheduler', key], selectedList)

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
    const getTimeZone = async (venueLatitude: string, venueLongitude: string) => {
      const timeZone = await fetchVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      setTimezone(timeZone)
    }

    if(networkVenue){
      setScheduleList(
        Object.keys(dayIndex).map((item: string) => {
          return { key: item, value: Array.from({ length: 96 }, (_, i) => `${item}_${i}`) }
        })
      )

      venue && getTimeZone(venue.latitude.toString(), venue.longitude.toString())

      _genTimeTicks()
    }

    if(networkVenue?.scheduler){
      if(networkVenue?.scheduler.type === 'CUSTOM'){
        setDisabled(false)
      }else{
        setDisabled(true)
      }

      form.setFieldValue(['scheduler', 'type'], networkVenue?.scheduler.type)

      initialValues(networkVenue?.scheduler)
    }

    if(networkVenue?.scheduler === undefined){
      setDisabled(true)
      for (let daykey in dayIndex) {
        form.setFieldValue(['scheduler', daykey], Array.from({ length: 96 }, (_, i) => `${daykey}_${i}` ))
        arrCheckAll[dayIndex[daykey]] = true
        setCheckAll(arrCheckAll)
      }
    }
  }, [form, networkVenue, networkVenue?.scheduler])

  const [loading, setLoading] = useState(false)

  const onOk = () => {
    setLoading(true)
    form.submit()
  }
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
      form.setFieldValue(['scheduler', e.target.value], Array.from({ length: 96 }, (_, i) => `${e.target.value}_${i}` ))
    }else{
      form.setFieldValue(['scheduler', e.target.value], [])
    }
    const arrCheckAll = [...checkAll]
    arrCheckAll[index] = e.target.checked
    setCheckAll(arrCheckAll)

    const arrIndeterminate = [...indeterminate]
    arrIndeterminate[index] = false
    setIndeterminate(arrIndeterminate)
  }

  const onTypeChange = (e: RadioChangeEvent) => {
    if(e.target.value === 'ALWAYS_ON'){
      setDisabled(true)
      for (let daykey in dayIndex) {
        form.setFieldValue(['scheduler', daykey], Array.from({ length: 96 }, (_, i) => `${daykey}_${i}` ))
        arrCheckAll[dayIndex[daykey]] = true
        setCheckAll(arrCheckAll)
        arrIndeterminate[dayIndex[daykey]] = false
        setIndeterminate(arrIndeterminate)
      }
    }else{
      initialValues(networkVenue?.scheduler as NetworkVenueScheduler)
      setDisabled(false)
    }
  }

  const [isModalOpen, setIsModalOpen] = useState(false)

  const showModal = () => {
    setIsModalOpen(true)
  }

  const handleOk = () => {
    setIsModalOpen(false)
  }

  let selectedItems: string[] = []
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
        const schedule = form.getFieldValue(['scheduler', daykey]) || []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if(selectedItems.filter((item: any) => item.indexOf(daykey) > -1)){
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          let uniqSchedule = _.uniq(_.xor(schedule, selectedItems.filter((item: any) => item.indexOf(daykey) > -1)))

          form.setFieldValue(['scheduler', daykey], uniqSchedule)
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
      <Modal
        {...props}
        title={$t({ defaultMessage: 'Schedule for Network "{NetworkName}" in Venue "{VenueName}"' }, { NetworkName: network?.name, VenueName: venue?.name })}
        okText={$t({ defaultMessage: 'Apply' })}
        maskClosable={true}
        keyboard={false}
        closable={true}
        width={1280}
        onOk={onOk}
        okButtonProps={{ disabled: loading }}
        cancelButtonProps={{ disabled: loading }}
      >
        <Form
          form={form}
          layout='horizontal'
          size='small'
          name={formName}
        >
          <div className='non-selectable-area'>
            <Row gutter={24} key={'row1'}>
              <Col span={4} key={'col1'}>
                <UI.TitleSpan>{$t({ defaultMessage: 'Network availability' })}</UI.TitleSpan>
                <div style={{ marginTop: '1em' }}>
                  <Form.Item
                    name={['scheduler', 'type']}
                    initialValue={'ALWAYS_ON'}
                  >
                    <Radio.Group onChange={onTypeChange}>
                      <Radio value={'ALWAYS_ON'}>
                        {$t({ defaultMessage: '24/7' })}
                      </Radio>

                      <Radio value={'CUSTOM'} style={{ marginTop: '1em' }}>
                        {$t({ defaultMessage: 'Custom Schedule' })}
                      </Radio>
                    </Radio.Group>
                  </Form.Item>
                </div>
              </Col>
            </Row>
            <Card type='inner'
              title={<><span>{$t({ defaultMessage: 'Mark/ unmark areas to change network availability' })}</span>
                <Button type='link' onClick={showModal}><UI.TipSpan>See tips</UI.TipSpan></Button></>}
              extra={<>Venue time zone: <b>{transformTimezoneDifference(timezone.dstOffset+timezone.rawOffset)} ({timezone.timeZoneName})</b></>}
              style={{ pointerEvents: ( disabled ? 'none' : 'auto' ), opacity: ( disabled ? '0.5' : '1.0' ) }}
            >
              <Spin spinning={loading}>
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
                          name={['scheduler', item.key]}
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
          </div>
        </Form>
      </Modal>

      <Modal
        title='Network Scheduler Tips'
        width={800}
        cancelButtonProps={{ style: { display: 'none' } }}
        visible={isModalOpen}
        onOk={handleOk}
        maskClosable={false}
        keyboard={false}
        closable={false}
      >
        <p>{$t({ defaultMessage: 'You can set custom schedule using the following options:' })}</p>
        <p>- <FormattedMessage
          defaultMessage='Activate or deactivate the network for <b>entire day</b>'
          values={{
            b: (contents) => <b>{contents}</b>
          }}
        />
        </p>
        <p>- <FormattedMessage
          defaultMessage='Activate or deactivate the network for <b>any time-slot</b> by clicking on it'
          values={{
            b: (contents) => <b>{contents}</b>
          }}
        />
        </p>
        <p>- <FormattedMessage
          defaultMessage='Activate or deactivate the network for <b>multiple adjacent time-slots</b> by dragging your mouse over them'
          values={{
            b: (contents) => <b>{contents}</b>
          }}
        />
        </p>
        <video preload='auto' controls>
          <source src='./assets/videos/scheduling/entireDay.mp4' type='video/mp4' />
        </video>
        <p>{$t({ defaultMessage: 'To set the network schedule for entire day use the checkbox next to it' })}</p>
        <video preload='auto' controls>
          <source src='./assets/videos/scheduling/partOfDay.mp4' type='video/mp4' />
        </video>
        <p>{$t({ defaultMessage: 'To set the network schedule for any time-slot, click the time slot' })}</p>
        <video preload='auto' controls>
          <source src='./assets/videos/scheduling/multipleDays.mp4' type='video/mp4' />
        </video>
        <p>- <FormattedMessage
          defaultMessage='To set the network schedule for <b>multiple adjacent time-slots</b>, drag the mouse over them'
          values={{
            b: (contents) => <b>{contents}</b>
          }}
        />
        </p>
        <p>- {$t({ defaultMessage: 'All the rectangles in the drag area will receive the same status – opposite the status of the rectangle where the drag started' })}</p>
      </Modal>
    </>
  )
}