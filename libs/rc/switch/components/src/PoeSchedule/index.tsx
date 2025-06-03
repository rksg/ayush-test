import { useEffect, useState } from 'react'

import { Button, Col, Form, FormInstance, Radio, RadioChangeEvent, Row, Space, Typography } from 'antd'
import { useIntl }                                                                          from 'react-intl'

import {
  Modal,
  parseNetworkVenueScheduler,
  ScheduleCard
} from '@acx-ui/components'
import { useIsSplitOn, Features }                                                     from '@acx-ui/feature-toggle'
import { useLazyGetTimezoneQuery, useLazyGetVenueQuery, useSavePortsSettingMutation } from '@acx-ui/rc/services'
import { allMultipleEditableFields, SwitchPortViewModel }                             from '@acx-ui/rc/switch/utils'
import { SchedulerTypeEnum, PoeSchedulerType }                                        from '@acx-ui/rc/utils'
import { useParams }                                                                  from '@acx-ui/react-router-dom'
import { Scheduler, SchedulerDeviceTypeEnum }                                         from '@acx-ui/types'

import * as UI from './styledComponents'

interface ScheduleWeeklyProps {
  form: FormInstance
  visible: boolean
  setVisible: (visible: boolean) => void
  venueId?: string
  poeScheduler: PoeSchedulerType
  readOnly?: boolean
  portData?: SwitchPortViewModel
}

interface ScheduleVenue {
  name: string
  latitude: string
  longitude: string
}

export const PoeSchedule = (props:ScheduleWeeklyProps) => {
  const { visible, setVisible, form, venueId, poeScheduler, readOnly, portData } = props
  const { $t } = useIntl()
  const { tenantId } = useParams()
  const [hidden, setHidden] = useState<boolean>(true)
  const [readOnlyMode, setReadOnlyMode] = useState<boolean>(readOnly || false)
  const [noTimeslotMsg, setNoTimeslotMsg] = useState<boolean>(false)
  const isMapEnabled = useIsSplitOn(Features.G_MAP)
  const [getTimezone] = useLazyGetTimezoneQuery()
  const [getVenue] = useLazyGetVenueQuery()
  const [venueData, setVenueData] = useState<ScheduleVenue>()
  const [schedule, setSchedule] = useState<Scheduler | undefined>(undefined)
  const [savePortsSetting] = useSavePortsSettingMutation()

  useEffect(() => {
    if(poeScheduler?.type === SchedulerTypeEnum.CUSTOM){
      setHidden(false)
      const schedulerData = parseNetworkVenueScheduler({ ...poeScheduler })
      setSchedule(schedulerData)
      form.setFieldValue('poeSchedulerType', SchedulerTypeEnum.CUSTOM)
    }

    const fetchVenueData = async () => {
      const result = await getVenue({ params: { tenantId, venueId } })
      if(result.data && result.data.address.latitude && result.data.address.longitude){
        setVenueData({
          name: result.data.name,
          latitude: result.data.address.latitude.toString(),
          longitude: result.data.address.longitude.toString()
        })
      }
    }
    fetchVenueData()
  }, [getVenue, tenantId, venueId, poeScheduler])

  const onTypeChange = (e: RadioChangeEvent) => {
    if(e.target.value === SchedulerTypeEnum.NO_SCHEDULE){
      setHidden(true)
    }else{
      setHidden(false)
    }
  }

  interface ScheduleData {
    [day: string]: string[];
  }

  interface TransformedScheduleData {
    [day: string]: string;
  }

  function transformScheduleData (data: ScheduleData): TransformedScheduleData {
    const transformedData: TransformedScheduleData = {}

    Object.keys(data).forEach((day) => {
      transformedData[day] = ''
      for (let i = 0; i < 24; i++) {
        transformedData[day] += data[day].filter(
          (hour) => hour.split('_')[1] === i.toString()).length > 0 ? '1' : '0'
      }
    })
    return transformedData
  }

  const onApply = async () => {
    const { scheduler, poeSchedulerType } = form.getFieldsValue()

    if (poeSchedulerType === SchedulerTypeEnum.NO_SCHEDULE) {
      form.resetFields(['poeScheduler'])
      form.setFieldValue('poeScheduler', { type: SchedulerTypeEnum.NO_SCHEDULE })
    } else if (poeSchedulerType === SchedulerTypeEnum.CUSTOM) {
      const hasAnyTimeSlot = Object.values(scheduler).some(daySlots =>
        Array.isArray(daySlots) && daySlots.length > 0
      )

      if (!hasAnyTimeSlot) {
        setNoTimeslotMsg(true)
        return
      }
      form.setFieldValue('poeScheduler',
        { type: SchedulerTypeEnum.CUSTOM, ...transformScheduleData(scheduler) })
    }
    if(portData){
      const payload = {
        port: portData.portIdentifier,
        ports: [portData.portIdentifier],
        switchId: portData.switchSerial,
        ignoreFields: allMultipleEditableFields.filter(
          f => !['poeScheduler'].includes(f)).join(','),
        poeScheduler: poeSchedulerType === SchedulerTypeEnum.NO_SCHEDULE ?
          { type: SchedulerTypeEnum.NO_SCHEDULE } :
          { type: SchedulerTypeEnum.CUSTOM, ...transformScheduleData(scheduler) }
      }
      await savePortsSetting({
        params: { tenantId, venueId },
        payload: [payload],
        enableRbac: true
      }).unwrap()
    }
    setVisible(false)
  }

  const onClose = () => {
    setVisible(false)
  }

  const footer = (
    readOnlyMode ? <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button
        data-testid='addButton'
        key='okBtn'
        type='primary'
        onClick={onClose}
      >
        {$t({ defaultMessage: 'OK' })}
      </Button>
    </Space> : <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <Button key='cancelBtn' onClick={onClose}>
        {$t({ defaultMessage: 'Cancel' })}
      </Button>
      <Button
        data-testid='addButton'
        key='okBtn'
        type='primary'
        onClick={onApply}
      >
        {$t({ defaultMessage: 'Apply' })}
      </Button>
    </Space>
  )

  return (
    <Modal
      title={readOnlyMode ?
        $t({ defaultMessage: 'Preview PoE Schedule' }) :
        $t({ defaultMessage: 'PoE Schedule ' })}
      visible={visible}
      width={850}
      footer={footer}
      maskClosable={true}
      destroyOnClose={true}
      keyboard={false}
      closable={true}
      onCancel={onClose}
    ><Form
        form={form}
        layout='horizontal'
        size='small'
      >
        <UI.ScheduleWrapper>
          <Row gutter={10} key={'row1'}>
            <Col span={6} key={'col1'}>
              <div style={{ marginTop: '1em', display: readOnlyMode ? 'none' : 'block' }}>
                <Form.Item
                  name={'poeSchedulerType'}
                  initialValue={SchedulerTypeEnum.NO_SCHEDULE}
                >
                  <Radio.Group onChange={onTypeChange}>
                    <Radio value={SchedulerTypeEnum.NO_SCHEDULE}>
                      {$t({ defaultMessage: 'No Schedule' })}
                    </Radio>

                    <Radio value={'CUSTOM'} style={{ marginTop: '1em' }}>
                      {$t({ defaultMessage: 'Custom Schedule' })}
                    </Radio>
                  </Radio.Group>
                </Form.Item>
              </div>
            </Col>
          </Row>
          <Row gutter={24}>
            <Col span={24}>
              <div style={{ marginBottom: '5px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  data-testid='editButton'
                  key='editBtn'
                  type='link'
                  onClick={() => setReadOnlyMode(false)}
                  hidden={!readOnlyMode}
                >
                  {$t({ defaultMessage: 'Edit PoE Schedule' })}
                </Button>
              </div>
            </Col>
            <Col span={24} key={'col1'}>
              {noTimeslotMsg &&
                <Typography.Text style={{ fontSize: '12px' }} type='danger'>
                  {$t({ defaultMessage: 'Please select at least 1 time slot' })}
                </Typography.Text>
              }
              {!hidden && <ScheduleCard
                type={'CUSTOM'}
                scheduler={schedule}
                lazyQuery={isMapEnabled ? getTimezone : undefined}
                form={form}
                fieldNamePath={['scheduler']}
                intervalUnit={60}
                title={readOnlyMode ? '' :
                  $t({ defaultMessage: 'Mark/ unmark areas to change PoE availability' })}
                loading={false}
                isShowTips={readOnlyMode ? false : true}
                prefix={true}
                timelineLabelTop={false}
                isShowTimezone={true}
                venue={venueData}
                readonly={readOnlyMode}
                disabled={false}
                deviceType={SchedulerDeviceTypeEnum.SWITCH}
              />
              }
            </Col>
          </Row>
        </UI.ScheduleWrapper>
      </Form>
    </Modal>
  )
}