/* eslint-disable max-len */
import { useEffect, useState, useRef, useMemo } from 'react'

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
import _           from 'lodash'
import { useIntl } from 'react-intl'
import ReactPlayer from 'react-player'

import {
  Button,
  Modal
} from '@acx-ui/components'
import { Features, useSplitTreatment } from '@acx-ui/feature-toggle'
import {
  RadioEnum,
  RadioTypeEnum,
  VLAN_PREFIX,
  NetworkVenue,
  NetworkApGroup,
  NetworkSaveData,
  VlanPool,
  VlanType,
  fetchVenueTimeZone,
  Venue,
  transformTimezoneDifference
} from '@acx-ui/rc/utils'

import * as UI from './styledComponents'

import type { CheckboxChangeEvent } from 'antd/es/checkbox'
import type { CheckboxValueType }   from 'antd/es/checkbox/Group'

export const getVlanString = (vlanPool?: VlanPool | null, vlanId?: number) => {
  let vlanPrefix = ''
  let vlanString
  let vlanType

  if (vlanPool) {
    vlanString = vlanPool.name
    vlanPrefix = VLAN_PREFIX.POOL
    vlanType = VlanType.Pool
  } else  {
    vlanString = vlanId
    vlanPrefix = VLAN_PREFIX.VLAN
    vlanType = VlanType.VLAN
  }

  return { vlanPrefix, vlanString, vlanType }
}

const isDisableAllAPs = (apGroups?: NetworkApGroup[]) => {
  if (!apGroups) {
    return false
  }
  return !apGroups.every(apGroup => !apGroup.validationError)
}

interface SchedulingModalProps extends AntdModalProps {
  networkVenue?: NetworkVenue
  venue?: Venue
  network?: NetworkSaveData | null
  formName: string
}

export interface VlanDate {
  vlanId?: number,
  vlanPool?: VlanPool | null,
  vlanType: VlanType
}

interface NetworkApGroupWithSelected extends NetworkApGroup {
  selected: boolean
}

interface Timezone {
  dstOffset: number,
  rawOffset: number,
  status: string,
  timeZoneId: string,
  timeZoneName: string
}

const defaultAG: NetworkApGroupWithSelected = {
  selected: true,
  apGroupId: '',
  apGroupName: '',
  isDefault: true,
  radio: RadioEnum.Both,
  radioTypes: [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz],
  vlanId: 1
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
  const triBandRadioFeatureFlag = useSplitTreatment(Features.TRI_RADIO)

  const [scheduleList, setScheduleList] = useState<schedule[]>([])
  const [checkedList, setCheckedList] = useState<CheckboxValueType[][]>([])
  const [indeterminate, setIndeterminate] = useState<boolean[]>([])
  const [checkAll, setCheckAll] = useState<boolean[]>([])
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

  const formInitData = useMemo(() => {
    // if specific AP groups were selected or the  All APs option is disabled,
    // then the "select specific AP group" option should be selected
    const isAllAps = networkVenue?.isAllApGroups !== false && !isDisableAllAPs(networkVenue?.apGroups)
    let apGroups: NetworkApGroupWithSelected[] = (networkVenue?.apGroups || []).map(ag => ({ ...ag, selected: true }))
    apGroups = _.isEmpty(apGroups) ? [defaultAG] : apGroups

    return {
      selectionType: isAllAps ? 0 : 1,
      allApGroupsRadioTypes: networkVenue?.allApGroupsRadioTypes || [RadioTypeEnum._2_4_GHz, RadioTypeEnum._5_GHz, RadioTypeEnum._6_GHz],
      apgroups: apGroups,
      apTags: []
    }
  }, [networkVenue])

  let tmpScheduleList: schedule[] = []
  const arrCheckedList = [...checkedList]
  const arrCheckAll = [...checkAll]
  const arrIndeterminate = [...indeterminate]
  useEffect(() => {
    // form.setFieldsValue(formInitData)
    const getTimeZone = async (venueLatitude: string, venueLongitude: string) => {
      const timeZone = await fetchVenueTimeZone(Number(venueLatitude), Number(venueLongitude))
      console.log(timeZone)
      setTimezone(timeZone)
    }

    if(networkVenue?.scheduler){
      form.setFieldValue(['scheduler', 'type'], networkVenue?.scheduler.type)

      let map: { [key: string]: any } = networkVenue?.scheduler
      for (let key in map) {
        if(key === 'type'){
          continue
        }
        if (map.hasOwnProperty(key)) {
          console.log({ key, value: map[key].split('').map((item: string, i: string) => `${key}_${i}`) })
          const list = map[key].split('').map((item: string, i: string) => `${key}_${i}`)
          tmpScheduleList.push({ key, value: list })
          const selectedList = map[key].split('').map(function (item: string, i: string) {
            if(item === '1'){
              return `${key}_${i}`
            }
            return false
          }).filter(Boolean)
          console.log(selectedList)
          form.setFieldValue(['scheduler', key], selectedList)
          console.log(key, selectedList.length === list.length)

          const index = dayIndex[key]
          arrCheckedList[index] = selectedList
          setCheckedList(arrCheckedList)

          arrCheckAll[index] = true
          setCheckAll(arrCheckAll)

          arrIndeterminate[index] = !!selectedList.length && selectedList.length < list.length
          setIndeterminate(arrIndeterminate)
          // setScheduleList([...scheduleList, ...[{ key, value: map[key].split('').map((item: string, i: string) => `${key}_${i}_${item}`) }]])
          // console.log(scheduleList)
        }
      }
      tmpScheduleList.sort(function sortByDay (a, b) {
        let day1 = a.key.toLowerCase()
        let day2 = b.key.toLowerCase()
        return dayIndex[day1] - dayIndex[day2]
      })
      setScheduleList(tmpScheduleList)

      venue && getTimeZone(venue.latitude.toString(), venue.longitude.toString())
    }
  }, [form, networkVenue?.scheduler])

  const [loading, setLoading] = useState(false)

  const onOk = () => {
    setLoading(true)
    form.submit()
  }

  let availableLteBand4G: string[] = []

  if(networkVenue?.scheduler?.mon){
    availableLteBand4G = networkVenue?.scheduler?.mon.split('').map((item, i) => `mon${i}`)
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

  const onRadioChange = (e: RadioChangeEvent) => {
    if(e.target.value){
      form.setFieldValue(['radioParamsDual5G', 'enabled'], true)
    }
  }

  const onChange = (list: CheckboxValueType[]) => {
    let index = dayIndex['mon']
    if(typeof list[0] === 'string'){
      index = dayIndex[list[0].split('_')[0]]
    }
    console.log(list)
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
      form.setFieldValue(['scheduler', e.target.value], scheduleList[index].value)
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
        // initialValues={formInitData}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        >
          <Row gutter={24} key={'row1'}>
            <Col span={4} key={'col1'}>
              <span>{$t({ defaultMessage: 'Network availability' })}</span>
              <div style={{ marginTop: '1em' }}>
                <Form.Item
                  name={['scheduler', 'type']}
                  initialValue={'ALWAYS_ON'}
                >
                  <Radio.Group>
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
            title={<><span>Mark/ unmark areas to change network availability  </span>
              <Button type='link' onClick={showModal}>See tips</Button></>}
            extra={`Venue time zone: ${transformTimezoneDifference(timezone.dstOffset+timezone.rawOffset)} (${timezone.timeZoneName})`}>
            <Spin spinning={loading}>
              {scheduleList && scheduleList.map((item, i) => (
                <Row gutter={24} key={`row2_${item.key}_${i}`}>
                  <Col span={2} key={`col2_${item.key}_${i}`}>
                    <Checkbox indeterminate={indeterminate[i]} onChange={onCheckAllChange} checked={checkAll[i]} key={`checkbox_${item.key}`} value={item.key} /> {item.key}
                  </Col>
                  <Col span={22} key={`col2_${item.key}`}>
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
                            ><div style={{ width: '10px', height: '46px' }}></div></Tooltip>,
                            value: timeslot
                          }))}
                        />
                      }
                    />
                  </Col>
                </Row>
              ))
              }
            </Spin>
          </Card>
        </Form>
      </Modal>

      <Modal title='Network Scheduler Tips' width={800} visible={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <p>You can set custom schedule using the following options:</p>
        <p>- Activate or deactivate the network for <b>entire day</b></p>
        <p>- Activate or deactivate the network for <b>any time-slot</b> by clicking on it</p>
        <p>- Activate or deactivate the network for <b>multiple adjacent time-slots</b> by dragging your mouse over them</p>
        <ReactPlayer
          url='scheduling/entireDay.mp4'
          controls={true}
        />
        <p>- To set the network schedule for <b>multiple adjacent time-slots</b>, drag the mouse over them</p>
        <p>- All the rectangles in the drag area will receive the same status – opposite the status of the rectangle where the drag started</p>
      </Modal>
    </>
  )
}