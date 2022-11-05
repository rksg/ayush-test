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
import { useIntl } from 'react-intl'

import {
  Button,
  Modal
} from '@acx-ui/components'
import {
  NetworkVenue,
  NetworkSaveData,
  fetchVenueTimeZone,
  Venue,
  transformTimezoneDifference
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { CheckboxValueType }   from 'antd/es/checkbox/Group'

interface SchedulingModalProps extends AntdModalProps {
  networkVenue?: NetworkVenue
  venue?: Venue
  network?: NetworkSaveData | null
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
  useEffect(() => {
    // form.setFieldsValue(formInitData)
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
      form.setFieldValue(['scheduler', 'type'], networkVenue?.scheduler.type)
      setDisabled(networkVenue?.scheduler.type === 'ALWAYS_ON')

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let map: { [key: string]: any } = networkVenue?.scheduler
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
            }
            return false
          }).filter(Boolean)
          form.setFieldValue(['scheduler', key], selectedList)

          const index = dayIndex[key]
          arrCheckedList[index] = selectedList
          setCheckedList(arrCheckedList)

          arrCheckAll[index] = true
          setCheckAll(arrCheckAll)

          arrIndeterminate[index] = !!selectedList.length && selectedList.length < list.length
          setIndeterminate(arrIndeterminate)
        }
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
    for (let i = 1; i < 12; i++) {
      timeticks.push(i + ' AM')
    }
    timeticks.push('Noon')
    for (let i = 1; i < 12; i++) {
      timeticks.push(i + ' PM')
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
    // setCheckAll(list.length === availableLteBand4G.length)
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
        arrCheckAll[dayIndex[daykey]] = false
        setCheckAll(arrCheckAll)
        arrIndeterminate[dayIndex[daykey]] = false
        setIndeterminate(arrIndeterminate)
        form.setFieldValue(['scheduler', daykey], [])
      }
    }else{
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

  const handleCancel = () => {
    setIsModalOpen(false)
  }
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
      if(disabled){
        return
      }
      const scrollAwareBox: Box = {
        ...box,
        top: box.top + window.scrollY,
        left: box.left + window.scrollX
      }

      for (let daykey in dayIndex) {
        let selectedItems: string[] = []
        Array.from({ length: 96 }, (_, i) => {
          const item = document.getElementById(`${daykey}_${i}`)
          if(item){
            const { left, top, width, height } = item.getBoundingClientRect()
            const boxItem = { left, top, width, height }
            if (boxesIntersect(scrollAwareBox, boxItem)) {
              selectedItems.push(`${daykey}_${i}`)
            }
          }
        })
        const schedule = form.getFieldValue(['scheduler', daykey])
        form.setFieldValue(['scheduler', daykey], selectedItems)
        if(schedule && schedule.length === 96){
          arrCheckAll[dayIndex[daykey]] = true
          setCheckAll(arrCheckAll)
          arrIndeterminate[dayIndex[daykey]] = false
          setIndeterminate(arrIndeterminate)
        }else if(schedule && schedule.length > 0 && schedule.length < 96){
          arrIndeterminate[dayIndex[daykey]] = true
          setIndeterminate(arrIndeterminate)
        }else{
          arrCheckAll[dayIndex[daykey]] = false
          setCheckAll(arrCheckAll)
          arrIndeterminate[dayIndex[daykey]] = false
          setIndeterminate(arrIndeterminate)
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
        // subTitle={$t({ defaultMessage: 'Define how this network will be activated on venue "{venueName}"' }, { venueName: venueName })}
        okText={$t({ defaultMessage: 'Apply' })}
        maskClosable={false}
        keyboard={false}
        closable={false}
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
                <span>{$t({ defaultMessage: 'Network availability' })}</span>
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
                <Button type='link' onClick={showModal}>See tips</Button></>}
              extra={`Venue time zone: ${transformTimezoneDifference(timezone.dstOffset+timezone.rawOffset)} (${timezone.timeZoneName})`}>
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
                          style={{ marginTop: i === 0 ? '25px': '5px', paddingRight: '5px' }}
                          disabled={disabled}
                        />
                        {$t({ defaultMessage: '{day}' }, { day: item.key })}
                      </Col>
                      <Col span={22} key={`col2_${item.key}`}>
                        { i === 0 &&
                          <div style={{ width: '100%', height: '15px', marginLeft: '-15px' }}>
                            {timeTicks.map((item: string, i: number) => {
                              return (<UI.Timetick key={`timetick_${i}`}>{item}</UI.Timetick>)
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

      <Modal title='Network Scheduler Tips' width={800} visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>{$t({ defaultMessage: 'You can set custom schedule using the following options:' })}</p>
        <p>- {$t({ defaultMessage: 'Activate or deactivate the network for entire day' })}</p>
        <p>- {$t({ defaultMessage: 'Activate or deactivate the network for any time-slot by clicking on it' })}</p>
        <p>- {$t({ defaultMessage: 'Activate or deactivate the network for multiple adjacent time-slots by dragging your mouse over them' })}</p>
        <video preload='auto' controls>
          <source src='/assets/videos/scheduling/entireDay.mp4' type='video/mp4' />
        </video>
        <p>{$t({ defaultMessage: 'To set the network schedule for entire day use the checkbox next to it' })}</p>
        <video preload='auto' controls>
          <source src='/assets/videos/scheduling/partOfDay.mp4' type='video/mp4' />
        </video>
        <p>{$t({ defaultMessage: 'To set the network schedule for any time-slot, click the time slot' })}</p>
        <video preload='auto' controls>
          <source src='/assets/videos/scheduling/multipleDays.mp4' type='video/mp4' />
        </video>
        <p>- {$t({ defaultMessage: 'To set the network schedule for multiple adjacent time-slots, drag the mouse over them' })}</p>
        <p>- {$t({ defaultMessage: 'All the rectangles in the drag area will receive the same status – opposite the status of the rectangle where the drag started' })}</p>
      </Modal>
    </>
  )
}